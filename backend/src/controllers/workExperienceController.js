import WorkExperience from '../models/workExperience.js';

// Get all work experiences for the current user
export const getAllWorkExperiences = async (req, res) => {
  try {
    const userId = req.user._id;
    const workExperiences = await WorkExperience.find({ user: userId })
      .sort({ order: -1, startDate: -1 })
      .exec();
    
    return res.status(200).json({
      success: true,
      data: workExperiences
    });
  } catch (error) {
    console.error('Error fetching work experiences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch work experiences',
      error: error.message
    });
  }
};

// Get a specific work experience
export const getWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const workExperience = await WorkExperience.findById(id);
    
    if (!workExperience) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }
    
    // Check if the work experience belongs to the current user
    if (workExperience.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this work experience'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: workExperience
    });
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch work experience',
      error: error.message
    });
  }
};

// Create a new work experience
export const createWorkExperience = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      employmentType,
      startDate,
      endDate,
      isCurrentlyWorking,
      description,
      skills
    } = req.body;
    
    // Validate required fields
    if (!title || !company || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, company, and start date are required'
      });
    }
    
    // Get the highest order value for the user's work experiences
    const highestOrderExp = await WorkExperience.findOne({ user: req.user._id })
      .sort({ order: -1 })
      .limit(1);
    
    const newOrder = highestOrderExp ? highestOrderExp.order + 1 : 0;
    
    // Convert date strings to Date objects if they exist
    const processedStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const processedEndDate = endDate && typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Create new work experience
    const workExperience = new WorkExperience({
      user: req.user._id,
      title,
      company,
      location,
      employmentType,
      startDate: processedStartDate,
      endDate: isCurrentlyWorking ? null : processedEndDate,
      isCurrentlyWorking,
      description,
      skills: skills || [],
      order: newOrder
    });
    
    await workExperience.save();
    
    return res.status(201).json({
      success: true,
      message: 'Work experience created successfully',
      data: workExperience
    });
  } catch (error) {
    console.error('Error creating work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create work experience',
      error: error.message
    });
  }
};

// Update a work experience
export const updateWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the work experience
    const workExperience = await WorkExperience.findById(id);
    
    if (!workExperience) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }
    
    // Check if the work experience belongs to the current user
    if (workExperience.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this work experience'
      });
    }
    
    // Handle isCurrentlyWorking and endDate logic
    if (updates.isCurrentlyWorking === true) {
      updates.endDate = null;
    }
    
    // Convert date strings to Date objects if they exist
    if (updates.startDate && typeof updates.startDate === 'string') {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate && typeof updates.endDate === 'string') {
      updates.endDate = new Date(updates.endDate);
    }
    
    // Update the work experience
    const updatedWorkExperience = await WorkExperience.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Work experience updated successfully',
      data: updatedWorkExperience
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update work experience',
      error: error.message
    });
  }
};

// Delete a work experience
export const deleteWorkExperience = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the work experience
    const workExperience = await WorkExperience.findById(id);
    
    if (!workExperience) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found'
      });
    }
    
    // Check if the work experience belongs to the current user
    if (workExperience.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this work experience'
      });
    }
    
    // Delete the work experience
    await WorkExperience.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Work experience deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete work experience',
      error: error.message
    });
  }
};

// Reorder work experiences
export const reorderWorkExperiences = async (req, res) => {
  try {
    const { experiences } = req.body;
    
    if (!Array.isArray(experiences)) {
      return res.status(400).json({
        success: false,
        message: 'Experiences must be an array'
      });
    }
    
    // Process each experience in the array
    const updatePromises = experiences.map(async ({ id, newOrder }) => {
      const exp = await WorkExperience.findById(id);
      
      if (!exp) {
        throw new Error(`Work experience with ID ${id} not found`);
      }
      
      if (exp.user.toString() !== req.user._id.toString()) {
        throw new Error(`Unauthorized access to work experience with ID ${id}`);
      }
      
      return WorkExperience.findByIdAndUpdate(id, { order: newOrder });
    });
    
    await Promise.all(updatePromises);
    
    // Get the updated list
    const updatedExperiences = await WorkExperience.find({ user: req.user._id })
      .sort({ order: -1, startDate: -1 })
      .exec();
    
    return res.status(200).json({
      success: true,
      message: 'Work experiences reordered successfully',
      data: updatedExperiences
    });
  } catch (error) {
    console.error('Error reordering work experiences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reorder work experiences',
      error: error.message
    });
  }
};



