import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { initializeStorage, isOnboardingCompleted } from './services/storageService';
import { isLoggedIn } from './services/apiService';
import { useIdleTimer } from './hooks/useIdleTimer';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KaizenIdeas from './pages/KaizenIdeas';
import IdeaDetail from './pages/IdeaDetail';
import Kudos from './pages/Kudos';
import Rewards from './pages/Rewards';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import LeaderboardPage from './pages/Leaderboard';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Management from './pages/Management';
import SuperadminConsole from './pages/SuperadminConsole';
import WaitingApproval from './pages/WaitingApproval';
import { getSavedUser } from './services/apiService';

// Wrapper component to handle routing logic
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const authenticated = isLoggedIn();

  // Start inactivity timer for session management (15 mins)
  useIdleTimer(authenticated);

  // Read onboarding status and active status
  const user = getSavedUser();
  const onboardingComplete = isOnboardingCompleted();
  const isActive = user?.isActive !== false; // Active by default (for old users) or if explicitly true

  // Public routes (no auth required)
  if (location.pathname === '/login') {
    // Redirect to home if already logged in
    if (isLoggedIn()) {
      return <Navigate to="/" replace />;
    }
    return <Login />;
  }

  // Onboarding route
  if (location.pathname === '/onboarding') {
    return <Onboarding />;
  }

  // Check authentication for protected routes
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // Handle inactive users (pending approval)
  if (!isActive) {
    return <WaitingApproval />;
  }

  // If onboarding not complete, show it first
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // Show main app with layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ideas" element={<KaizenIdeas />} />
        <Route path="/ideas/:id" element={<IdeaDetail />} />
        <Route path="/kudos" element={<Kudos />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/management" element={<Management />} />
        <Route path="/console" element={<SuperadminConsole />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize localStorage with mock data
    initializeStorage();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;
