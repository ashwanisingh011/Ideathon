import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  order: { type: Number, required: true },
  xpReward: { type: Number, default: 50 }
});

export default mongoose.model('Lesson', lessonSchema);
