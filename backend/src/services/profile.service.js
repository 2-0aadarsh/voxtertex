import EnhancedProfile from '../models/enhancedProfile.js';
import EnhancedUser from '../models/enhancedUser.js';
import mongoose from 'mongoose';

class ProfileService {
  /**
   * Get user profile by userId
   */
  static async getProfile(userId) {
    try {
      const user = await EnhancedUser.findById(userId).populate('profile');
      if (!user) {
        throw new Error('User not found');
      }

      let profile = user.profile;
      if (!profile) {
        // Create a new profile if it doesn't exist
        profile = new EnhancedProfile({
          user: userId
        });
        await profile.save();
        
        // Update user with profile reference
        user.profile = profile._id;
        await user.save();
      }

      return profile;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  /**
   * Add work experience
   */
  static async addExperience(userId, experienceData) {
    try {
      const profile = await this.getProfile(userId);
      
      const newExperience = {
        _id: new mongoose.Types.ObjectId(),
        ...experienceData
      };
      
      profile.experience.push(newExperience);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add experience: ${error.message}`);
    }
  }

  /**
   * Update work experience
   */
  static async updateExperience(userId, experienceId, updateData) {
    try {
      const profile = await this.getProfile(userId);
      
      const experienceIndex = profile.experience.findIndex(
        exp => exp._id.toString() === experienceId
      );
      
      if (experienceIndex === -1) {
        throw new Error('Experience not found');
      }
      
      // Update the experience
      profile.experience[experienceIndex] = {
        ...profile.experience[experienceIndex].toObject(),
        ...updateData
      };
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update experience: ${error.message}`);
    }
  }

  /**
   * Remove work experience
   */
  static async removeExperience(userId, experienceId) {
    try {
      const profile = await this.getProfile(userId);
      
      profile.experience = profile.experience.filter(
        exp => exp._id.toString() !== experienceId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove experience: ${error.message}`);
    }
  }

  /**
   * Add education
   */
  static async addEducation(userId, educationData) {
    try {
      const profile = await this.getProfile(userId);
      
      const newEducation = {
        _id: new mongoose.Types.ObjectId(),
        ...educationData
      };
      
      profile.education.push(newEducation);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add education: ${error.message}`);
    }
  }

  /**
   * Update education
   */
  static async updateEducation(userId, educationId, updateData) {
    try {
      const profile = await this.getProfile(userId);
      
      const educationIndex = profile.education.findIndex(
        edu => edu._id.toString() === educationId
      );
      
      if (educationIndex === -1) {
        throw new Error('Education not found');
      }
      
      profile.education[educationIndex] = {
        ...profile.education[educationIndex].toObject(),
        ...updateData
      };
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update education: ${error.message}`);
    }
  }

  /**
   * Remove education
   */
  static async removeEducation(userId, educationId) {
    try {
      const profile = await this.getProfile(userId);
      
      profile.education = profile.education.filter(
        edu => edu._id.toString() !== educationId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove education: ${error.message}`);
    }
  }

  /**
   * Add award
   */
  static async addAward(userId, awardData) {
    try {
      const profile = await this.getProfile(userId);
      
      const newAward = {
        _id: new mongoose.Types.ObjectId(),
        ...awardData
      };
      
      profile.awards.push(newAward);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add award: ${error.message}`);
    }
  }

  /**
   * Update award
   */
  static async updateAward(userId, awardId, updateData) {
    try {
      const profile = await this.getProfile(userId);
      
      const awardIndex = profile.awards.findIndex(
        award => award._id.toString() === awardId
      );
      
      if (awardIndex === -1) {
        throw new Error('Award not found');
      }
      
      profile.awards[awardIndex] = {
        ...profile.awards[awardIndex].toObject(),
        ...updateData
      };
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update award: ${error.message}`);
    }
  }

  /**
   * Remove award
   */
  static async removeAward(userId, awardId) {
    try {
      const profile = await this.getProfile(userId);
      
      profile.awards = profile.awards.filter(
        award => award._id.toString() !== awardId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove award: ${error.message}`);
    }
  }

  /**
   * Add featured video
   */
  static async addVideo(userId, videoData) {
    try {
      const profile = await this.getProfile(userId);
      
      const newVideo = {
        _id: new mongoose.Types.ObjectId(),
        ...videoData
      };
      
      profile.videos.push(newVideo);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add video: ${error.message}`);
    }
  }

  /**
   * Update featured video
   */
  static async updateVideo(userId, videoId, updateData) {
    try {
      const profile = await this.getProfile(userId);
      
      const videoIndex = profile.videos.findIndex(
        video => video._id.toString() === videoId
      );
      
      if (videoIndex === -1) {
        throw new Error('Video not found');
      }
      
      profile.videos[videoIndex] = {
        ...profile.videos[videoIndex].toObject(),
        ...updateData
      };
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  /**
   * Remove featured video
   */
  static async removeVideo(userId, videoId) {
    try {
      const profile = await this.getProfile(userId);
      
      profile.videos = profile.videos.filter(
        video => video._id.toString() !== videoId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove video: ${error.message}`);
    }
  }

  /**
   * Update skills
   */
  static async updateSkills(userId, skills) {
    try {
      const profile = await this.getProfile(userId);
      profile.skills = skills;
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update skills: ${error.message}`);
    }
  }

  /**
   * Add review
   */
  static async addReview(userId, reviewData) {
    try {
      const profile = await this.getProfile(userId);
      
      const newReview = {
        _id: new mongoose.Types.ObjectId(),
        ...reviewData
      };
      
      profile.reviews.push(newReview);
      
      // Update average rating
      const totalReviews = profile.reviews.length;
      const totalRating = profile.reviews.reduce((sum, review) => sum + review.rating, 0);
      profile.rating = totalRating / totalReviews;
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(userId, privacyData) {
    try {
      const profile = await this.getProfile(userId);
      profile.privacySettings = { ...profile.privacySettings, ...privacyData };
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update privacy settings: ${error.message}`);
    }
  }

  /**
   * Get profile statistics
   */
  static async getProfileStats(userId) {
    try {
      const profile = await this.getProfile(userId);
      
      return {
        totalExperience: profile.experience.length,
        totalEducation: profile.education.length,
        totalAwards: profile.awards.length,
        totalVideos: profile.videos.length,
        totalReviews: profile.reviews.length,
        averageRating: profile.ratings.overall.average,
        profileCompleteness: this.calculateCompleteness(profile)
      };
    } catch (error) {
      throw new Error(`Failed to get profile stats: ${error.message}`);
    }
  }

  /**
   * Search profiles
   */
  static async searchProfiles(query, filters = {}) {
    try {
      const searchCriteria = {
        $or: [
          { 'skills.name': { $regex: query, $options: 'i' } }
        ]
      };

      if (filters.minRating) {
        searchCriteria['ratings.overall.average'] = { $gte: filters.minRating };
      }

      const profiles = await EnhancedProfile.find(searchCriteria)
        .populate('user', 'firstName lastName email')
        .limit(50);

      return profiles;
    } catch (error) {
      throw new Error(`Failed to search profiles: ${error.message}`);
    }
  }

  /**
   * Calculate profile completeness percentage
   */
  static calculateCompleteness(profile) {
    let completedFields = 0;
    const totalFields = 10; // Adjust based on your requirements

    if (profile.experience?.length > 0) completedFields++;
    if (profile.education?.length > 0) completedFields++;
    if (profile.skills?.length > 0) completedFields++;
    if (profile.videos?.length > 0) completedFields++;
    if (profile.awards?.length > 0) completedFields++;
    
    // Add more completion criteria as needed
    completedFields += 5; // Base completion for having a profile

    return Math.round((completedFields / totalFields) * 100);
  }
}

export default ProfileService;
