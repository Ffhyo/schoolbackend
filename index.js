import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import adminRoutes from "./routes/adminRoutes.js";
import heroRoutes from "./routes/heroSectionRoute.js"; // Make sure this matches your file name
import classSectionRoutes from './routes/classSectionRoute.js';
import examRoutes from './routes/examRoute.js'; 
import subjectRoutes from './routes/subjectRoute.js';
import teacherRoutes from './routes/teacherRoutes.js';
import chatRoutes from './chat/chatRoute.js';
import studentRoutes from './routes/studentRoutes.js';
import cors from 'cors';
import path from 'path';
import assemblyRoutes from './routes/assemblyRoute.js';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admins', adminRoutes);
app.use('/api', heroRoutes); // This should match your route file
//class and section route
app.use('/api/class-sections', classSectionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/subjects', subjectRoutes); // Subject routes
//teacher routes
app.use('/api/teachers', teacherRoutes); // Teacher routes
//chat route
app.use('/api/chat', chatRoutes);
//student route
app.use('/api/students', studentRoutes); // Student routes

app.use('/api/assembly', assemblyRoutes); // Assembly activity routes
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});