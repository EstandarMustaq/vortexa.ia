import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  userMessage: String,
  aiResponse: String,
  feedback: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

