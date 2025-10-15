import HeroSection from "../models/heroSection.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ES module __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer configuration for hero images
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "hero-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for hero image upload
export const uploadHeroImage = multer({ 
  storage: heroStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single("heroImage");

// Create Hero Section
export const createHero = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { mainTitle, subheadline, ctaText, ctaLink } = req.body;
    const heroImage = req.file ? `/uploads/${req.file.filename}` : null;

    // Validation
    if (!mainTitle || !subheadline) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false,
        error: "Main Title and Subheadline are required." 
      });
    }

    // Create new hero section
    const newHero = new HeroSection({ 
      mainTitle, 
      subheadline, 
      heroImage,
      ctaText: ctaText || 'Learn More',
      ctaLink: ctaLink || '#'
    });

    const savedHero = await newHero.save();

    res.status(201).json({
      success: true,
      message: "Hero section created successfully",
      data: savedHero
    });

  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error creating hero section:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: error.message 
    });
  }
};

// Get All Hero Sections
export const getHeroes = async (req, res) => {
  try {
    const heroes = await HeroSection.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: heroes.length,
      data: heroes
    });

  } catch (error) {
    console.error("Error fetching hero sections:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch hero sections",
      details: error.message 
    });
  }
};

// Get Single Hero Section by ID
export const getHeroById = async (req, res) => {
  try {
    const { id } = req.params;

    const hero = await HeroSection.findById(id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    res.status(200).json({
      success: true,
      data: hero
    });

  } catch (error) {
    console.error("Error fetching hero section:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch hero section",
      details: error.message 
    });
  }
};

// Update Hero Section
export const updateHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { mainTitle, subheadline, ctaText, ctaLink } = req.body;
    
    // Find existing hero
    const existingHero = await HeroSection.findById(id);
    if (!existingHero) {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    // Prepare update data
    const updateData = {
      mainTitle: mainTitle || existingHero.mainTitle,
      subheadline: subheadline || existingHero.subheadline,
      ctaText: ctaText || existingHero.ctaText,
      ctaLink: ctaLink || existingHero.ctaLink
    };

    // Handle new image upload
    if (req.file) {
      // Delete old image if it exists
      if (existingHero.heroImage) {
        const oldImagePath = path.join(__dirname, '..', existingHero.heroImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.heroImage = `/uploads/${req.file.filename}`;
    }

    const updatedHero = await HeroSection.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Hero section updated successfully",
      data: updatedHero
    });

  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error updating hero section:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    res.status(500).json({ 
      success: false,
      error: "Failed to update hero section",
      details: error.message 
    });
  }
};

// Delete Hero Section
export const deleteHero = async (req, res) => {
  try {
    const { id } = req.params;

    const hero = await HeroSection.findById(id);
    
    if (!hero) {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    // Delete associated image file
    if (hero.heroImage) {
      const imagePath = path.join(__dirname, '..', hero.heroImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await HeroSection.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Hero section deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting hero section:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: "Hero section not found"
      });
    }

    res.status(500).json({ 
      success: false,
      error: "Failed to delete hero section",
      details: error.message 
    });
  }
};

// Get Active Hero Section (latest one)
export const getActiveHero = async (req, res) => {
  try {
    const activeHero = await HeroSection.findOne().sort({ createdAt: -1 });

    if (!activeHero) {
      return res.status(404).json({
        success: false,
        error: "No active hero section found"
      });
    }

    res.status(200).json({
      success: true,
      data: activeHero
    });

  } catch (error) {
    console.error("Error fetching active hero section:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch active hero section",
      details: error.message 
    });
  }
};