import mongoose from 'mongoose';
const classSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sections: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});
export default mongoose.model('ClassSection', classSectionSchema);
