import { getloggedInTeacherProfile ,getTeacherById,createTeacher} from "../controllers/teacherController.js";   

import express from "express";
const router = express.Router();
router.post('/login', getloggedInTeacherProfile);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);


export default router;