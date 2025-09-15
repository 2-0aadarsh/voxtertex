import Education from '../models/education.js';

// Get all education entries for the current user
export const getAllEducation = async (req, res) => {
  try {
    const userId = req.user._id;
    const education = await Education.find({ user: userId })
      .sort({ order: -1, startDate: -1 })
      .exec();
    
    return res.status(200).json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error fetching education:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch education',
      error: error.message
    });
  }
};

// Get a specific education entry
export const getEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const education = await Education.findById(id);
    
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }
    
    // Check if the education belongs to the current user
    if (education.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this education'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: education
    });
  } catch (error) {
    console.error('Error fetching education:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch education',
      error: error.message
    });
  }
};

// Create a new education entry
export const createEducation = async (req, res) => {
  try {
    const {
      degree,
      institution,
      fieldOfStudy,
      startDate,
      endDate,
      isCurrentlyStudying,
      grade,
      description
    } = req.body;
    
    // Validate required fields
    if (!degree || !institution || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Degree, institution, and start date are required'
      });
    }
    
    // Get the highest order value for the user's education entries
    const highestOrderEdu = await Education.findOne({ user: req.user._id })
      .sort({ order: -1 })
      .limit(1);
    
    const newOrder = highestOrderEdu ? highestOrderEdu.order + 1 : 0;
    
    // Create new education entry
    const education = new Education({
      user: req.user._id,
      degree,
      institution,
      fieldOfStudy,
      startDate,
      endDate: isCurrentlyStudying ? null : endDate,
      isCurrentlyStudying,
      grade,
      description,
      order: newOrder
    });
    
    await education.save();
    
    return res.status(201).json({
      success: true,
      message: 'Education created successfully',
      data: education
    });
  } catch (error) {
    console.error('Error creating education:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create education',
      error: error.message
    });
  }
};

// Update an education entry
export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the education
    const education = await Education.findById(id);
    
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }
    
    // Check if the education belongs to the current user
    if (education.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this education'
      });
    }
    
    // Handle isCurrentlyStudying and endDate logic
    if (updates.isCurrentlyStudying === true) {
      updates.endDate = null;
    }
    
    // Update the education
    const updatedEducation = await Education.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: updatedEducation
    });
  } catch (error) {
    console.error('Error updating education:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update education',
      error: error.message
    });
  }
};

// Delete an education entry
export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the education
    const education = await Education.findById(id);
    
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }
    
    // Check if the education belongs to the current user
    if (education.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this education'
      });
    }
    
    // Delete the education
    await Education.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Education deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting education:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete education',
      error: error.message
    });
  }
};



