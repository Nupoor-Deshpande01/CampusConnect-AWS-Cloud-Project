import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('--- Starting CampusConnect Student Registration API Tests ---');
  let passCount = 0;
  let failCount = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passCount++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.message}`);
      failCount++;
    }
  };

  // Helper: Login
  const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Login failed for ${email}: ${data.message}`);
    return { token: data.data.token, user: data.data.user };
  };

  // Helper: Create unique student
  const signupStudent = async (prefix = 'stud') => {
    const email = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.edu`;
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Student ${prefix}`, email, password: 'password123' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Student signup failed: ${data.message}`);
    return { token: data.data.token, user: data.data.user };
  };

  const organizerSession = await login('turing@campusconnect.edu', 'organizer123');
  const student1 = await signupStudent('alpha');
  const student2 = await signupStudent('beta');

  console.log('Sessions acquired: Org (id: %s), Student 1 (id: %s), Student 2 (id: %s)\n',
    organizerSession.user.id, student1.user.id, student2.user.id
  );

  // Helper: Create event with custom properties
  const createTestEvent = async (overrides = {}) => {
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const defaultEnd = new Date(defaultStart.getTime() + 4 * 60 * 60 * 1000);
    const defaultDeadline = new Date(defaultStart.getTime() - 24 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const payload = {
      title: `Test Event ${Date.now()}`,
      description: 'Integration test event for student registration workflows.',
      category: 'Technical',
      venue: 'Lab 202, Engineering Wing',
      start_datetime: fmt(defaultStart),
      end_datetime: fmt(defaultEnd),
      registration_deadline: fmt(defaultDeadline),
      capacity: 100,
      status: 'published',
      ...overrides
    };

    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerSession.token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Event creation failed: ${data.message}`);
    return data.data.event;
  };

  // --- Test Suite 1: Authentication & Role Permissions ---
  await test('Unauthenticated POST /events/:id/register is rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/events/1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(res.status, 401);
  });

  await test('Organizer role POST /events/:id/register is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events/1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${organizerSession.token}`
      }
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('Only students are eligible'));
  });

  // --- Test Suite 2: Successful Registration & Available Seats ---
  const standardEvent = await createTestEvent({ capacity: 50 });

  await test('Student 1 successfully registers for published event (201 Created)', async () => {
    const res = await fetch(`${BASE_URL}/events/${standardEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.registration.eventId, standardEvent.id);
    assert.strictEqual(body.data.registration.userId, student1.user.id);
    assert.strictEqual(body.data.registration.status, 'confirmed');
    assert.strictEqual(body.data.registration.remainingSeats, 49);
  });

  // --- Test Suite 3: Duplicate Registration Prevention ---
  await test('Duplicate registration by Student 1 is rejected with 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/events/${standardEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.ok(body.message.includes('already registered'));
  });

  // --- Test Suite 4: Registration Deadline & Status Constraints ---
  await test('Registration rejected when deadline has passed (400 Bad Request)', async () => {
    // Event with deadline 1 hour in the past (start time in future)
    const now = new Date();
    const pastDeadline = new Date(now.getTime() - 60 * 60 * 1000);
    const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const futureEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    const expiredDeadlineEvent = await createTestEvent({
      registration_deadline: fmt(pastDeadline),
      start_datetime: fmt(futureStart),
      end_datetime: fmt(futureEnd)
    });

    const res = await fetch(`${BASE_URL}/events/${expiredDeadlineEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student2.token}`
      }
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('deadline has passed'));
  });

  await test('Registration rejected for unpublished draft event (400 Bad Request)', async () => {
    const draftEvent = await createTestEvent({ status: 'draft' });
    const res = await fetch(`${BASE_URL}/events/${draftEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes("status is 'draft'"));
  });

  // --- Test Suite 5: Capacity Enforcement & Full Event Rejection ---
  await test('Event with capacity 1 rejects second registrant when full (400 Bad Request)', async () => {
    const microEvent = await createTestEvent({ capacity: 1 });

    // Student 1 claims the single seat
    const res1 = await fetch(`${BASE_URL}/events/${microEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res1.status, 201);

    // Student 2 attempts to register for full event
    const res2 = await fetch(`${BASE_URL}/events/${microEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student2.token}`
      }
    });
    assert.strictEqual(res2.status, 400);
    const body = await res2.json();
    assert.ok(body.message.includes('full capacity'));
  });

  // --- Test Suite 6: Registration Cancellation Workflow & Re-registration ---
  await test('Student 1 successfully cancels active registration (200 OK, releases seat)', async () => {
    const res = await fetch(`${BASE_URL}/events/${standardEvent.id}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.status, 'cancelled');
  });

  await test('Attempting to re-cancel an already cancelled registration returns 404', async () => {
    const res = await fetch(`${BASE_URL}/events/${standardEvent.id}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 404);
  });

  await test('Student 1 re-registers for event after cancelling (201 Created)', async () => {
    const res = await fetch(`${BASE_URL}/events/${standardEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.data.registration.status, 'confirmed');
  });

  // --- Test Suite 7: Cancellation Rule Enforcement (Started Event) ---
  await test('Cancellation rejected if event has already started (400 Bad Request)', async () => {
    // Simulate past event by updating start_datetime in database or creating event with past start
    const now = new Date();
    const pastStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const futureEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    // Create event with future dates first, register student, then update start to past
    const ongoingEvent = await createTestEvent();
    await fetch(`${BASE_URL}/events/${ongoingEvent.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${student2.token}`
      }
    });

    // Update event start_datetime to past in DB to test cancellation rule
    const { pool } = await import('./config/db.js');
    await pool.query('UPDATE events SET start_datetime = ? WHERE id = ?', [fmt(pastStart), ongoingEvent.id]);

    // Attempt cancellation
    const res = await fetch(`${BASE_URL}/events/${ongoingEvent.id}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${student2.token}`
      }
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('after the event has already started'));
  });

  // --- Test Suite 8: Concurrent Registrations & Overbooking Prevention ---
  await test('Concurrent registration flood on 2-seat capacity guarantees exact capacity without overbooking', async () => {
    const contestedEvent = await createTestEvent({ capacity: 2 });

    // Spawn 8 unique students
    const studentList = await Promise.all([
      signupStudent('c1'),
      signupStudent('c2'),
      signupStudent('c3'),
      signupStudent('c4'),
      signupStudent('c5'),
      signupStudent('c6'),
      signupStudent('c7'),
      signupStudent('c8')
    ]);

    // Fire all 8 registration requests concurrently
    const responses = await Promise.all(
      studentList.map(s =>
        fetch(`${BASE_URL}/events/${contestedEvent.id}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${s.token}`
          }
        }).then(async r => ({ status: r.status, body: await r.json() }))
      )
    );

    const successes = responses.filter(r => r.status === 201);
    const fullRejections = responses.filter(r => r.status === 400 && r.body.message.includes('full capacity'));

    console.log(`     Concurrent result: ${successes.length} succeeded (201), ${fullRejections.length} rejected as full (400) out of 8 requests`);
    assert.strictEqual(successes.length, 2, 'Exactly 2 registrations must succeed for capacity=2');
    assert.strictEqual(fullRejections.length, 6, 'Remaining 6 registrations must be cleanly rejected');
  });

  // --- Test Suite 9: GET /api/v1/registrations/me ---
  await test('Student GET /registrations/me returns upcoming, completed, and cancelled with summary', async () => {
    const res = await fetch(`${BASE_URL}/registrations/me`, {
      headers: {
        'Authorization': `Bearer ${student1.token}`
      }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data.registrations));
    assert.ok(body.data.summary);
    assert.ok(typeof body.data.summary.total === 'number');
    assert.ok(typeof body.data.summary.upcoming === 'number');
    assert.ok(typeof body.data.summary.cancelled === 'number');
    console.log('     Student 1 Registrations Summary:', body.data.summary);
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`========================================`);
  if (failCount > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
