import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EditorialEventsList } from './components/EditorialEventsList';
import { FeaturedCardsGrid } from './components/FeaturedCardsGrid';
import { CategoryShowcase } from './components/CategoryShowcase';
import { HowItWorks } from './components/HowItWorks';
import { EventDetailModal } from './components/EventDetailModal';
import { AuthModal } from './components/AuthModal';
import { OrganizerPortal } from './components/OrganizerPortal';
import { StudentRegistrationsView } from './components/StudentRegistrationsView';
import { Footer } from './components/Footer';
import { ToastNotification } from './components/ToastNotification';
import { authService } from './services/auth';
import { eventService } from './services/events';

function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'events' | 'categories' | 'how-it-works' | 'organizer' | 'passes'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Authentication & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Live Backend Events State (pure API state, no mock data fallback)
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Selected Modal & Notification State
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // 1. Debounce search query by 300ms to optimize backend API request load
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Load public events from real Express / MySQL backend
  const loadPublicEvents = async () => {
    try {
      setLoadingEvents(true);
      setEventsError(null);

      const params = { limit: 100 };
      if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await eventService.getEvents(params);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load events from backend:', err);
      // Strictly do not fall back to fake mock data: display genuine error state
      setEvents([]);
      setEventsError(err.message || 'Unable to connect to the CampusConnect Backend API (http://localhost:5000).');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Re-fetch events when debounced search or category filter changes
  useEffect(() => {
    loadPublicEvents();
  }, [debouncedSearchQuery, selectedCategory]);

  // Restore authenticated session on initial mount
  useEffect(() => {
    authService.getMe()
      .then(user => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setToastMessage(`Welcome back, ${user.name}! Signed in as ${user.role}.`);
    if (user.role === 'organizer' || user.role === 'admin') {
      setActiveView('organizer');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    if (activeView === 'organizer' || activeView === 'passes') {
      setActiveView('home');
    }
    setToastMessage('Signed out successfully.');
  };

  // Quick RSVP / Register action: opens modal to register via real API
  const handleRegisterQuick = (event) => {
    setSelectedEventForModal(event);
  };

  const scrollToEvents = () => {
    const el = document.getElementById('events-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Navbar with Authenticated User State */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onExploreClick={() => {
          if (activeView !== 'events') {
            setActiveView('events');
          }
          setTimeout(scrollToEvents, 100);
        }}
      />

      {/* Main Views */}
      <main style={{ flex: 1 }}>
        {activeView === 'home' && (
          <>
            {/* 1. Hero Section with heading "Discover What's Happening on Campus", description, search & category filters */}
            <HeroSection
              onExploreClick={scrollToEvents}
              onSelectFeaturedEvent={(identifier) => {
                const evt = events.find(e => 
                  e.id === identifier || 
                  e.id === Number(identifier) || 
                  (typeof identifier === 'string' && e.title.toLowerCase().includes(identifier.toLowerCase()))
                ) || events[0];
                if (evt) setSelectedEventForModal(evt);
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* 2. Featured Events Section (Editorial interactive spotlight) */}
            <EditorialEventsList
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
              loading={loadingEvents}
              error={eventsError}
            />

            {/* 3. Upcoming Events Grid with Title Search, Category Filter, and Date Sorting */}
            <FeaturedCardsGrid
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              loading={loadingEvents}
              error={eventsError}
              onRetry={loadPublicEvents}
            />

            {/* 4. Category Discovery: Technical, Cultural, Sports, Workshops, Entrepreneurship */}
            <CategoryShowcase
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                scrollToEvents();
              }}
            />

            {/* 5. Concise How It Works Section */}
            <HowItWorks
              onGetStarted={scrollToEvents}
            />
          </>
        )}

        {/* Dedicated Events Listing Page */}
        {activeView === 'events' && (
          <div style={{ paddingTop: '80px' }}>
            <FeaturedCardsGrid
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              loading={loadingEvents}
              error={eventsError}
              onRetry={loadPublicEvents}
            />

            <EditorialEventsList
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
              loading={loadingEvents}
              error={eventsError}
            />
          </div>
        )}

        {/* Categories View */}
        {activeView === 'categories' && (
          <div style={{ paddingTop: '80px' }}>
            <CategoryShowcase
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveView('events');
                setTimeout(scrollToEvents, 100);
              }}
            />
            <FeaturedCardsGrid
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              loading={loadingEvents}
              error={eventsError}
              onRetry={loadPublicEvents}
            />
          </div>
        )}

        {/* How It Works View */}
        {activeView === 'how-it-works' && (
          <div style={{ paddingTop: '80px' }}>
            <HowItWorks
              onGetStarted={() => {
                setActiveView('events');
                setTimeout(scrollToEvents, 100);
              }}
            />
          </div>
        )}

        {/* Organizer Dashboard & Event Management View */}
        {activeView === 'organizer' && (
          <OrganizerPortal
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onEventCreatedOrUpdated={() => {
              loadPublicEvents();
              setToastMessage('Event changes saved to database.');
            }}
          />
        )}

        {/* Student Digital Event Passes & Registrations View */}
        {activeView === 'passes' && (
          <StudentRegistrationsView
            currentUser={currentUser}
            onExploreEvents={() => {
              setActiveView('events');
              setTimeout(scrollToEvents, 100);
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onRegistrationUpdated={() => {
              loadPublicEvents();
              setToastMessage('Registration status updated.');
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer 
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      {/* Event Detail Modal connected to real API with registration CTA & cancellation */}
      {selectedEventForModal && (
        <EventDetailModal
          event={selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onRegisterSuccess={(evt) => {
            loadPublicEvents();
            setToastMessage(`Registration confirmed for "${evt.title}"! Spot reserved.`);
          }}
          onCancelSuccess={(evt) => {
            loadPublicEvents();
            setToastMessage(`Registration cancelled for "${evt.title}". Spot released.`);
          }}
        />
      )}

      {/* Auth Modal for Student Sign Up & Sign In */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notification */}
      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}

export default App;
