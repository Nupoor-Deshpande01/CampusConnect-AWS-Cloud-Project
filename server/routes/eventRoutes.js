import { Router } from 'express';
import { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventRegistrations,
  getOrganizerStats
} from '../controllers/eventController.js';
import { 
  registerForEvent, 
  cancelRegistration 
} from '../controllers/registrationController.js';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * Public & Discoverable Routes (with optional auth context)
 */
// GET /api/v1/events - List events (paginated, searched, filtered)
router.get('/', optionalAuthenticate, getEvents);

// GET /api/v1/events/stats/organizer - Aggregated metrics for organizer dashboard
router.get('/stats/organizer', authenticate, authorize('organizer', 'admin'), getOrganizerStats);

// GET /api/v1/events/:id - Get single event detail (unpublished requires organizer/admin)
router.get('/:id', optionalAuthenticate, getEventById);

/**
 * Student Event Registration Routes
 */
// POST /api/v1/events/:id/register - Student registration with concurrency lock & capacity check
router.post('/:id/register', authenticate, registerForEvent);

// DELETE /api/v1/events/:id/register - Student registration cancellation
router.delete('/:id/register', authenticate, cancelRegistration);

/**
 * Organizer & Admin Event Management Routes
 */
// POST /api/v1/events - Create new event
router.post('/', authenticate, authorize('organizer', 'admin'), createEvent);

// PUT /api/v1/events/:id - Edit existing event (ownership check enforced)
router.put('/:id', authenticate, authorize('organizer', 'admin'), updateEvent);

// DELETE /api/v1/events/:id - Delete event (ownership check enforced)
router.delete('/:id', authenticate, authorize('organizer', 'admin'), deleteEvent);

// GET /api/v1/events/:id/registrations - View attendees for an event (ownership check enforced)
router.get('/:id/registrations', authenticate, authorize('organizer', 'admin'), getEventRegistrations);

export default router;
