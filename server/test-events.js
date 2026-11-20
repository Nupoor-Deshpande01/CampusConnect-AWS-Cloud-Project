import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('--- Starting CampusConnect Event Management API Tests ---');
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

  // 1. Helper: Login as organizer 1 (turing@campusconnect.edu)
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

  // Helper: Signup a test student
  const signupStudent = async () => {
    const email = `test_student_${Date.now()}@test.edu`;
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student Tester', email, password: 'password123' })
    });
    const data = await res.json();
    return { token: data.data.token, user: data.data.user };
  };

  const org1Session = await login('turing@campusconnect.edu', 'organizer123');
  const org2Session = await login('beatdrop@campusconnect.edu', 'organizer123');
  const adminSession = await login('admin@campusconnect.edu', 'admin123');
  const studentSession = await signupStudent();

  console.log('Sessions acquired: Org 1 (id: %s), Org 2 (id: %s), Admin (id: %s), Student (id: %s)\n',
    org1Session.user.id, org2Session.user.id, adminSession.user.id, studentSession.user.id
  );

  // --- Test Suite 1: Public Event Listing & Filtering ---
  await test('Public GET /events returns published events with pagination', async () => {
    const res = await fetch(`${BASE_URL}/events`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data.events));
    assert.ok(body.data.pagination);
    assert.ok(body.data.events.length > 0);
    // Ensure all returned events have status 'published'
    body.data.events.forEach(e => {
      assert.strictEqual(e.status, 'published');
    });
  });

  await test('Public GET /events filters by category', async () => {
    const res = await fetch(`${BASE_URL}/events?category=Technical`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.events.length > 0);
    body.data.events.forEach(e => {
      assert.strictEqual(e.category, 'Technical');
    });
  });

  await test('Public GET /events searches by title/description', async () => {
    const res = await fetch(`${BASE_URL}/events?search=HackPune`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.events.length > 0);
    assert.ok(body.data.events[0].title.includes('HackPune'));
  });

  await test('Public GET /events handles pagination parameters', async () => {
    const res = await fetch(`${BASE_URL}/events?page=1&limit=2`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.events.length, 2);
    assert.strictEqual(body.data.pagination.limit, 2);
    assert.strictEqual(body.data.pagination.currentPage, 1);
    assert.ok(body.data.pagination.hasNextPage);
  });

  await test('Public GET /events sorts correctly (capacity_desc)', async () => {
    const res = await fetch(`${BASE_URL}/events?sort=capacity_desc`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    for (let i = 0; i < body.data.events.length - 1; i++) {
      assert.ok(body.data.events[i].capacity >= body.data.events[i + 1].capacity);
    }
  });

  // --- Test Suite 2: Public Event Detail ---
  await test('Public GET /events/:id returns published event', async () => {
    const res = await fetch(`${BASE_URL}/events/1`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.event.id, 1);
    assert.ok(body.data.event.organizer_name);
  });

  await test('GET /events/:id returns 404 for non-existent event', async () => {
    const res = await fetch(`${BASE_URL}/events/999999`);
    assert.strictEqual(res.status, 404);
  });

  // --- Test Suite 3: Permissions on Event Creation ---
  await test('Unauthenticated POST /events is rejected with 401', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Event' })
    });
    assert.strictEqual(res.status, 401);
  });

  await test('Student role POST /events is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentSession.token}`
      },
      body: JSON.stringify({ 
        title: 'Student Created Event',
        description: 'Should be rejected',
        category: 'Technical',
        venue: 'Room 101',
        start_datetime: '2026-12-10 10:00:00',
        end_datetime: '2026-12-10 18:00:00',
        registration_deadline: '2026-12-09 23:59:59',
        capacity: 100
      })
    });
    assert.strictEqual(res.status, 403);
  });

  // --- Test Suite 4: Validation on Event Creation ---
  await test('Organizer POST /events fails when end date <= start date', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Invalid Date Event',
        description: 'Valid description for testing dates.',
        category: 'Technical',
        venue: 'Lab A',
        start_datetime: '2026-12-10 18:00:00',
        end_datetime: '2026-12-10 10:00:00', // Before start
        registration_deadline: '2026-12-09 23:59:59',
        capacity: 50
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('End date and time must be strictly after'));
  });

  await test('Organizer POST /events fails when registration deadline is after start date', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Invalid Deadline Event',
        description: 'Valid description for testing deadline.',
        category: 'Technical',
        venue: 'Lab A',
        start_datetime: '2026-12-10 10:00:00',
        end_datetime: '2026-12-10 18:00:00',
        registration_deadline: '2026-12-11 10:00:00', // After start
        capacity: 50
      })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.message.includes('Registration deadline must be on or before'));
  });

  await test('Organizer POST /events fails when capacity <= 0', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Zero Capacity Event',
        description: 'Valid description for testing capacity.',
        category: 'Technical',
        venue: 'Lab A',
        start_datetime: '2026-12-10 10:00:00',
        end_datetime: '2026-12-10 18:00:00',
        registration_deadline: '2026-12-09 10:00:00',
        capacity: 0
      })
    });
    assert.strictEqual(res.status, 400);
  });

  // --- Test Suite 5: Successful Event Creation & Status Visibility ---
  let createdEventId = null;
  let draftEventId = null;

  await test('Organizer 1 creates a valid published event', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Cloud Architecture Summit 2026',
        description: 'Deep dive into serverless microservices, distributed systems, and real-time event streaming.',
        category: 'Technical',
        venue: 'Main Auditorium Hall 1',
        start_datetime: '2026-12-15 10:00:00',
        end_datetime: '2026-12-15 17:00:00',
        registration_deadline: '2026-12-14 23:59:59',
        capacity: 150,
        poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
        status: 'published'
      })
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.event.organizer_id, org1Session.user.id);
    createdEventId = body.data.event.id;
    assert.ok(createdEventId > 0);
  });

  await test('Organizer 1 creates a draft event', async () => {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Confidential Robotics Demo (Draft)',
        description: 'Internal draft description not yet ready for public reveal.',
        category: 'Workshops',
        venue: 'Robotics Wing Bay 3',
        start_datetime: '2026-12-20 14:00:00',
        end_datetime: '2026-12-20 18:00:00',
        registration_deadline: '2026-12-19 23:59:59',
        capacity: 40,
        status: 'draft'
      })
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.data.event.status, 'draft');
    draftEventId = body.data.event.id;
  });

  // --- Test Suite 6: Unpublished Events Protection ---
  await test('Public GET /events does NOT contain draft event', async () => {
    const res = await fetch(`${BASE_URL}/events`);
    const body = await res.json();
    const hasDraft = body.data.events.some(e => e.id === draftEventId);
    assert.strictEqual(hasDraft, false);
  });

  await test('Public GET /events/:draftId returns 404 (hidden from public)', async () => {
    const res = await fetch(`${BASE_URL}/events/${draftEventId}`);
    assert.strictEqual(res.status, 404);
  });

  await test('Organizer 2 GET /events/:draftId returns 404 (hidden from other organizers)', async () => {
    const res = await fetch(`${BASE_URL}/events/${draftEventId}`, {
      headers: { 'Authorization': `Bearer ${org2Session.token}` }
    });
    assert.strictEqual(res.status, 404);
  });

  await test('Organizer 1 GET /events/:draftId returns 200 (visible to owner organizer)', async () => {
    const res = await fetch(`${BASE_URL}/events/${draftEventId}`, {
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.event.id, draftEventId);
    assert.strictEqual(body.data.event.status, 'draft');
  });

  await test('Organizer 1 GET /events?my_events=true returns all their events including drafts', async () => {
    const res = await fetch(`${BASE_URL}/events?my_events=true&limit=100`, {
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    const hasDraft = body.data.events.some(e => e.id === draftEventId);
    assert.strictEqual(hasDraft, true);
  });

  // --- Test Suite 7: Updates and Ownership Protection ---
  await test('Organizer 2 attempting to PUT Organizer 1 event is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org2Session.token}`
      },
      body: JSON.stringify({ title: 'Hijacked Event Title' })
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('only authorized to edit your own events'));
  });

  await test('Organizer 1 successfully updates their own event', async () => {
    const res = await fetch(`${BASE_URL}/events/${createdEventId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${org1Session.token}`
      },
      body: JSON.stringify({ 
        title: 'Cloud Architecture Summit 2026 (Updated & Expanded)',
        capacity: 200
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.event.title, 'Cloud Architecture Summit 2026 (Updated & Expanded)');
    assert.strictEqual(body.data.event.capacity, 200);
  });

  // --- Test Suite 8: Event Deletion and Ownership Protection ---
  await test('Organizer 2 attempting to DELETE Organizer 1 event is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events/${draftEventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${org2Session.token}` }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Organizer 1 successfully deletes their own event', async () => {
    const res = await fetch(`${BASE_URL}/events/${draftEventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.data.deletedId, draftEventId);

    // Verify it is gone
    const verifyRes = await fetch(`${BASE_URL}/events/${draftEventId}`, {
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(verifyRes.status, 404);
  });

  // --- Test Suite 9: Registrations Access by Organizer ---
  await test('Organizer 2 accessing Organizer 1 event registrations is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events/1/registrations`, {
      headers: { 'Authorization': `Bearer ${org2Session.token}` }
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Organizer 1 successfully views their event registrations', async () => {
    const res = await fetch(`${BASE_URL}/events/1/registrations`, {
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.eventId, 1);
    assert.ok(Array.isArray(body.data.registrations));
  });

  // --- Test Suite 10: Organizer Dashboard Stats ---
  await test('Organizer GET /events/stats/organizer returns event metrics', async () => {
    const res = await fetch(`${BASE_URL}/events/stats/organizer`, {
      headers: { 'Authorization': `Bearer ${org1Session.token}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(typeof body.data.stats.totalEvents === 'number');
    assert.ok(typeof body.data.stats.publishedEvents === 'number');
    assert.ok(typeof body.data.stats.totalCapacity === 'number');
    console.log('     Organizer 1 Stats:', body.data.stats);
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
