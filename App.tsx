import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KaizenIdeas from './pages/KaizenIdeas';
import Kudos from './pages/Kudos';
import Rewards from './pages/Rewards';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import LeaderboardPage from './pages/Leaderboard';
import Badges from './pages/Badges';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ideas" element={<KaizenIdeas />} />
          <Route path="/kudos" element={<Kudos />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} /> {/* Accessible but not in main nav for demo, usually via link */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
