import ClassSection from '../models/ClassSectionModel.js';

export const createClassSection = async (req, res) => {
  try {
    const { name, sections } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class name is required' 
      });
    }

    // Check for duplicate class name
    const existingClass = await ClassSection.findOne({ 
      name: name.trim() 
    });
    
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name already exists'
      });
    }

    // Create new class section
    const newClassSection = new ClassSection({ 
      name: name.trim(), 
      sections: sections || [] 
    });
    
    await newClassSection.save();
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClassSection
    });
    
  } catch (error) {
    console.error('Error creating class section:', error);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export const getClassSections = async (req, res) => {
  try {
    const classSections = await ClassSection.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: classSections.length,
      data: classSections
    });
  } catch (error) {
    console.error('Error fetching class sections:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching class sections',
      error: error.message 
    });
  }
};

// Update class section
export const updateClassSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sections } = req.body;

    const updatedClass = await ClassSection.findByIdAndUpdate(
      id,
      { name, sections },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });

  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

// Delete class section
export const deleteClassSection = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await ClassSection.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

// Add section to class
export const addSectionToClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionName } = req.body;

    // Validate input
    if (!sectionName || !sectionName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Section name is required'
      });
    }

    const classSection = await ClassSection.findById(id);
    
    if (!classSection) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if section already exists
    if (classSection.sections.includes(sectionName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Section already exists in this class'
      });
    }

    // Add the new section
    classSection.sections.push(sectionName.trim());
    await classSection.save();

    res.status(200).json({
      success: true,
      message: 'Section added successfully',
      data: classSection
    });

  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding section',
      error: error.message
    });
  }
};

// Delete section from class
export const deleteSectionFromClass = async (req, res) => {
  try {
    const { id, sectionIndex } = req.params;

    const classSection = await ClassSection.findById(id);
    
    if (!classSection) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if section index is valid
    if (sectionIndex < 0 || sectionIndex >= classSection.sections.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section index'
      });
    }

    // Remove the section
    const deletedSection = classSection.sections.splice(parseInt(sectionIndex), 1)[0];
    await classSection.save();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
      data: classSection,
      deletedSection: deletedSection
    });

  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: error.message
    });
  }
};