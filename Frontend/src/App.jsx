import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { LeaderboardPlaceholder, QuestsPlaceholder } from './pages/Placeholders';
import StoryCard from './components/StoryCard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/leaderboard" element={<Layout><LeaderboardPlaceholder /></Layout>} />
          <Route path="/quests" element={<Layout><QuestsPlaceholder /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />

          <Route path="/story/:moduleId" element={<StoryCard />} />
          <Route path="/module/:moduleId/lessons" element={<LessonPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;