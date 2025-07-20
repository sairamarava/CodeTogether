import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'system', 'code', 'file'],
    default: 'text'
  },
  metadata: {
    language: String,
    fileName: String,
    fileId: String
  },
  edited: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  }
}, {
  timestamps: true
});

// TTL index for auto-cleanup of old messages (optional)
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }); // 7 days

export default mongoose.model('Message', messageSchema);
