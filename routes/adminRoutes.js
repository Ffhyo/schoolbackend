import express from 'express';
import { 
  getAdmins, 
  loginAdmin, 
  createAdmin,
  getAdminDashboard, // Add this
  getStudents,
  getTeachers
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/', getAdmins);
router.post('/login', loginAdmin);
router.post('/create', createAdmin);

// Admin-specific routes
router.get('/:adminId/dashboard', getAdminDashboard); // Dynamic admin dashboard
router.get('/:adminId/students', getStudents); // Admin-specific students
router.get('/:adminId/teachers', getTeachers); // Admin-specific teachers

export default router;