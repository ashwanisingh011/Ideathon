import User from '../models/User.js';
import Module from '../models/Module.js';

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('unlockedModules')
      .populate('completedLessons');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const unlockedIds = user.unlockedModules.map((m) => m?._id?.toString() || m?.toString());
    const starterModules = await Module.find().select('_id').sort({ order: 1 });
    let needsSave = false;

    for (const starter of starterModules) {
      if (!unlockedIds.includes(starter._id.toString())) {
        user.unlockedModules.push(starter._id);
        needsSave = true;
      }
    }

    if (needsSave) {
      await user.save();
      await user.populate('unlockedModules');
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
  const { username, lessonId, xpGained } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const safeXpGained = Number(xpGained) || 0;
    user.xp += safeXpGained;

    const now = new Date();
    const today = getDateKey(now);
    if (!user.dailyProgress || user.dailyProgress.dateKey !== today) {
      user.dailyProgress = {
        dateKey: today,
        xpEarned: 0,
        lessonsCompleted: 0,
      };
    }
    user.dailyProgress.xpEarned += safeXpGained;

    const completedLessonIds = user.completedLessons.map((id) => id.toString());
    let newlyCompletedLesson = false;
    if (!completedLessonIds.includes(lessonId?.toString())) {
      user.completedLessons.push(lessonId);
      newlyCompletedLesson = true;
    }

    if (newlyCompletedLesson) {
      user.dailyProgress.lessonsCompleted += 1;

      const todayStart = startOfDay(now);
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      const lastActiveStart = lastActiveDate ? startOfDay(lastActiveDate) : null;

      if (!lastActiveStart) {
        user.currentStreak = 1;
      } else {
        const dayDiff = Math.round((todayStart - lastActiveStart) / (1000 * 60 * 60 * 24));

        if (dayDiff <= 0) {
          user.currentStreak = Math.max(Number(user.currentStreak) || 0, 1);
        } else if (dayDiff === 1) {
          user.currentStreak = (Number(user.currentStreak) || 0) + 1;
        } else {
          user.currentStreak = 1;
        }
      }

      user.highestStreak = Math.max(Number(user.highestStreak) || 0, Number(user.currentStreak) || 0);
      user.lastActive = now;
    }

    // Example badge logic
    if (user.completedLessons.length === 1) {
       const hasBadge = user.badges.find(b => b.name === 'Digital Defender');
       if(!hasBadge) user.badges.push({ name: 'Digital Defender' });
    }

    await user.save();
    res.status(200).json({
      ...user.toObject(),
      justUnlockedNextPath: false,
      newlyUnlockedModuleId: null,
      newlyUnlockedModuleTitle: null,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
