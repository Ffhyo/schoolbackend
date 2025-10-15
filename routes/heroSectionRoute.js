import express from 'express';
import {
  createHero,
  getHeroes,
  getHeroById,
  getActiveHero,
  uploadHeroImage
} from '../controllers/heroSectionController.js'; // Make sure this path is correct

const router = express.Router();

// Create hero section
router.post('/heroes', uploadHeroImage, createHero);

// Get all hero sections
router.get('/heroes', getHeroes);

// Get active hero section
router.get('/heroes/active', getActiveHero);

// Get hero section by ID
router.get('/heroes/:id', getHeroById);

export default router;