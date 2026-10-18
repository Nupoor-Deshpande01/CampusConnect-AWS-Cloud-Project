import React, { useState } from 'react';
import { 
  Ticket, 
  PlusCircle, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  MapPin, 
  QrCode, 
  Sparkles, 
  Activity, 
  Server,
  Filter,
  ArrowUpRight
} from 'lucide-react';

export function DashboardsView({ 
  userRole, 
  setUserRole, 
  registeredTickets, 
  events, 
  onCreateEvent, 
  onViewTicket 
}) {
  const [activeTab, setActiveTab] = useState(userRole || 'student');

  // Organizer Create Event Form State
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Technical');
  const [newEventDate, setNewEventDate] = useState('Dec 24, 2026');
  const [newEventTime, setNewEventTime] = useState('10:00 AM - 05:00 PM');
  const [newEventVenue, setNewEventVenue] = useState('Auditorium Complex, Pune');
  const [newEventCapacity, setNewEventCapacity] = useState('200');
  const [newEventPrice, setNewEventPrice] = useState('Free');
  const [newEventDesc, setNewEventDesc] = useState('');

  // Admin Pending Events Approval Queue State
  const [approvalQueue, setApprovalQueue] = useState([
    {
      id: 'appr-1',
      title: 'DevSprint: Open Source Hackathon',
      organizer: 'OpenSource Pune Chapter',
      category: 'Technical',
      submittedDate: '2 hours ago',
      capacity: 350,
      status: 'pending'
    },
    {
      id: 'appr-2',
      title: 'Kavya: Inter-College Poetry Slam',
      organizer: 'Literary & Arts Circle',
      category: 'Cultural',
      submittedDate: '5 hours ago',
      capacity: 120,
      status: 'pending'
    }
  ]);

  // Attendee Check-In Mock Data
  const [attendees, setAttendees] = useState([
    { id: 'att-1', name: 'Aarav Sharma', email: 'aarav.s@univ.edu', college: 'COEP Pune', ticketId: 'CC-EVT1-4912', checkedIn: true, time: '10:14 AM' },
    { id: 'att-2', name: 'Pooja Iyer', email: 'pooja.i@univ.edu', college: 'MIT World Peace', ticketId: 'CC-EVT1-8841', checkedIn: true, time: '10:22 AM' },
    { id: 'att-3', name: 'Rohan Deshmukh', email: 'rohan.d@univ.edu', college: 'Symbiosis Tech', ticketId: 'CC-EVT1-3019', checkedIn: false, time: '-' },
    { id: 'att-4', name: 'Sneha Patel', email: 'sneha.p@univ.edu', college: 'PICT Pune', ticketId: 'CC-EVT1-7294', checkedIn: false, time: '-' }
  ]);

  const toggleCheckIn = (id) => {
    setAttendees(attendees.map(att => {
      if (att.id === id) {
        return {
          ...att,
          checkedIn: !att.checkedIn,
          time: !att.checkedIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
        };
      }
      return att;
    }));
  };

  const handleApprove = (id) => {
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
  };

  const handleReject = (id) => {
    setApprovalQueue(approvalQueue.filter(item => item.id !== id));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const createdEvent = {
      id: `evt-${Date.now()}`,
      title: newEventTitle,
      shortDescription: newEventDesc || 'Custom community event created via Organizer Portal.',
      description: newEventDesc || 'Detailed agenda and student instructions for this event.',
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      venue: newEventVenue,
      city: 'Pune, Maharashtra',
      poster: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      organizer: {
        name: 'My College Club',
        contact: 'organizer@campusconnect.edu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        verified: true
      },
      spotsTotal: parseInt(newEventCapacity) || 150,
      spotsRemaining: parseInt(newEventCapacity) || 150,
      price: newEventPrice,
      tags: [newEventCategory, 'College Fest', '2026'],
      featured: false,
      status: 'Open'
    };

    onCreateEvent(createdEvent);
    setIsCreatingEvent(false);
    setNewEventTitle('');
    setNewEventDesc('');
  };

  return (
    <section 
      style={{
        backgroundColor: '#0A0A0A',
        minHeight: '100vh',
        paddingTop: '110px',
        paddingBottom: '6rem',
        position: 'relative'
      }}
    >
      <div className="site-container">

        {/* Dashboard Persona Selector Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3rem' }}>
          <div>
            <div className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', marginBottom: '0.6rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
              <span>MANAGEMENT PORTAL</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 900, textTransform: 'lowercase' }}>
              campus <span className="lime-highlight">dashboards.</span>
            </h1>
          </div>

          {/* Persona Tabs (Student, Organizer, Admin) */}
          <div style={{ display: 'flex', backgroundColor: '#14171E', padding: '0.35rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {[
              { id: 'student', label: 'Student Hub', icon: Ticket },
              { id: 'organizer', label: 'Organizer Portal', icon: Users },
              { id: 'admin', label: 'Admin Ops', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setUserRole(tab.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-pill)',
                    background: isActive ? '#C6F24E' : 'transparent',
                    color: isActive ? '#0A0A0A' : 'var(--text-gray-light)',
                    border: 'none',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: STUDENT DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'student' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'REGISTERED PASSES', value: registeredTickets.length, note: 'Valid QR Entries' },
                { label: 'UPCOMING THIS MONTH', value: Math.min(registeredTickets.length, 3), note: 'Sync to Calendar' },
                { label: 'ATTENDANCE CREDITS', value: '4 Credits', note: 'Co-curricular Score' },
                { label: 'MEMBERSHIP TIER', value: 'Verified Student', note: 'Pune University' }
              ].map((card, i) => (
                <div key={i} style={{ backgroundColor: '#12141A', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', letterSpacing: '0.08em' }}>
                    {card.label}
                  </div>
                  <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#C6F24E', marginTop: '0.3rem' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-gray-muted)', marginTop: '0.2rem' }}>
                    {card.note}
                  </div>
                </div>
              ))}
            </div>

            {/* My Tickets Section */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    My Digital QR Event Passes
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-muted)' }}>
                    Show these cryptographic passes at campus checkpoints for instant 1.2s check-in.
                  </p>
                </div>
                <span className="badge-pill badge-pill-lime">
                  {registeredTickets.length} ACTIVE PASSES
                </span>
              </div>

              {registeredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '14px' }}>
                  <Ticket size={40} color="#C6F24E" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                  <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    No event passes claimed yet
                  </h4>
                  <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                    Explore the live calendar and register for hackathons, fests, and workshops.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {registeredTickets.map(ticket => (
                    <div 
                      key={ticket.ticketId}
                      style={{
                        backgroundColor: '#0A0A0A',
                        borderRadius: '16px',
                        border: '1px solid rgba(198, 242, 78, 0.35)',
                        overflow: 'hidden',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <div style={{ backgroundColor: 'rgba(198, 242, 78, 0.15)', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(198, 242, 78, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#C6F24E' }}>
                          {ticket.ticketId}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#FFFFFF', backgroundColor: '#0A0A0A', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-pill)' }}>
                          PASS CONFIRMED
                        </span>
                      </div>

                      <div style={{ padding: '1.25rem' }}>
                        <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {ticket.eventTitle}
                        </h4>
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-gray-muted)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={13} color="#C6F24E" />
                            <span>{ticket.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={13} color="#C6F24E" />
                            <span>{ticket.venue}</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)' }}>
                            Holder: <strong>{ticket.studentName}</strong>
                          </span>
                          <button
                            onClick={() => onViewTicket(ticket)}
                            className="btn-pill btn-lime"
                            style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}
                          >
                            <QrCode size={14} />
                            <span>Show QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campus Notification Feed */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem' }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Campus Alerts & Club Bulletins
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { tag: 'HACKPUNE 2026', title: 'Mentor Pairing & Hardware Lab Slots Open', time: '40 mins ago', urgent: true },
                  { tag: 'ECHOFEST', title: 'Indie Band Battle Stage line-up finalized', time: '3 hours ago', urgent: false },
                  { tag: 'CAMPUS ADMIN', title: 'Bus shuttles scheduled between campuses for weekend events', time: 'Yesterday', urgent: false }
                ].map((note, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span className="badge-pill" style={{ backgroundColor: note.urgent ? 'rgba(198, 242, 78, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: note.urgent ? '#C6F24E' : 'var(--text-gray-light)', fontSize: '0.68rem' }}>
                        {note.tag}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>{note.title}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>
                      {note.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORGANIZER PORTAL */}
        {/* ========================================================= */}
        {activeTab === 'organizer' && (
          <div>
            {/* Top Bar with Host Button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  Host & Event Operations
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-gray-muted)' }}>
                  Manage registrations, check-in attendees, and publish new campus events.
                </p>
              </div>

              <button
                onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                className="btn-pill btn-lime"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                <PlusCircle size={18} />
                <span>{isCreatingEvent ? 'Close Form' : 'Host New Event'}</span>
              </button>
            </div>

            {/* Create Event Modal / Box */}
            {isCreatingEvent && (
              <form 
                onSubmit={handleCreateSubmit}
                style={{
                  backgroundColor: '#14171F',
                  borderRadius: '20px',
                  border: '1px solid rgba(198, 242, 78, 0.35)',
                  padding: '2rem',
                  marginBottom: '2.5rem',
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)'
                }}
              >
                <h4 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem', color: '#C6F24E' }}>
                  Create & Publish Campus Event
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      EVENT TITLE *
                    </label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. AI Autonomous Agents Summit" 
                      value={newEventTitle} 
                      onChange={e => setNewEventTitle(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }} 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      DISCIPLINE CATEGORY
                    </label>
                    <select 
                      value={newEventCategory} 
                      onChange={e => setNewEventCategory(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Sports">Sports</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      DATE
                    </label>
                    <input 
                      type="text" 
                      value={newEventDate} 
                      onChange={e => setNewEventDate(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      VENUE & CAMPUS
                    </label>
                    <input 
                      type="text" 
                      value={newEventVenue} 
                      onChange={e => setNewEventVenue(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                      MAX SEAT CAPACITY
                    </label>
                    <input 
                      type="number" 
                      value={newEventCapacity} 
                      onChange={e => setNewEventCapacity(e.target.value)} 
                      style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }} 
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)', marginBottom: '0.4rem' }}>
                    DESCRIPTION & HIGHLIGHTS
                  </label>
                  <textarea 
                    rows={3} 
                    placeholder="Explain why students should register and what prizes or experiences are included..." 
                    value={newEventDesc} 
                    onChange={e => setNewEventDesc(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF', fontFamily: 'var(--font-body)' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                  <button type="button" onClick={() => setIsCreatingEvent(false)} className="btn-pill btn-outline-white">
                    Cancel
                  </button>
                  <button type="submit" className="btn-pill btn-lime">
                    Publish Event Live →
                  </button>
                </div>
              </form>
            )}

            {/* Published Events Table */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem', marginBottom: '2.5rem' }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Your Active Published Events
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>EVENT TITLE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CATEGORY</th>
                      <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CAPACITY</th>
                      <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 5).map(evt => (
                      <tr key={evt.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{evt.title}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge-pill badge-pill-outline" style={{ fontSize: '0.68rem' }}>{evt.category}</span>
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{evt.date}</td>
                        <td style={{ padding: '1rem', color: '#C6F24E', fontWeight: 700 }}>
                          {evt.spotsTotal - evt.spotsRemaining} / {evt.spotsTotal}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: '#C6F24E', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C6F24E' }}></span>
                            <span>{evt.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Gate Check-in Simulator */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    Gate Scanner & Attendee Check-In
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-gray-muted)' }}>
                    Simulated NFC / 2D QR gate scanner for verified attendees.
                  </p>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#C6F24E' }}>
                  SCANNER STATUS: ONLINE ●
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>ATTENDEE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>TICKET ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>COLLEGE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CHECK-IN TIME</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map(att => (
                      <tr key={att.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: '#FFF' }}>{att.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-gray-dim)' }}>{att.email}</div>
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: '#C6F24E' }}>{att.ticketId}</td>
                        <td style={{ padding: '1rem' }}>{att.college}</td>
                        <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{att.time}</td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => toggleCheckIn(att.id)}
                            style={{
                              padding: '0.35rem 0.85rem',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: att.checkedIn ? 'rgba(198, 242, 78, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                              color: att.checkedIn ? '#C6F24E' : '#FFFFFF'
                            }}
                          >
                            {att.checkedIn ? 'Checked-In ✓' : 'Scan & Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ADMIN OPS */}
        {/* ========================================================= */}
        {activeTab === 'admin' && (
          <div>
            {/* System Health Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'TOTAL ACTIVE USERS', value: '18,490', change: '+12% this week', icon: Users },
                { label: 'AFFILIATED CAMPUSES', value: '26 Campuses', change: 'Pune & Mumbai', icon: MapPin },
                { label: 'API RESPONSE TIME', value: '24 ms', change: 'Express Backend Healthy', icon: Server },
                { label: 'AWS DEPLOYMENT TARGET', value: 'Configured', change: 'Ready for Cloud Phase', icon: ShieldCheck }
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div key={i} style={{ backgroundColor: '#12141A', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#C6F24E' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-gray-dim)' }}>{metric.label}</span>
                      <Icon size={18} />
                    </div>
                    <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', marginTop: '0.5rem' }}>
                      {metric.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#C6F24E', marginTop: '0.25rem' }}>
                      {metric.change}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Event Approval Queue */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                    Event Review & Approval Queue
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-muted)' }}>
                    CampusConnect enforces verified safety and university club policies before listing events.
                  </p>
                </div>
                <span className="badge-pill badge-pill-dark" style={{ border: '1px solid rgba(198, 242, 78, 0.3)', color: '#C6F24E' }}>
                  {approvalQueue.length} PENDING REVIEW
                </span>
              </div>

              {approvalQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed rgba(255, 255, 255, 0.15)', borderRadius: '14px' }}>
                  <CheckCircle size={36} color="#C6F24E" style={{ marginBottom: '0.8rem' }} />
                  <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>All event submissions reviewed</h4>
                  <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.85rem' }}>No pending events waiting in queue.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {approvalQueue.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        padding: '1.25rem',
                        backgroundColor: '#0A0A0A',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge-pill badge-pill-outline" style={{ fontSize: '0.68rem' }}>{item.category}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-gray-dim)', fontFamily: 'var(--font-mono)' }}>Submitted {item.submittedDate}</span>
                        </div>
                        <h4 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.35rem' }}>
                          {item.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-gray-muted)' }}>
                          Organizer: <strong>{item.organizer}</strong> • Max Capacity: {item.capacity}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          onClick={() => handleReject(item.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            background: 'transparent',
                            color: '#EF4444',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="btn-pill btn-lime"
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                        >
                          Approve & List Live →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Architecture / Database Status */}
            <div style={{ backgroundColor: '#12141A', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem' }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                System Architecture Status
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#0A0A0A', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ color: 'var(--text-gray-dim)', fontSize: '0.7rem' }}>FRONTEND FRAMEWORK</div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, marginTop: '0.2rem' }}>React 19 + Vite 8.3</div>
                  <div style={{ color: '#C6F24E', fontSize: '0.72rem' }}>● Client SPA Ready</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0A0A0A', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ color: 'var(--text-gray-dim)', fontSize: '0.7rem' }}>BACKEND ENGINE</div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, marginTop: '0.2rem' }}>Node.js 22 + Express 5</div>
                  <div style={{ color: '#C6F24E', fontSize: '0.72rem' }}>● /api/health Configured</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#0A0A0A', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ color: 'var(--text-gray-dim)', fontSize: '0.7rem' }}>DATABASE TIER</div>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, marginTop: '0.2rem' }}>MySQL Relational Pool</div>
                  <div style={{ color: '#C6F24E', fontSize: '0.72rem' }}>● Schema Ready for AWS RDS</div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
