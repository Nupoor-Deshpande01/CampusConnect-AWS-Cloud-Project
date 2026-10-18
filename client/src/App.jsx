import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EditorialEventsList } from './components/EditorialEventsList';
import { FeaturedCardsGrid } from './components/FeaturedCardsGrid';
import { CategoryShowcase } from './components/CategoryShowcase';
import { HowItWorks } from './components/HowItWorks';
import { EventDetailModal } from './components/EventDetailModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ToastNotification } from './components/ToastNotification';
import { INITIAL_EVENTS } from './data/eventsData';
import { authService } from './services/auth';

function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'events' | 'categories' | 'how-it-works'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Events & Registration State
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Attempt to restore authenticated session on initial mount
  useEffect(() => {
    authService.getMe()
      .then(user => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        // Unauthenticated session, normal state
        setCurrentUser(null);
      });
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setToastMessage(`Welcome back, ${user.name}! Signed in as ${user.role}.`);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setToastMessage('Signed out successfully.');
  };

  // Quick RSVP / Register action (Mock Registration CTA)
  const handleRegisterQuick = (event) => {
    // If not authenticated, prompt sign in or proceed as guest
    setEvents(prev => prev.map(e => {
      if (e.id === event.id) {
        return {
          ...e,
          spotsRemaining: Math.max(0, e.spotsRemaining - 1)
        };
      }
      return e;
    }));
    setToastMessage(`Registration confirmed for "${event.title}"! Spot reserved.`);
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
              onSelectFeaturedEvent={(eventId) => {
                const evt = events.find(e => e.id === eventId);
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
            />

            <EditorialEventsList
              events={events}
              onSelectEvent={(evt) => setSelectedEventForModal(evt)}
              onRegisterQuick={handleRegisterQuick}
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
      </main>

      {/* Global Footer */}
      <Footer 
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      {/* Event Detail Modal with mock event description and registration CTA */}
      {selectedEventForModal && (
        <EventDetailModal
          event={selectedEventForModal}
          onClose={() => setSelectedEventForModal(null)}
          onRegisterSuccess={(evt) => {
            handleRegisterQuick(evt);
          }}
          isRegistered={false}
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
