import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // Tailwind icon name or string identifier
  order: { type: Number, required: true }, // Path sequence
  learningCards: [
    {
      title: { type: String, required: true },
      text: { type: String, required: true },
      order: { type: Number, required: true },
    },
  ],
  aiGeneratedAt: { type: Date, default: null },
});

export default mongoose.model('Module', moduleSchema);
