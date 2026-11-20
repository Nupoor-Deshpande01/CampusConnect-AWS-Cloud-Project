import { pool } from '../config/db.js';
import { 
  validateEventPayload, 
  formatToMySQLDateTime, 
  ALLOWED_CATEGORIES, 
  ALLOWED_STATUSES 
} from '../utils/eventValidation.js';

/**
 * GET /api/v1/events
 * List events with pagination, search, category filtering, and sorting.
 * Public users may only see published events.
 * Organizers can see all statuses for their own events when requesting my_events=true.
 */
export const getEvents = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { search, category, sort, organizer_id, status, my_events } = req.query;

    const conditions = [];
    const params = [];

    // Determine access level for unpublished vs published events
    const isAuthedOrganizer = req.user && (req.user.role === 'organizer' || req.user.role === 'admin');
    const isRequestingMyEvents = isAuthedOrganizer && (my_events === 'true' || (organizer_id && Number(organizer_id) === req.user.id));
    const isAdmin = req.user && req.user.role === 'admin';

    if (isRequestingMyEvents) {
      conditions.push('e.organizer_id = ?');
      params.push(req.user.id);

      // Organizers may optionally filter by status on their own events
      if (status && ALLOWED_STATUSES.includes(status)) {
        conditions.push('e.status = ?');
        params.push(status);
      }
    } else if (isAdmin) {
      if (organizer_id) {
        conditions.push('e.organizer_id = ?');
        params.push(Number(organizer_id));
      }
      if (status && ALLOWED_STATUSES.includes(status)) {
        conditions.push('e.status = ?');
        params.push(status);
      }
    } else {
      // Public, unauthenticated, student, or viewing other organizers:
      // STRICTLY limit to published events only!
      conditions.push("e.status = 'published'");
      if (organizer_id) {
        conditions.push('e.organizer_id = ?');
        params.push(Number(organizer_id));
      }
    }

    // Category filter
    if (category && category !== 'All') {
      if (ALLOWED_CATEGORIES.includes(category)) {
        conditions.push('e.category = ?');
        params.push(category);
      }
    }

    // Search query across title, description, or venue
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting logic
    let orderByClause = 'ORDER BY e.start_datetime ASC';
    switch (sort) {
      case 'date_desc':
        orderByClause = 'ORDER BY e.start_datetime DESC';
        break;
      case 'capacity_asc':
        orderByClause = 'ORDER BY e.capacity ASC';
        break;
      case 'capacity_desc':
        orderByClause = 'ORDER BY e.capacity DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY e.created_at DESC';
        break;
      case 'date_asc':
      default:
        orderByClause = 'ORDER BY e.start_datetime ASC';
        break;
    }

    // 1. Get total matching count for pagination
    const countSql = `
      SELECT COUNT(*) AS total
      FROM events e
      ${whereClause}
    `;
    const [countRows] = await pool.query(countSql, params);
    const totalItems = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    // 2. Fetch paginated records with organizer metadata & attendee counts
    const dataSql = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.venue,
        e.start_datetime,
        e.end_datetime,
        e.registration_deadline,
        e.capacity,
        e.poster_url,
        e.status,
        e.organizer_id,
        e.created_at,
        e.updated_at,
        u.name AS organizer_name,
        u.email AS organizer_email,
        (
          SELECT COUNT(*) 
          FROM registrations r 
          WHERE r.event_id = e.id AND r.status = 'confirmed'
        ) AS registration_count
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    // mysql2 requires numbers for limit and offset
    const [events] = await pool.query(dataSql, [...params, limit, offset]);

    res.status(200).json({
      status: 'success',
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events/:id
 * Retrieve single event details.
 * Public users can only view published events.
 * Unpublished/draft events require owner organizer or admin.
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid event ID format.'
      });
    }

    const sql = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.category,
        e.venue,
        e.start_datetime,
        e.end_datetime,
        e.registration_deadline,
        e.capacity,
        e.poster_url,
        e.status,
        e.organizer_id,
        e.created_at,
        e.updated_at,
        u.name AS organizer_name,
        u.email AS organizer_email,
        (
          SELECT COUNT(*) 
          FROM registrations r 
          WHERE r.event_id = e.id AND r.status = 'confirmed'
        ) AS registration_count,
        (
          SELECT COUNT(*) 
          FROM registrations r 
          WHERE r.event_id = e.id AND r.user_id = ? AND r.status = 'confirmed'
        ) > 0 AS is_registered
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `;

    const authUserId = req.user ? req.user.id : 0;
    const [rows] = await pool.query(sql, [authUserId, eventId]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Event not found.'
      });
    }

    const event = rows[0];

    // If unpublished/draft, ensure user is either the organizer owner or admin
    if (event.status !== 'published') {
      const isAuthorized = req.user && (
        req.user.role === 'admin' || 
        (req.user.role === 'organizer' && req.user.id === event.organizer_id)
      );

      if (!isAuthorized) {
        return res.status(404).json({
          status: 'error',
          statusCode: 404,
          message: 'Event not found.'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/events
 * Create new event. Authorized organizers and admins only.
 * Derives organizer_id from authenticated session (unless admin specifies).
 */
export const createEvent = async (req, res, next) => {
  try {
    const validationErrors = validateEventPayload(req.body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    const {
      title,
      description,
      category,
      venue,
      start_datetime,
      end_datetime,
      registration_deadline,
      capacity,
      poster_url,
      status
    } = req.body;

    // Organizers can only create events for themselves; admins can optionally specify organizer_id
    let organizerId = req.user.id;
    if (req.user.role === 'admin' && req.body.organizer_id) {
      organizerId = parseInt(req.body.organizer_id, 10);
    }

    const formattedStart = formatToMySQLDateTime(start_datetime);
    const formattedEnd = formatToMySQLDateTime(end_datetime);
    const formattedDeadline = formatToMySQLDateTime(registration_deadline);
    const eventStatus = status || 'published';
    const poster = poster_url && poster_url.trim() ? poster_url.trim() : null;

    const insertSql = `
      INSERT INTO events (
        title,
        description,
        category,
        venue,
        start_datetime,
        end_datetime,
        registration_deadline,
        capacity,
        poster_url,
        status,
        organizer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertSql, [
      title.trim(),
      description.trim(),
      category,
      venue.trim(),
      formattedStart,
      formattedEnd,
      formattedDeadline,
      parseInt(capacity, 10),
      poster,
      eventStatus,
      organizerId
    ]);

    const createdId = result.insertId;

    // Fetch newly created record
    const [createdRows] = await pool.query(
      `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email, 0 AS registration_count
       FROM events e 
       JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ?`,
      [createdId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully.',
      data: {
        event: createdRows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/events/:id
 * Update existing event.
 * Only the owning organizer or an admin may update.
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid event ID format.'
      });
    }

    // 1. Fetch existing event
    const [existingRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existingRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Event not found.'
      });
    }

    const existingEvent = existingRows[0];

    // 2. Authorization check: Organizers may edit only their own events
    if (req.user.role !== 'admin' && existingEvent.organizer_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You are only authorized to edit your own events.'
      });
    }

    // 3. Validation for update payload
    const validationErrors = validateEventPayload(req.body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: validationErrors[0],
        errors: validationErrors
      });
    }

    // Merge effective dates for chronological validation
    const effectiveStart = req.body.start_datetime 
      ? new Date(req.body.start_datetime) 
      : new Date(existingEvent.start_datetime);

    const effectiveEnd = req.body.end_datetime 
      ? new Date(req.body.end_datetime) 
      : new Date(existingEvent.end_datetime);

    const effectiveDeadline = req.body.registration_deadline 
      ? new Date(req.body.registration_deadline) 
      : new Date(existingEvent.registration_deadline);

    if (effectiveEnd <= effectiveStart) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'End date and time must be strictly after the start date and time.'
      });
    }

    if (effectiveDeadline > effectiveStart) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Registration deadline must be on or before the event start date and time.'
      });
    }

    // 4. Build parameterized update
    const updatedTitle = req.body.title !== undefined ? req.body.title.trim() : existingEvent.title;
    const updatedDescription = req.body.description !== undefined ? req.body.description.trim() : existingEvent.description;
    const updatedCategory = req.body.category !== undefined ? req.body.category : existingEvent.category;
    const updatedVenue = req.body.venue !== undefined ? req.body.venue.trim() : existingEvent.venue;
    const updatedStart = req.body.start_datetime !== undefined ? formatToMySQLDateTime(req.body.start_datetime) : formatToMySQLDateTime(existingEvent.start_datetime);
    const updatedEnd = req.body.end_datetime !== undefined ? formatToMySQLDateTime(req.body.end_datetime) : formatToMySQLDateTime(existingEvent.end_datetime);
    const updatedDeadline = req.body.registration_deadline !== undefined ? formatToMySQLDateTime(req.body.registration_deadline) : formatToMySQLDateTime(existingEvent.registration_deadline);
    const updatedCapacity = req.body.capacity !== undefined ? parseInt(req.body.capacity, 10) : existingEvent.capacity;
    const updatedPoster = req.body.poster_url !== undefined ? (req.body.poster_url ? req.body.poster_url.trim() : null) : existingEvent.poster_url;
    const updatedStatus = req.body.status !== undefined ? req.body.status : existingEvent.status;

    const updateSql = `
      UPDATE events SET
        title = ?,
        description = ?,
        category = ?,
        venue = ?,
        start_datetime = ?,
        end_datetime = ?,
        registration_deadline = ?,
        capacity = ?,
        poster_url = ?,
        status = ?
      WHERE id = ?
    `;

    await pool.query(updateSql, [
      updatedTitle,
      updatedDescription,
      updatedCategory,
      updatedVenue,
      updatedStart,
      updatedEnd,
      updatedDeadline,
      updatedCapacity,
      updatedPoster,
      updatedStatus,
      eventId
    ]);

    // Fetch updated record
    const [updatedRows] = await pool.query(
      `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email,
        (
          SELECT COUNT(*) 
          FROM registrations r 
          WHERE r.event_id = e.id AND r.status = 'confirmed'
        ) AS registration_count
       FROM events e 
       JOIN users u ON e.organizer_id = u.id 
       WHERE e.id = ?`,
      [eventId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Event updated successfully.',
      data: {
        event: updatedRows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/events/:id
 * Delete existing event.
 * Only the owning organizer or an admin may delete.
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid event ID format.'
      });
    }

    // 1. Check existing event
    const [rows] = await pool.query('SELECT id, title, organizer_id FROM events WHERE id = ?', [eventId]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Event not found.'
      });
    }

    const event = rows[0];

    // 2. Authorization check: Organizers may delete only their own events
    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You are only authorized to delete your own events.'
      });
    }

    // 3. Delete event (foreign keys to registrations cascade on delete)
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.status(200).json({
      status: 'success',
      message: `Event "${event.title}" has been deleted successfully.`,
      data: {
        deletedId: eventId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events/:id/registrations
 * Retrieve attendee registration list for an event.
 * Only the owning organizer or an admin may access.
 */
export const getEventRegistrations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Invalid event ID format.'
      });
    }

    // 1. Fetch event
    const [eventRows] = await pool.query(
      'SELECT id, title, capacity, organizer_id, status FROM events WHERE id = ?', 
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Event not found.'
      });
    }

    const event = eventRows[0];

    // 2. Ownership check
    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You are only authorized to view registrations for your own events.'
      });
    }

    // 3. Fetch registrations joined with users
    const [registrations] = await pool.query(
      `SELECT 
         r.id,
         r.user_id,
         r.status,
         r.registered_at,
         r.updated_at,
         u.name AS user_name,
         u.email AS user_email
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?
       ORDER BY r.registered_at DESC`,
      [eventId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        eventId: event.id,
        eventTitle: event.title,
        capacity: event.capacity,
        totalRegistrations: registrations.length,
        registrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/events/stats/organizer
 * Aggregated statistics for the authenticated organizer dashboard:
 * Event counts (total, published, draft, cancelled, completed) and capacity/registrations
 */
export const getOrganizerStats = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const whereClause = isAdmin ? '' : 'WHERE organizer_id = ?';
    const params = isAdmin ? [] : [organizerId];

    const statsSql = `
      SELECT 
        COUNT(*) AS totalEvents,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS publishedEvents,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draftEvents,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledEvents,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedEvents,
        COALESCE(SUM(capacity), 0) AS totalCapacity
      FROM events
      ${whereClause}
    `;

    const [statsRows] = await pool.query(statsSql, params);

    // Get total confirmed registrations across organizer's events
    const regSql = `
      SELECT COUNT(*) AS totalRegistrations
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      ${whereClause} AND r.status = 'confirmed'
    `;
    const [regRows] = await pool.query(regSql, params);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalEvents: Number(statsRows[0]?.totalEvents || 0),
          publishedEvents: Number(statsRows[0]?.publishedEvents || 0),
          draftEvents: Number(statsRows[0]?.draftEvents || 0),
          cancelledEvents: Number(statsRows[0]?.cancelledEvents || 0),
          completedEvents: Number(statsRows[0]?.completedEvents || 0),
          totalCapacity: Number(statsRows[0]?.totalCapacity || 0),
          totalRegistrations: Number(regRows[0]?.totalRegistrations || 0)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
