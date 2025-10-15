// models/Activity.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: 2100
  },
  activities: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  dateAssigned: {
    type: Date,
    required: true,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate assignments
activitySchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

// Virtual for formatted date
activitySchema.virtual('formattedDateAssigned').get(function() {
  return this.dateAssigned.toISOString().split('T')[0];
});

export default mongoose.model('Activity', activitySchema);