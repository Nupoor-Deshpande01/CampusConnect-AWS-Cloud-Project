-- Seed Data: Sample organizer account and fictional college events across categories
-- Note: Does NOT seed a production admin account or hard-coded credentials.

-- 1. Insert sample club organizers if not existing
INSERT IGNORE INTO users (id, name, email, password_hash, role)
VALUES 
  (1, 'Turing Computer Society', 'turing@campusconnect.edu', '$2b$10$e7xX3uE8D2T349FjL0Z0U.g3mO1u4UqLh4rM.Wc9U2u2pYjP1kHGy', 'organizer'),
  (2, 'BeatDrop Music Collective', 'beatdrop@campusconnect.edu', '$2b$10$e7xX3uE8D2T349FjL0Z0U.g3mO1u4UqLh4rM.Wc9U2u2pYjP1kHGy', 'organizer'),
  (3, 'Velocity Gaming Society', 'velocity@campusconnect.edu', '$2b$10$e7xX3uE8D2T349FjL0Z0U.g3mO1u4UqLh4rM.Wc9U2u2pYjP1kHGy', 'organizer'),
  (4, 'PixelCraft Design Lab', 'design@campusconnect.edu', '$2b$10$e7xX3uE8D2T349FjL0Z0U.g3mO1u4UqLh4rM.Wc9U2u2pYjP1kHGy', 'organizer'),
  (5, 'Campus E-Cell & Angel Fund', 'ecell@campusconnect.edu', '$2b$10$e7xX3uE8D2T349FjL0Z0U.g3mO1u4UqLh4rM.Wc9U2u2pYjP1kHGy', 'organizer');

-- 2. Insert fictional events across Technical, Cultural, Sports, Workshops, Entrepreneurship
INSERT IGNORE INTO events (
  id, title, description, category, venue, start_datetime, end_datetime, 
  registration_deadline, capacity, poster_url, status, organizer_id
)
VALUES
  (
    1,
    'HackPune 2026: 36h AI & Web3 Sprint',
    '36-hour hackathon bringing together 600+ engineers, designers, and founders to build autonomous agents and decentralized systems.',
    'Technical',
    'Innovation Hub & Main Quad, Pune Tech Campus',
    '2026-11-14 09:00:00',
    '2026-11-16 18:00:00',
    '2026-11-12 23:59:59',
    400,
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    'published',
    1
  ),
  (
    2,
    'EchoFest 2026: Indie & Electronic Live Sunset',
    'Flagship open-air dual stage indie rock, synth-wave, and DJ sets featuring student bands and visual light installations.',
    'Cultural',
    'Open Air Amphitheatre, Central Greens',
    '2026-11-21 17:30:00',
    '2026-11-21 23:30:00',
    '2026-11-20 18:00:00',
    1200,
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'published',
    2
  ),
  (
    3,
    'ApexClash: Inter-University Esports Arena',
    'Inter-college LAN tournament featuring Valorant 5v5 and BGMI with live caster stages and 240Hz rigs.',
    'Sports',
    'Esports Arena, Sports Complex Block C',
    '2026-11-28 10:00:00',
    '2026-11-29 20:00:00',
    '2026-11-26 23:59:59',
    64,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    'published',
    3
  ),
  (
    4,
    'Generative UI & Spatial Systems Workshop',
    'Hands-on interactive lab: modern auto-layout, shader micro-interactions, React token systems, and spatial UX.',
    'Workshops',
    'Design Studio Lab 402, Architecture Wing',
    '2026-12-02 14:00:00',
    '2026-12-02 18:00:00',
    '2026-12-01 12:00:00',
    60,
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    'published',
    4
  ),
  (
    5,
    'VentureForge: College Founder Pitch Battle',
    '10 finalist student startup teams pitch on the main stage to seed VCs and angel investors for non-dilutive grants.',
    'Entrepreneurship',
    'Main Auditorium, Management Block',
    '2026-12-08 13:30:00',
    '2026-12-08 19:00:00',
    '2026-12-05 23:59:59',
    250,
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    'published',
    5
  );
