import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GET_JWT_SECRET } from '../helper.js';
import Module from '../models/Module.js';

// Use environment variable or default
const JWT_SECRET = GET_JWT_SECRET() || 'your_super_secret_key';

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const starterModules = await Module.find().select('_id').sort({ order: 1 });
    const user = await User.create({
      username,
      password: hashedPassword,
      unlockedModules: starterModules.map((m) => m._id),
      dailyProgress: {
        dateKey: '',
        xpEarned: 0,
        lessonsCompleted: 0,
      },
    });

    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // In case user exists from before but doesn't have a password
    if (!user.password) {
      return res.status(400).json({ message: 'User account needs password setup. Please register again if testing.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create new refresh token on login
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      xp: user.xp,
      currentStreak: user.currentStreak,
      highestStreak: user.highestStreak,
      lastActive: user.lastActive,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Refresh rotation
    const newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({ refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
