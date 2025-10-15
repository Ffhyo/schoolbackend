import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
 
  credits: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['core', 'elective', 'optional'],
    default: 'core'
  },
  passMark: {
    type: Number,
    default: 40
  },
  fullMark: {
    type: Number,
    default: 100
  },
  practicalpassMarks: {
    type: Number,
    default: null
  },
  practicalfullMarks: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Subject', subjectSchema);