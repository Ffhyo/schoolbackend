import mongoose from 'mongoose';

const heroSectionSchema = new mongoose.Schema({
  mainTitle: {
    type: String,
    required: [true, 'Main title is required'],
    trim: true,
    maxlength: [100, 'Main title cannot exceed 100 characters']
  },
  subheadline: {
    type: String,
    required: [true, 'Subheadline is required'],
    trim: true,
    maxlength: [200, 'Subheadline cannot exceed 200 characters']
  },
  heroImage: {
    type: String,
    required: false
  },
  ctaText: {
    type: String,
    default: 'Learn More',
    trim: true,
    maxlength: [50, 'CTA text cannot exceed 50 characters']
  },
  ctaLink: {
    type: String,
    default: '#',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
heroSectionSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model('HeroSection', heroSectionSchema);