// controllers/activityController.js
import Activity from '../models/AssemblyActivity.js';

// Create single activity
export const getActivity = async (req, res) => {
  try {
    const data = await Activity.find();
    res.status(200).json({
      success: true,
      data: data
    });
     
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Activity already exists for this student in the given month and year'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating activity',
      error: error.message
    });
  }
};

// Create multiple activities (bulk insert)
export const createBulkActivities = async (req, res) => {
  try {
    const { activities } = req.body;
    
    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Activities array is required and cannot be empty'
      });
    }

    // Validate each activity has required fields
    for (const activity of activities) {
      if (!activity.studentId || !activity.month || !activity.year) {
        return res.status(400).json({
          success: false,
          message: 'Each activity must have studentId, month, and year'
        });
      }
    }

    const createdActivities = await Activity.insertMany(activities, { 
      ordered: false 
    });
    
    res.status(201).json({
      success: true,
      message: `${createdActivities.length} activities created successfully`,
      data: createdActivities
    });
  } catch (error) {
    // Handle bulk write errors
    if (error.writeErrors) {
      const errorMessages = error.writeErrors.map(err => err.errmsg);
      return res.status(400).json({
        success: false,
        message: 'Some activities could not be created',
        errors: errorMessages,
        createdCount: error.insertedDocs?.length || 0
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating activities',
      error: error.message
    });
  }
};

// Get activities by student ID
export const getActivitiesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const activities = await Activity.find({ studentId })
      .sort({ year: -1, month: -1 });
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message
    });
  }
};

// Update activity completion status
export const updateActivityCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    const updateData = { completed };
    if (completed) {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }
    
    const activity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: activity
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating activity',
      error: error.message
    });
  }
};

// Delete activity
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Activity.findByIdAndDelete(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message
    });
  }
};