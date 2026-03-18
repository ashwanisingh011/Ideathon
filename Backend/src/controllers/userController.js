import User from '../models/User.js';

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

// Get Stats (streak, xp, achievements/badges)
