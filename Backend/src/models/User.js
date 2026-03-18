import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  xp: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  highestStreak: { type: Number, default: 0 },

  lastActive: { type: Date, default: null },
  unlockedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  badges: [{
    name: { type: String, enum: ['Digital Defender', 'Wealth Weaver', 'Nation Builder'] },
    unlockedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
