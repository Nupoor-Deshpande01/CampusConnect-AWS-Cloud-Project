import { pool } from '../config/db.js';

/**
 * POST /api/v1/events/:id/register
 * Register authenticated student for an event.
 * Uses MySQL transactions with exclusive row-level locking (FOR UPDATE)
 * to strictly prevent overbooking and race conditions under concurrent requests.
 */
export const registerForEvent = async (req, res, next) => {
  const { id } = req.params;
  const eventId = parseInt(id, 10);

  if (isNaN(eventId) || eventId <= 0) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid event ID format.'
    });
  }

  // 1. Role Authorization: Only students may register through the student workflow
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      statusCode: 403,
      message: 'Only students are eligible to register for campus events. Organizers and administrators cannot register through the student workflow.'
    });
  }

  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    // Start database transaction
    await connection.beginTransaction();

    // 2. Lock the event record with exclusive row-level lock
    const [eventRows] = await connection.query(
      `SELECT 
         id, 
         title, 
         category, 
         venue, 
         start_datetime, 
         end_datetime, 
         registration_deadline, 
         capacity, 
         status 
       FROM events 
       WHERE id = ? 
       FOR UPDATE`,
      [eventId]
    );

    if (eventRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Event not found.'
      });
    }

    const event = eventRows[0];

    // 3. Reject registrations for unpublished, cancelled, or completed events
    if (event.status !== 'published') {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: `Cannot register for this event: Event status is '${event.status}'. Only published events accept registrations.`
      });
    }

    const now = new Date();

    // 4. Reject if event has already started or concluded
    if (now >= new Date(event.start_datetime)) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Registration is closed. The event has already started or concluded.'
      });
    }

    // 5. Enforce registration deadline
    if (now > new Date(event.registration_deadline)) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Registration deadline has passed for this event.'
      });
    }

    // 6. Prevent duplicate registration: check existing registration for this user
    const [existingRegRows] = await connection.query(
      'SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ? FOR UPDATE',
      [userId, eventId]
    );

    if (existingRegRows.length > 0 && existingRegRows[0].status === 'confirmed') {
      await connection.rollback();
      return res.status(409).json({
        status: 'error',
        statusCode: 409,
        message: 'You are already registered for this event.'
      });
    }

    // 7. Check current confirmed registrations count under lock
    const [countRows] = await connection.query(
      'SELECT COUNT(*) AS activeCount FROM registrations WHERE event_id = ? AND status = "confirmed" FOR UPDATE',
      [eventId]
    );

    const currentCount = countRows[0]?.activeCount || 0;
    if (currentCount >= event.capacity) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Event has reached full capacity. No seats available.'
      });
    }

    // 8. Insert new registration or reactivate previously cancelled registration
    let registrationId;
    if (existingRegRows.length > 0) {
      registrationId = existingRegRows[0].id;
      await connection.query(
        'UPDATE registrations SET status = "confirmed", registered_at = CURRENT_TIMESTAMP WHERE id = ?',
        [registrationId]
      );
    } else {
      const [insertResult] = await connection.query(
        'INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, "confirmed")',
        [userId, eventId]
      );
      registrationId = insertResult.insertId;
    }

    // Commit transaction
    await connection.commit();

    const remainingSeats = Math.max(0, event.capacity - (currentCount + 1));

    return res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: `Registration confirmed for "${event.title}". Spot reserved successfully!`,
      data: {
        registration: {
          id: registrationId,
          userId,
          eventId: event.id,
          eventTitle: event.title,
          category: event.category,
          venue: event.venue,
          start_datetime: event.start_datetime,
          status: 'confirmed',
          remainingSeats
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * DELETE /api/v1/events/:id/register
 * Cancel student's event registration.
 *
 * Cancellation Rule:
 * Students may cancel their registration at any time BEFORE the event start datetime.
 * Once the event has started or concluded, registrations cannot be cancelled.
 */
export const cancelRegistration = async (req, res, next) => {
  const { id } = req.params;
  const eventId = parseInt(id, 10);

  if (isNaN(eventId) || eventId <= 0) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid event ID format.'
    });
  }

  // Only students can cancel via student workflow
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      statusCode: 403,
      message: 'Only students may cancel registrations via this endpoint.'
    });
  }

  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch active confirmed registration and event timing
    const [rows] = await connection.query(
      `SELECT 
         r.id AS registration_id, 
         r.status AS registration_status, 
         r.registered_at, 
         e.id AS event_id, 
         e.title AS event_title, 
         e.start_datetime, 
         e.capacity
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? AND r.event_id = ? 
       FOR UPDATE`,
      [userId, eventId]
    );

    if (rows.length === 0 || rows[0].registration_status !== 'confirmed') {
      await connection.rollback();
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'No active confirmed registration found for this event.'
      });
    }

    const reg = rows[0];
    const now = new Date();

    // 2. Cancellation Rule Check: Cannot cancel after the event has started
    if (now >= new Date(reg.start_datetime)) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Registration cancellation rule: You cannot cancel a registration after the event has already started.'
      });
    }

    // 3. Mark registration as cancelled
    await connection.query(
      'UPDATE registrations SET status = "cancelled" WHERE id = ?',
      [reg.registration_id]
    );

    await connection.commit();

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Registration for "${reg.event_title}" has been successfully cancelled. Your seat has been released.`,
      data: {
        registrationId: reg.registration_id,
        eventId: reg.event_id,
        eventTitle: reg.event_title,
        status: 'cancelled'
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * GET /api/v1/registrations/me
 * Retrieve authenticated student's registrations list with timeline categories
 * (upcoming, completed, and cancelled) and summary metrics.
 */
export const getMyRegistrations = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Only authenticated students can access the student registrations portal.'
      });
    }

    const userId = req.user.id;

    const sql = `
      SELECT 
        r.id AS registration_id,
        r.status AS registration_status,
        r.registered_at,
        r.updated_at,
        e.id AS event_id,
        e.title AS event_title,
        e.description AS event_description,
        e.category AS event_category,
        e.venue AS event_venue,
        e.start_datetime,
        e.end_datetime,
        e.registration_deadline,
        e.capacity AS event_capacity,
        e.poster_url,
        e.status AS event_status,
        u.name AS organizer_name,
        u.email AS organizer_email,
        CASE
          WHEN r.status = 'cancelled' THEN 'cancelled'
          WHEN e.end_datetime < NOW() OR r.status = 'attended' THEN 'completed'
          ELSE 'upcoming'
        END AS timeline_status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.user_id = ?
      ORDER BY 
        CASE 
          WHEN r.status = 'confirmed' AND e.end_datetime >= NOW() THEN 0 
          WHEN r.status = 'confirmed' AND e.end_datetime < NOW() THEN 1 
          ELSE 2 
        END,
        e.start_datetime ASC
    `;

    const [rows] = await pool.query(sql, [userId]);

    // Compute summary metrics
    let upcomingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    rows.forEach(reg => {
      if (reg.timeline_status === 'upcoming') upcomingCount++;
      else if (reg.timeline_status === 'completed') completedCount++;
      else if (reg.timeline_status === 'cancelled') cancelledCount++;
    });

    return res.status(200).json({
      status: 'success',
      statusCode: 200,
      data: {
        registrations: rows,
        summary: {
          total: rows.length,
          upcoming: upcomingCount,
          completed: completedCount,
          cancelled: cancelledCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
