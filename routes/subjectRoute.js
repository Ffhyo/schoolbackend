import express from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectsByType
} from '../controllers/subjectController.js';

const router = express.Router();

router.post('/', createSubject);
router.get('/subjects', getAllSubjects);
router.get('/subjects/:type', getSubjectsByType);
router.get('/subjects/:id', getSubjectById);
router.put('/subjects/update/:id', updateSubject);
router.delete('/subjects/delete/:id', deleteSubject);

export default router;