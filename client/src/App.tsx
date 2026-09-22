import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultantDirectory } from './pages/ConsultantDirectory';
import { ConsultantProfile } from './pages/ConsultantProfile';
import { BookingFlow } from './pages/BookingFlow';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCalendar } from './pages/AdminCalendar';
import { AdminConsultants } from './pages/AdminConsultants';
import { AdminBookings } from './pages/AdminBookings';
import { AdminEmails } from './pages/AdminEmails';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ConsultantDashboard } from './pages/ConsultantDashboard';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/consultants';
  });

  const { isAuthenticated, isAdmin, isConsultant, isLoading } = useAuth();

  // Listen to browser popstate / back-forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/consultants');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching helpers
  const renderRoute = () => {
    if (isLoading) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center text-zinc-400 text-xs">
          Loading Engiplex Consultation...
        </div>
      );
    }

    const path = currentPath;

    // Public / Login / Register / Privacy Policy / Terms & Conditions
    if (path === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (path === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    if (path === '/privacy' || path === '/privacy-policy') {
      return <PrivacyPolicy onNavigate={navigate} />;
    }
    if (path === '/terms' || path === '/terms-and-conditions' || path === '/refund-policy') {
      return <TermsAndConditions onNavigate={navigate} />;
    }

    // Consultant Profile: /consultants/:id
    const profileMatch = path.match(/^\/consultants\/([a-zA-Z0-9_-]+)$/);
    if (profileMatch) {
      return <ConsultantProfile consultantId={profileMatch[1]} onNavigate={navigate} />;
    }

    // Booking Flow: /book/:consultantId or /book
    if (path === '/book' || path === '/book/') {
      return <BookingFlow consultantId="65fa00000000000000000001" onNavigate={navigate} />;
    }
    const bookMatch = path.match(/^\/book\/([a-zA-Z0-9_-]+)$/);
    if (bookMatch) {
      return <BookingFlow consultantId={bookMatch[1]} onNavigate={navigate} />;
    }

    // Booking Confirmation: /booking/:id
    const confirmMatch = path.match(/^\/booking\/([a-zA-Z0-9_-]+)$/);
    if (confirmMatch) {
      return <BookingConfirmation bookingId={confirmMatch[1]} onNavigate={navigate} />;
    }

    // Consultant Dashboard: /consultant/dashboard or /consultant
    if (path.startsWith('/consultant/dashboard') || path === '/consultant') {
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} redirectPath="/consultant/dashboard" />;
      }
      return <ConsultantDashboard onNavigate={navigate} />;
    }

    // Client Dashboard: /dashboard
    if (path.startsWith('/dashboard')) {
      if (!isAuthenticated) {
        return <LoginPage onNavigate={navigate} redirectPath="/dashboard" />;
      }
      if (isConsultant) {
        return <ConsultantDashboard onNavigate={navigate} />;
      }
      return <UserDashboard onNavigate={navigate} />;
    }

    // Admin Routes
    if (path.startsWith('/admin')) {
      if (!isAuthenticated || !isAdmin) {
        return <LoginPage onNavigate={navigate} redirectPath={path} />;
      }

      if (path === '/admin/calendar') {
        return <AdminCalendar onNavigate={navigate} />;
      }
      if (path === '/admin/consultants') {
        return <AdminConsultants onNavigate={navigate} />;
      }
      if (path === '/admin/bookings') {
        return <AdminBookings onNavigate={navigate} />;
      }
      if (path === '/admin/emails') {
        return <AdminEmails onNavigate={navigate} />;
      }
      return <AdminDashboard onNavigate={navigate} />;
    }

    // Default: Consultant Directory
    return <ConsultantDirectory onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-zinc-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      <div>
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <main className="pb-16">{renderRoute()}</main>
      </div>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
