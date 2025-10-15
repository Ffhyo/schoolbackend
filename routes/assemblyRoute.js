// routes/activityRoutes.js
import express from 'express';
import {
  getActivity,
  createBulkActivities,
  getActivitiesByStudent,
  updateActivityCompletion,
  deleteActivity} from '../controllers/assemblyActivityController.js';

const router = express.Router();

router.get('/', getActivity);
router.post('/bulk', createBulkActivities);
router.get('/student/:studentId', getActivitiesByStudent);
router.patch('/:id/completion', updateActivityCompletion);
router.delete('/:id', deleteActivity);

export default router;