import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },

  // Authentication
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },

  // Professional Information
  employeeId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness for non-null values
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  gradeLevels: [{
    type: String,
    trim: true
  }],
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number, // Years of experience
    default: 0
  },
  specialization: {
    type: String,
    trim: true
  },

  // Employment Details
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'substitute'],
    default: 'full-time'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number
  },
  department: {
    type: String,
    trim: true
  },

  // Contact Information
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Teaching Details
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  schedule: {
    monday: [String], // Array of time slots like ["09:00-10:00", "11:00-12:00"]
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String],
    saturday: [String],
    sunday: [String]
  },

  // Performance & Analytics
  attendance: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    leave: { type: Number, default: 0 }
  },
  performance: {
    type: String,
    enum: ['excellent', 'good', 'average', 'needs-improvement'],
    default: 'good'
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    reviews: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: { type: Date, default: Date.now }
    }]
  },

  // Administrative
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'suspended', 'resigned'],
    default: 'active'
  },
  permissions: {
    canGradeStudents: { type: Boolean, default: true },
    canTakeAttendance: { type: Boolean, default: true },
    canCreateAssignments: { type: Boolean, default: true },
    canViewAllStudents: { type: Boolean, default: false },
    canManageClass: { type: Boolean, default: true }
  },

  // System Fields
  profileImage: {
    type: String, // URL to profile image
    default: ''
  },
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual for full name
teacherSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for teaching experience display
teacherSchema.virtual('experienceDisplay').get(function() {
  if (this.experience === 0) return 'Fresh';
  if (this.experience === 1) return '1 year';
  return `${this.experience} years`;
});

// Index for better query performance
 
teacherSchema.index({ employmentType: 1 });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ 'address.city': 1 });

// Method to calculate average rating
teacherSchema.methods.calculateAverageRating = function() {
  if (this.ratings.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
    return;
  }
  
  const total = this.ratings.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = total / this.ratings.reviews.length;
  this.ratings.count = this.ratings.reviews.length;
};

// Pre-save middleware to update average rating
teacherSchema.pre('save', function(next) {
  if (this.ratings.reviews && this.ratings.reviews.length > 0) {
    this.calculateAverageRating();
  }
  next();
});

// Static method to find teachers by subject
teacherSchema.statics.findBySubject = function(subject) {
  return this.find({ subject: new RegExp(subject, 'i') });
};

// Static method to get active teachers count
teacherSchema.statics.getActiveTeachersCount = function() {
  return this.countDocuments({ isActive: true });
};

// Instance method to get teacher's schedule for a specific day
teacherSchema.methods.getScheduleForDay = function(day) {
  return this.schedule[day.toLowerCase()] || [];
};

const teacherModel = mongoose.model('Teacher', teacherSchema);

export default teacherModel;