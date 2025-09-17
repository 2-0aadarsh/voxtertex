/**
 * Migration script to move yearsOfExperience from EnhancedProfile to EnhancedUser
 * This ensures data consistency after adding yearsOfExperience to the User model
 */

import mongoose from 'mongoose';
import EnhancedUser from '../models/enhancedUser.js';
import EnhancedProfile from '../models/enhancedProfile.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrateYearsOfExperience = async () => {
  try {
    console.log('🚀 Starting yearsOfExperience migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voxvertex');
    console.log('✅ Connected to MongoDB');
    
    // Find all EnhancedProfile documents that have yearsOfExperience
    const profilesWithExperience = await EnhancedProfile.find({
      yearsOfExperience: { $exists: true, $ne: null }
    }).populate('user');
    
    console.log(`📊 Found ${profilesWithExperience.length} profiles with yearsOfExperience`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const profile of profilesWithExperience) {
      if (!profile.user) {
        console.log(`⚠️ Skipping profile ${profile._id} - no associated user`);
        skippedCount++;
        continue;
      }
      
      const userId = profile.user._id;
      const yearsOfExperience = profile.yearsOfExperience;
      
      // Check if user already has yearsOfExperience set
      const user = await EnhancedUser.findById(userId);
      if (user && user.yearsOfExperience !== undefined && user.yearsOfExperience !== null) {
        console.log(`⏭️ Skipping user ${userId} - already has yearsOfExperience: ${user.yearsOfExperience}`);
        skippedCount++;
        continue;
      }
      
      // Update the user with yearsOfExperience from profile
      await EnhancedUser.findByIdAndUpdate(
        userId,
        { yearsOfExperience: yearsOfExperience },
        { new: true }
      );
      
      console.log(`✅ Migrated user ${userId}: yearsOfExperience = ${yearsOfExperience}`);
      migratedCount++;
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️ Skipped: ${skippedCount} users`);
    console.log(`📊 Total processed: ${profilesWithExperience.length} profiles`);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateYearsOfExperience();
}

export default migrateYearsOfExperience;



