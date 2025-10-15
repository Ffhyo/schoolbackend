import express from 'express';
import { 
  createClassSection, 
  getClassSections,
  updateClassSection,
  deleteClassSection,
  addSectionToClass,
  deleteSectionFromClass
} from '../controllers/ClassSectionController.js';

const router = express.Router();

router.post('/create', createClassSection);
router.get('/', getClassSections);
router.put('/:id', updateClassSection);
router.delete('/:id/delete', deleteClassSection);
router.post('/:id/sections', addSectionToClass); // Add section
router.delete('/:id/sections/:sectionIndex', deleteSectionFromClass); // Delete section

export default router;