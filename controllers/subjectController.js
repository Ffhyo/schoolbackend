import subjectModel from "../models/subjectModel.js";
import mongoose from "mongoose";

export const createSubject = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      passMark,
      fullMark, 
      description, 
      
      credits, 
      type, 
      practicalpassMarks, 
      practicalfullMarks 
    } = req.body;

    // Check if subject with same code already exists
    const existingSubject = await subjectModel.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }

    const newSubject = new subjectModel({ 
      name, 
      code, 
      passMark,
      fullMark, 
      description, 
      
      credits, 
      type, 
      practicalpassMarks, 
      practicalfullMarks 
    });
    
    await newSubject.save();
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: newSubject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  } 
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await subjectModel.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID'
      });
    }

    const subject = await subjectModel.findById(id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID'
      });
    }

    // Check if code is being updated and if it already exists
    if (updateData.code) {
      const existingSubject = await subjectModel.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this code already exists'
        });
      }
    }

    const updatedSubject = await subjectModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID'
      });
    }

    const deletedSubject = await subjectModel.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
      data: deletedSubject
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};

export const getSubjectsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const validTypes = ['core', 'elective', 'optional'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject type'
      });
    }

    const subjects = await subjectModel.find({ type }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects by type:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error', 
      error: error.message 
    });
  }
};