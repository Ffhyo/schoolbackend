import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  classIds: [{
    type: String,
    required: true
  }],
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

export default mongoose.model("Exam", examSchema);