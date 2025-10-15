
import mongoose from "mongoose";
// models/adminModel.js
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'admin' },
  firstName: String,
  lastName: String,
  profileImage: String,
  assignedSections: [String], // Sections/Grades this admin manages
  permissions: {
    canManageStudents: { type: Boolean, default: true },
    canManageTeachers: { type: Boolean, default: true },
    canManageCourses: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true }
  },
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const adminModel= mongoose.model("admins", adminSchema)

export default adminModel;


