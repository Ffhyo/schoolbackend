
import { createExam,examDetail,examDelete } from "../controllers/examController.js";

import express from 'express';
const router = express.Router();

router.post('/exams', createExam);
router.get('/exams/detail',examDetail);
router.delete('/exams/:id/delete',examDelete);


export default router;