import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  },
  fathersName: {
    type: String,
    required: true,
    trim: true
  },
  mothersName: {
    type: String,
    required: true,
    trim: true
  },
  fatherOccupation: {
    type: String,
    trim: true
  },
  motherOccupation: {
    type: String,
    trim: true
  },
  parentPhoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  parentEmail: {
    type: String,
    trim: true
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  temporaryAddress: {
    type: String,
    trim: true
  },
  permanentAddress: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  house: {
    type: String,
    trim: true
  },
  Class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
  admissionDate: {
    type: Date,
    required: true
  },
  symbolNumber: {
    type: Number
  },
  previousSchool: {
    type: String,
    trim: true
  },
  medicalConditions: {
    type: String,
    trim: true
  },
  allergies: {
    type: String,
    trim: true
  },
  medication: {
    type: String,
    trim: true
  },
  transportation: {
    type: String,
    trim: true
  },
  busRoute: {
    type: String,
    trim: true
  },
  busStop: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  hobbies: {
    type: String,
    trim: true
  },
  achievements: {
    type: String,
    trim: true
  },
  remarks: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for better query performance
studentSchema.index({ Class: 1, section: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ house: 1 });

export default mongoose.model('Student', studentSchema);