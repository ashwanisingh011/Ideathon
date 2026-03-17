import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  text: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String }
});

export default mongoose.model('Question', questionSchema);
