import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // Tailwind icon name or string identifier
  order: { type: Number, required: true } // Path sequence
});

export default mongoose.model('Module', moduleSchema);
