import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import Leaderboard from './pages/Leaderboard';
import Quests from './pages/Quests';
import { LeaderboardPlaceholder, QuestsPlaceholder } from './pages/Placeholders';
import StoryCard from './components/StoryCard';
import Trading from './pages/Trade';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
          <Route path="/quests" element={<Layout><Quests /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/trading" element={<Layout><Trading /></Layout>} />

          <Route path="/story/:moduleId" element={<StoryCard />} />
          <Route path="/module/:moduleId/lessons" element={<LessonPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;