import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 50 },
  aiExplanation: { type: String, default: '' },
  aiGeneratedAt: { type: Date, default: null },
});

export default mongoose.model('Lesson', lessonSchema);
