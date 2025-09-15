import Award from '../models/award.js';

// Get all awards for the current user
export const getAllAwards = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;
    
    // Build query
    const query = { user: userId };
    if (type && ['award', 'certification'].includes(type)) {
      query.type = type;
    }
    
    const awards = await Award.find(query)
      .sort({ dateIssued: -1 })
      .exec();
    
    return res.status(200).json({
      success: true,
      data: awards
    });
  } catch (error) {
    console.error('Error fetching awards:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch awards',
      error: error.message
    });
  }
};

// Get a specific award
export const getAward = async (req, res) => {
  try {
    const { id } = req.params;
    const award = await Award.findById(id);
    
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }
    
    // Check if the award belongs to the current user
    if (award.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this award'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: award
    });
  } catch (error) {
    console.error('Error fetching award:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch award',
      error: error.message
    });
  }
};

// Create a new award
export const createAward = async (req, res) => {
  try {
    const {
      title,
      issuer,
      description,
      dateIssued,
      credentialId,
      credentialUrl,
      type
    } = req.body;
    
    // Validate required fields
    if (!title || !dateIssued) {
      return res.status(400).json({
        success: false,
        message: 'Title and date issued are required'
      });
    }
    
    // Create new award
    const award = new Award({
      user: req.user._id,
      title,
      issuer,
      description,
      dateIssued,
      credentialId,
      credentialUrl,
      type: type || 'award'
    });
    
    await award.save();
    
    return res.status(201).json({
      success: true,
      message: 'Award created successfully',
      data: award
    });
  } catch (error) {
    console.error('Error creating award:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create award',
      error: error.message
    });
  }
};

// Update an award
export const updateAward = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the award
    const award = await Award.findById(id);
    
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }
    
    // Check if the award belongs to the current user
    if (award.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this award'
      });
    }
    
    // Update the award
    const updatedAward = await Award.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Award updated successfully',
      data: updatedAward
    });
  } catch (error) {
    console.error('Error updating award:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update award',
      error: error.message
    });
  }
};

// Delete an award
export const deleteAward = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the award
    const award = await Award.findById(id);
    
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }
    
    // Check if the award belongs to the current user
    if (award.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this award'
      });
    }
    
    // Delete the award
    await Award.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Award deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting award:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete award',
      error: error.message
    });
  }
};

// Verify a credential
export const verifyCredential = async (req, res) => {
  try {
    const { awardId } = req.params;
    const { credentialId } = req.body;
    
    // Find the award
    const award = await Award.findById(awardId);
    
    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }
    
    // Check if credential matches
    const isValid = award.credentialId === credentialId;
    
    return res.status(200).json({
      success: true,
      data: {
        isValid,
        details: isValid ? {
          title: award.title,
          issuer: award.issuer,
          dateIssued: award.dateIssued
        } : null
      }
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify credential',
      error: error.message
    });
  }
};



