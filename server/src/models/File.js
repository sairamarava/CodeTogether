import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  isFolder: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  size: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'text/plain'
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ roomId: 1, path: 1 });
fileSchema.index({ roomId: 1, parentId: 1 });

export default mongoose.model('File', fileSchema);
