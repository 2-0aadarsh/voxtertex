import EnhancedUser from '../models/enhancedUser.js';
import EnhancedProfile from '../models/enhancedProfile.js';
import Availability from '../models/availability.js';

// GET /api/speakers - Get all speakers with pagination, search, filtering, and sorting
export const getSpeakers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      expertise,
      industry,
      availabilityDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build aggregation pipeline for better filtering and sorting
    let pipeline = [
      // Match profiles with users
      {
        $match: {
          user: { $exists: true }
        }
      },
      // Lookup user data
      {
        $lookup: {
          from: 'enhancedusers',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      // Unwind user data
      {
        $unwind: '$userData'
      },
      // Match only speakers
      {
        $match: {
          'userData.role': 'speaker'
        }
      }
    ];

    // Add search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userData.firstName': { $regex: search, $options: 'i' } },
            { 'userData.lastName': { $regex: search, $options: 'i' } },
            { 'userData.areaOfExpertise': { $in: [new RegExp(search, 'i')] } },
            { 'userData.roleSpecificData.activities': { $in: [new RegExp(search, 'i')] } },
            { 'skills.name': { $in: [new RegExp(search, 'i')] } }
          ]
        }
      });
    }

    // Add expertise filter
    if (expertise) {
      pipeline.push({
        $match: {
          'userData.areaOfExpertise': { $in: [new RegExp(expertise, 'i')] }
        }
      });
    }

    // Add industry filter
    if (industry) {
      pipeline.push({
        $match: {
          'userData.roleSpecificData.industry': { $regex: industry, $options: 'i' }
        }
      });
    }

    // Add sorting
    let sortStage = {};
    if (sortBy === 'rating') {
      sortStage['ratings.overall.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'firstName') {
      sortStage['userData.firstName'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'lastName') {
      sortStage['userData.lastName'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortStage[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    pipeline.push({ $sort: sortStage });

    // Get total count before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await EnhancedProfile.aggregate(countPipeline);
    const totalSpeakers = countResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limitNum }
    );

    // Execute aggregation
    let speakers = await EnhancedProfile.aggregate(pipeline);

    // Get availability data for each speaker
    for (let speaker of speakers) {
      const availability = await Availability.findOne({ userId: speaker.userData._id }).lean();
      speaker.availability = availability;
    }

    // Filter by availability date if provided
    if (availabilityDate) {
      const targetDate = new Date(availabilityDate);
      speakers = speakers.filter(speaker => {
        if (!speaker.availability || !speaker.availability.dates) return false;
        return speaker.availability.dates.some(date => 
          new Date(date).toDateString() === targetDate.toDateString()
        );
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalSpeakers / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format response
    const formattedSpeakers = speakers.map(speaker => ({
      id: speaker.userData._id,
      firstName: speaker.userData.firstName,
      lastName: speaker.userData.lastName,
      email: speaker.userData.email,
      workEmail: speaker.userData.roleSpecificData?.workEmail,
      areaOfExpertise: speaker.userData.areaOfExpertise,
      industry: speaker.userData.roleSpecificData?.industry,
      activities: speaker.userData.roleSpecificData?.activities,
      socialLinks: speaker.userData.roleSpecificData?.socialLinks,
      profile: {
        bio: speaker.userData.bio,
        skills: speaker.skills,
        experience: speaker.experience,
        education: speaker.education,
        awards: speaker.awards,
        rating: speaker.ratings?.overall?.average || 0,
        ratingCount: speaker.ratings?.overall?.count || 0,
        profileViews: speaker.stats?.profileViews || 0,
        completedBookings: speaker.stats?.completedBookings || 0,
        totalEarnings: speaker.stats?.totalEarnings || 0
      },
      availability: speaker.availability ? {
        dates: speaker.availability.dates,
        eventTypes: speaker.availability.eventTypes,
        modes: speaker.availability.modes,
        timeSlots: speaker.availability.timeSlots
      } : null,
      isProfileComplete: speaker.userData.isProfileComplete,
      createdAt: speaker.userData.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        speakers: formattedSpeakers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSpeakers,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      },
      message: 'Speakers retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching speakers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching speakers',
      error: error.message
    });
  }
};

// GET /api/speakers/:id - Get a specific speaker by ID
export const getSpeakerById = async (req, res) => {
  try {
    const { id } = req.params;

    const speaker = await EnhancedProfile.findOne({ user: id })
      .populate({
        path: 'user',
        match: { role: 'speaker' },
        select: 'firstName lastName email roleSpecificData areaOfExpertise isProfileComplete createdAt updatedAt'
      })
      .lean();

    // Get availability data for the speaker
    if (speaker && speaker.user) {
      const availability = await Availability.findOne({ userId: speaker.user._id }).lean();
      speaker.availability = availability;
    }

    if (!speaker || !speaker.user) {
      return res.status(404).json({
        success: false,
        message: 'Speaker not found'
      });
    }

    // Format response
    const formattedSpeaker = {
      id: speaker.user._id,
      firstName: speaker.user.firstName,
      lastName: speaker.user.lastName,
      email: speaker.user.email,
      workEmail: speaker.user.roleSpecificData?.workEmail,
      areaOfExpertise: speaker.user.areaOfExpertise,
      industry: speaker.user.roleSpecificData?.industry,
      activities: speaker.user.roleSpecificData?.activities,
      socialLinks: speaker.user.roleSpecificData?.socialLinks,
      profile: {
        bio: speaker.user.bio,
        skills: speaker.skills,
        experience: speaker.experience,
        education: speaker.education,
        awards: speaker.awards,
        featuredVideos: speaker.featuredVideos,
        ratings: speaker.ratings,
        stats: speaker.stats
      },
      availability: speaker.availability ? {
        dates: speaker.availability.dates,
        eventTypes: speaker.availability.eventTypes,
        modes: speaker.availability.modes,
        timeSlots: speaker.availability.timeSlots
      } : null,
      isProfileComplete: speaker.user.isProfileComplete,
      createdAt: speaker.user.createdAt,
      updatedAt: speaker.user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: formattedSpeaker,
      message: 'Speaker retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching speaker:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching speaker',
      error: error.message
    });
  }
};

// GET /api/speakers/stats - Get speaker statistics
export const getSpeakerStats = async (req, res) => {
  try {
    // Get total speakers by counting EnhancedProfile documents with speaker users
    const totalSpeakers = await EnhancedProfile.countDocuments({
      user: { $exists: true }
    });

    // Get verified speakers
    const verifiedSpeakers = await EnhancedProfile.aggregate([
      {
        $lookup: {
          from: 'enhancedusers',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $match: {
          'userData.role': 'speaker',
          'userData.isEmailVerified': true,
          'userData.isMobileVerified': true
        }
      },
      { $count: 'count' }
    ]);

    // Get profile complete speakers
    const profileCompleteSpeakers = await EnhancedProfile.aggregate([
      {
        $lookup: {
          from: 'enhancedusers',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $match: {
          'userData.role': 'speaker',
          'userData.isProfileComplete': true
        }
      },
      { $count: 'count' }
    ]);

    // Get top industries
    const industryStats = await EnhancedProfile.aggregate([
      {
        $lookup: {
          from: 'enhancedusers',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $match: { 'userData.role': 'speaker' } },
      { $unwind: '$userData' },
      { $group: { _id: '$userData.roleSpecificData.industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSpeakers,
        verifiedSpeakers: verifiedSpeakers[0]?.count || 0,
        profileCompleteSpeakers: profileCompleteSpeakers[0]?.count || 0,
        topIndustries: industryStats
      },
      message: 'Speaker statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching speaker stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching speaker statistics',
      error: error.message
    });
  }
};
