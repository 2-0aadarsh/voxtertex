import EnhancedUser from '../models/enhancedUser.js';
import EnhancedProfile from '../models/enhancedProfile.js';
import bcrypt from 'bcryptjs';

/**
 * User Service - Handles all user-related operations
 */
class UserService {
  
  /**
   * Create a new user with basic information
   */
  async createUser(userData) {
    try {
      const { firstName, lastName, email, mobileNo, password, role, roleSpecificData } = userData;
      
      // Check if user already exists
      const existingUserQuery = { email };
      if (mobileNo) {
        existingUserQuery.$or = [{ email }, { mobileNo }];
      }
      
      const existingUser = await EnhancedUser.findOne(existingUserQuery);
      
      if (existingUser) {
        throw new Error('User already exists with this email or phone number');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = new EnhancedUser({
        firstName,
        lastName,
        email,
        mobileNo,
        password: hashedPassword,
        role,
        roleSpecificData: roleSpecificData || {},
        isEmailVerified: true // Since we're verifying via OTP
      });
      
      await user.save();
      
      // Create empty profile
      const profile = new EnhancedProfile({
        user: user._id
      });
      
      await profile.save();
      
      return {
        user: this.sanitizeUser(user),
        profile
      };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
  
  /**
   * Get user by ID with profile
   */
  async getUserById(userId) {
    try {
      const user = await EnhancedUser.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      const profile = await EnhancedProfile.findOne({ user: userId });
      
      return {
        user,
        profile
      };
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
  
  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await EnhancedUser.findOne({ email }).select('-password');
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }
  
  /**
   * Update user basic information
   */
  async updateUserBasicInfo(userId, updateData) {
    try {
      const allowedUpdates = [
        'bio', 'professionalTitle', 'location', 'areaOfExpertise',
        'roleSpecificData', 'mobileNo', 'yearsOfExperience'
      ];
      
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          // Special handling for areaOfExpertise to ensure it's always an array
          if (key === 'areaOfExpertise') {
            filteredData[key] = Array.isArray(updateData[key]) 
              ? updateData[key] 
              : [updateData[key]].filter(Boolean);
          } else if (key === 'mobileNo') {
            // Handle mobileNo specially - if it's empty, set it to null instead of empty string
            filteredData[key] = updateData[key] === '' ? null : updateData[key];
          } else {
            filteredData[key] = updateData[key];
          }
        }
      });
      
      console.log(`🔄 Updating user ${userId} with data:`, JSON.stringify(filteredData, null, 2));
      
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        { ...filteredData, isProfileComplete: true },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      user.checkProfileCompleteness();
      await user.save();
      
      // Also update the EnhancedProfile if yearsOfExperience is provided
      if (updateData.yearsOfExperience !== undefined) {
        await EnhancedProfile.findOneAndUpdate(
          { user: userId },
          { yearsOfExperience: updateData.yearsOfExperience },
          { upsert: true, new: true }
        );
        console.log(`✅ Updated EnhancedProfile with yearsOfExperience: ${updateData.yearsOfExperience}`);
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
  
  /**
   * Update user profile image
   */
  async updateProfileImage(userId, imageData) {
    try {
      // Check if we're getting a Cloudinary URL or a raw image
      const updateData = imageData.profileImageUrl 
        ? { 
            profileImageUrl: imageData.profileImageUrl,
            cloudinaryPublicId: imageData.cloudinaryPublicId 
          }
        : { profileImage: imageData };
      
      console.log(`🔄 Updating user ${userId} profile image with:`, JSON.stringify(updateData, null, 2));
      
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Set isProfileComplete to true if it wasn't already
      if (!user.isProfileComplete) {
        user.isProfileComplete = true;
        await user.save();
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to update profile image: ${error.message}`);
    }
  }
  
  /**
   * Verify user credentials for login
   */
  async verifyCredentials(email, password) {
    try {
      const user = await EnhancedUser.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      await user.updateLastLogin();
      
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Complete user signup process
   */
  async completeSignup(userId, signupData) {
    try {
      const { roleSpecificData, profileData } = signupData;
      
      // Update user with role-specific data
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        {
          roleSpecificData,
          signupComplete: true,
          isProfileComplete: true
        },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update profile if provided
      if (profileData) {
        await EnhancedProfile.findOneAndUpdate(
          { user: userId },
          profileData,
          { new: true, upsert: true }
        );
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to complete signup: ${error.message}`);
    }
  }
  
  /**
   * Search users
   */
  async searchUsers(query, filters = {}) {
    try {
      const searchCriteria = {
        $and: [
          { accountStatus: 'active' },
          {
            $or: [
              { firstName: { $regex: query, $options: 'i' } },
              { lastName: { $regex: query, $options: 'i' } },
              { professionalTitle: { $regex: query, $options: 'i' } },
              { bio: { $regex: query, $options: 'i' } }
            ]
          }
        ]
      };
      
      // Apply filters
      if (filters.role) {
        searchCriteria.$and.push({ role: filters.role });
      }
      
      if (filters.location) {
        searchCriteria.$and.push({ location: { $regex: filters.location, $options: 'i' } });
      }
      
      const users = await EnhancedUser.find(searchCriteria)
        .select('-password')
        .limit(20);
      
      return users;
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }
  
  /**
   * Get users by role
   */
  async getUsersByRole(role, page = 1, limit = 10) {
    try {
      const users = await EnhancedUser.find({ 
        role, 
        accountStatus: 'active' 
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
      return users;
    } catch (error) {
      throw new Error(`Failed to get users by role: ${error.message}`);
    }
  }
  
  /**
   * Deactivate user account
   */
  async deactivateUser(userId) {
    try {
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        { accountStatus: 'deactivated' },
        { new: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }
  
  /**
   * Remove sensitive information from user object
   */
  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

export default new UserService();

