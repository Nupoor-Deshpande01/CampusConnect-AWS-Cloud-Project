import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('   CampusConnect Student Registration Workflow E2E Verification  ');
  console.log('================================================================\n');

  let passCount = 0;
  let failCount = 0;

  const step = async (title, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${title}`);
      passCount++;
    } catch (err) {
      console.error(`[FAIL] ${title}`);
      console.error(`       Error: ${err.message}`);
      failCount++;
    }
  };

  // 1. Setup Student and Organizer accounts
  const studentEmail = `student_e2e_${Date.now()}@campusconnect.edu`;
  const studentRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rhea Sengupta',
      email: studentEmail,
      password: 'password123'
    })
  });
  const studentData = await studentRes.json();
  const studentToken = studentData.data.token;
  const studentUser = studentData.data.user;

  const orgRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'turing@campusconnect.edu',
      password: 'organizer123'
    })
  });
  const orgData = await orgRes.json();
  const orgToken = orgData.data.token;

  console.log(`Initialized Test Student: ${studentUser.name} (${studentEmail}, ID: ${studentUser.id})`);
  console.log(`Initialized Test Organizer: Turing Computer Society (ID: ${orgData.data.user.id})\n`);

  // Helper: Create a fresh event
  const now = new Date();
  const start = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const deadline = new Date(start.getTime() - 24 * 60 * 60 * 1000);

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const createEventRes = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${orgToken}`
    },
    body: JSON.stringify({
      title: 'Autonomous AI Agents HackPune 2026',
      description: 'Join 500+ top engineering minds for a 36-hour sprint building agentic workflows.',
      category: 'Technical',
      venue: 'Main Innovation Quad, Pune Tech Campus',
      start_datetime: fmt(start),
      end_datetime: fmt(end),
      registration_deadline: fmt(deadline),
      capacity: 3,
      status: 'published'
    })
  });
  const eventData = await createEventRes.json();
  const event = eventData.data.event;
  console.log(`Created Test Event: "${event.title}" (ID: ${event.id}, Capacity: ${event.capacity})\n`);

  // --- Step 1: Initial event detail check (not yet registered) ---
  await step('1. Event detail API reports is_registered: false before registration', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(Boolean(body.data.event.is_registered), false);
    assert.strictEqual(body.data.event.registration_count, 0);
  });

  // --- Step 2: Role Restriction (Organizer cannot register as student) ---
  await step('2. Organizer role is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgToken}`
      }
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.ok(body.message.includes('Only students are eligible'));
  });

  // --- Step 3: Student registers successfully ---
  let registrationId;
  await step('3. Student registers successfully (201 Created) and receives reserved seat', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.registration.eventId, event.id);
    assert.strictEqual(body.data.registration.status, 'confirmed');
    assert.strictEqual(body.data.registration.remainingSeats, 2);
    registrationId = body.data.registration.id;
  });

  // --- Step 4: Duplicate Registration Prevention ---
  await step('4. Duplicate registration attempt is rejected with 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert.strictEqual(res.status, 409);
    const body = await res.json();
    assert.ok(body.message.includes('already registered'));
  });

  // --- Step 5: Event Detail shows is_registered: true and updated seats ---
  await step('5. Event detail API reports is_registered: true and registration_count: 1', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(Boolean(body.data.event.is_registered), true);
    assert.strictEqual(body.data.event.registration_count, 1);
  });

  // --- Step 6: Student Dashboard shows the event under Upcoming Passes ---
  await step('6. GET /registrations/me returns upcoming pass with Pass ID and summary', async () => {
    const res = await fetch(`${BASE_URL}/registrations/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data.registrations));
    const reg = body.data.registrations.find(r => r.event_id === event.id);
    assert.ok(reg, 'Registration must appear in student roster');
    assert.strictEqual(reg.timeline_status, 'upcoming');
    assert.strictEqual(reg.registration_status, 'confirmed');
    assert.strictEqual(body.data.summary.upcoming, 1);
  });

  // --- Step 7: Student cancels registration before event starts ---
  await step('7. Student cancels registration (200 OK) releasing the seat', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'success');
    assert.strictEqual(body.data.status, 'cancelled');
  });

  // --- Step 8: Seat count restored and pass marked as cancelled ---
  await step('8. GET /registrations/me shows status cancelled and event detail seat restored', async () => {
    const meRes = await fetch(`${BASE_URL}/registrations/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const meBody = await meRes.json();
    const reg = meBody.data.registrations.find(r => r.event_id === event.id);
    assert.strictEqual(reg.timeline_status, 'cancelled');
    assert.strictEqual(reg.registration_status, 'cancelled');
    assert.strictEqual(meBody.data.summary.upcoming, 0);
    assert.strictEqual(meBody.data.summary.cancelled, 1);

    const eventRes = await fetch(`${BASE_URL}/events/${event.id}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const eventBody = await eventRes.json();
    assert.strictEqual(Boolean(eventBody.data.event.is_registered), false);
    assert.strictEqual(eventBody.data.event.registration_count, 0);
  });

  // --- Step 9: Re-registration after cancellation ---
  await step('9. Student can re-register after cancellation (201 Created)', async () => {
    const res = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      }
    });
    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.data.registration.status, 'confirmed');
  });

  // --- Step 10: Capacity overflow prevention ---
  await step('10. Event rejects registrations once capacity is full (400 Bad Request)', async () => {
    // Current event capacity = 3. Student 1 took seat 1.
    // Register Student 2 and Student 3 to fill capacity 3/3.
    const stud2 = await (await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student 2', email: `s2_${Date.now()}_${Math.random()}@test.edu`, password: 'password123' })
    })).json();

    const stud3 = await (await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student 3', email: `s3_${Date.now()}_${Math.random()}@test.edu`, password: 'password123' })
    })).json();

    const stud4 = await (await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Student 4', email: `s4_${Date.now()}_${Math.random()}@test.edu`, password: 'password123' })
    })).json();

    await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stud2.data.token}` }
    });
    await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stud3.data.token}` }
    });

    // 4th student attempts to register for 3-capacity event
    const overflowRes = await fetch(`${BASE_URL}/events/${event.id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${stud4.data.token}` }
    });
    assert.strictEqual(overflowRes.status, 400);
    const overflowBody = await overflowRes.json();
    assert.ok(overflowBody.message.includes('full capacity'));
  });

  // --- Step 11: Concurrency Race-Condition Locking Test ---
  await step('11. High-concurrency race condition test guarantees 0 overbooking via row-level locks', async () => {
    // Create an event with capacity = 2
    const contestedEvent = await (await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${orgToken}` },
      body: JSON.stringify({
        title: `Concurrency Trial ${Date.now()}`,
        description: 'Testing high concurrency row locking',
        category: 'Workshops',
        venue: 'Room 101',
        start_datetime: fmt(start),
        end_datetime: fmt(end),
        registration_deadline: fmt(deadline),
        capacity: 2,
        status: 'published'
      })
    })).json();

    // Create 6 unique students
    const candidates = await Promise.all(
      [1, 2, 3, 4, 5, 6].map(i =>
        fetch(`${BASE_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Cand ${i}`, email: `cand_${i}_${Date.now()}_${Math.random()}@test.edu`, password: 'password123' })
        }).then(r => r.json())
      )
    );

    // Fire all 6 registration requests simultaneously
    const responses = await Promise.all(
      candidates.map(c =>
        fetch(`${BASE_URL}/events/${contestedEvent.data.event.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${c.data.token}` }
        }).then(async r => ({ status: r.status, body: await r.json() }))
      )
    );

    const successful = responses.filter(r => r.status === 201);
    const rejected = responses.filter(r => r.status === 400);
    console.log(`     -> Concurrency outcome: ${successful.length} registered, ${rejected.length} rejected out of 6 simultaneous requests`);
    assert.strictEqual(successful.length, 2, 'Must never exceed capacity of 2');
    assert.strictEqual(rejected.length, 4, 'Remaining 4 must be rejected');
  });

  console.log('\n================================================================');
  console.log(`   Verification Summary: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================\n');

  if (failCount > 0) process.exit(1);
}

runEndToEndVerification().catch(err => {
  console.error('E2E script error:', err);
  process.exit(1);
});
