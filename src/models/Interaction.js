// models/Interaction.js
import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema({
  userMessage: String,
  aiResponse: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);

