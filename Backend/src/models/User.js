import mongoose from 'mongoose';

const dailyContestQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' },
}, { _id: false });

const dailyContestEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  topic: { type: String, default: 'financial literacy' },
  questions: { type: [dailyContestQuestionSchema], default: [] },
  generatedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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
  }],
  dailyContests: { type: [dailyContestEntrySchema], default: [] },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
