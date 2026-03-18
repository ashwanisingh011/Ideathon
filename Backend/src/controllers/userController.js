import User from '../models/User.js';

// Simple login/register based on username
export const loginUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({ username });
    } else {
      // Check and update streak logic here (simplified for MVP)
      const now = new Date();
      const lastActive = new Date(user.lastActive);

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

      const diffTime = Math.abs(today - lastActiveDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.currentStreak += 1;
        if (user.currentStreak > user.highestStreak) {
          user.highestStreak = user.currentStreak;
        }
      } else if (diffDays > 1) {
        user.currentStreak = 1; // reset streak, but since they logged in today it's 1
      }

      user.lastActive = now;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('unlockedModules')
      .populate('completedLessons');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(15)
      .select('username xp currentStreak');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Progress (after a lesson)
export const updateProgress = async (req, res) => {
  const { username, lessonId, xpGained, moduleId } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.xp += xpGained;

    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
    }

    // Example badge logic
    if (user.completedLessons.length === 1) {
       const hasBadge = user.badges.find(b => b.name === 'Digital Defender');
       if(!hasBadge) user.badges.push({ name: 'Digital Defender' });
    }

    await user.save();
    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
