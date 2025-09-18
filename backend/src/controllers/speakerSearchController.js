import EnhancedUser from '../models/enhancedUser.js';
import EnhancedProfile from '../models/enhancedProfile.js';
import Availability from '../models/availability.js';

/**
 * Search speakers based on various keywords
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchSpeakers = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;

    // Handle multiple query parameters - take the first one or join them
    let searchQuery;
    if (Array.isArray(query)) {
      // If multiple q parameters, join them with space
      searchQuery = query.join(' ');
    } else if (typeof query === 'string') {
      searchQuery = query;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a string',
        data: []
      });
    }

    // Validate query parameter
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        data: []
      });
    }

    const searchTerm = searchQuery.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create search conditions for various fields
    const searchConditions = {
      role: 'speaker', // Only search for speakers
      $or: [
        // Basic information search
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { mobileNo: { $regex: searchTerm, $options: 'i' } },
        
        // Profile information search
        { bio: { $regex: searchTerm, $options: 'i' } },
        { professionalTitle: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
        
        // Array fields search
        { areaOfExpertise: { $in: [new RegExp(searchTerm, 'i')] } },
        
        // Role-specific data search
        { 'roleSpecificData.industry': { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.activities': { $in: [new RegExp(searchTerm, 'i')] } },
        { 'roleSpecificData.socialLinks.linkedin': { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.socialLinks.twitter': { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.socialLinks.website': { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.socialLinks.portfolio': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Execute search query
    const speakers = await EnhancedUser.find(searchConditions)
      .select('-password -__v') // Exclude sensitive fields
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await EnhancedUser.countDocuments(searchConditions);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format response data
    const formattedSpeakers = speakers.map(speaker => ({
      _id: speaker._id,
      firstName: speaker.firstName,
      lastName: speaker.lastName,
      fullName: speaker.fullName,
      email: speaker.email,
      mobileNo: speaker.mobileNo,
      profileImageUrl: speaker.profileImageUrl,
      bio: speaker.bio,
      professionalTitle: speaker.professionalTitle,
      location: speaker.location,
      areaOfExpertise: speaker.areaOfExpertise,
      yearsOfExperience: speaker.yearsOfExperience,
      roleSpecificData: {
        industry: speaker.roleSpecificData?.industry,
        activities: speaker.roleSpecificData?.activities,
        socialLinks: speaker.roleSpecificData?.socialLinks
      },
      isProfileComplete: speaker.isProfileComplete,
      createdAt: speaker.createdAt
    }));

    // Response with pagination
    res.status(200).json({
      success: true,
      message: `Found ${totalCount} speaker(s) matching "${searchTerm}"`,
      data: {
        speakers: formattedSpeakers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error searching speakers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching speakers',
      error: error.message
    });
  }
};

/**
 * Get speaker suggestions based on partial search term
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getSpeakerSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    // Handle multiple query parameters - take the first one or join them
    let searchQuery;
    if (Array.isArray(query)) {
      // If multiple q parameters, join them with space
      searchQuery = query.join(' ');
    } else if (typeof query === 'string') {
      searchQuery = query;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Search query is required and must be a string',
        data: []
      });
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
        data: []
      });
    }

    const searchTerm = searchQuery.trim();

    // Search for suggestions (more focused on names and titles)
    const suggestions = await EnhancedUser.find({
      role: 'speaker',
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { professionalTitle: { $regex: searchTerm, $options: 'i' } },
        { 'roleSpecificData.industry': { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('firstName lastName professionalTitle roleSpecificData.industry profileImageUrl')
    .limit(parseInt(limit));

    const formattedSuggestions = suggestions.map(speaker => ({
      _id: speaker._id,
      fullName: `${speaker.firstName} ${speaker.lastName}`,
      professionalTitle: speaker.professionalTitle,
      industry: speaker.roleSpecificData?.industry,
      profileImageUrl: speaker.profileImageUrl
    }));

    res.status(200).json({
      success: true,
      message: 'Speaker suggestions retrieved successfully',
      data: formattedSuggestions
    });

  } catch (error) {
    console.error('Error getting speaker suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting suggestions',
      error: error.message
    });
  }
};

/**
 * Search and filter speakers based on availability and other criteria
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchSpeakersWithFilters = async (req, res) => {
  try {
    console.log('🔍 searchSpeakersWithFilters called. Raw req.query:', req.query);
    
    const {
      // Search query
      q: query,
      
      // Pagination
      page = 1,
      limit = 10,
      
      // Availability filters
      availabilityDate,
      eventTypes,
      subTypes,
      minFee,
      maxFee,
      deliveryModes,
      
      // Profile filters
      yearsOfExperience,
      location,
      expertise,
      topics,
      
      // Trust & Verification
      identityVerified,
      credentialsVerified
    } = req.query;

    console.log('🔍 Parsed availabilityDate:', availabilityDate);

    // Build base search conditions
    let searchConditions = {
      role: 'speaker'
    };

    // Add text search if provided
    if (query) {
      let searchQuery;
      if (Array.isArray(query)) {
        searchQuery = query.join(' ');
      } else if (typeof query === 'string') {
        searchQuery = query;
      }

      if (searchQuery && searchQuery.trim().length > 0) {
        const searchTerm = searchQuery.trim();
        searchConditions.$or = [
          { firstName: { $regex: searchTerm, $options: 'i' } },
          { lastName: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { mobileNo: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
          { professionalTitle: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { areaOfExpertise: { $in: [new RegExp(searchTerm, 'i')] } },
          { 'roleSpecificData.industry': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.activities': { $in: [new RegExp(searchTerm, 'i')] } },
          { 'roleSpecificData.socialLinks.linkedin': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.twitter': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.website': { $regex: searchTerm, $options: 'i' } },
          { 'roleSpecificData.socialLinks.portfolio': { $regex: searchTerm, $options: 'i' } }
        ];
      }
    }

    // Add profile-based filters
    if (yearsOfExperience) {
      searchConditions.yearsOfExperience = { $gte: parseInt(yearsOfExperience) };
    }

    if (location) {
      const trimmedLocation = location.trim();
      console.log('🎯 Location before trimming:', location);
      console.log('🎯 Location after trimming:', trimmedLocation);
      searchConditions.location = { $regex: trimmedLocation, $options: 'i' };
    }

    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      // Trim whitespace and newlines from expertise
      const trimmedExpertise = expertiseArray.map(exp => exp.trim());
      console.log('🎯 Expertise before trimming:', expertiseArray);
      console.log('🎯 Expertise after trimming:', trimmedExpertise);
      searchConditions.areaOfExpertise = { $in: trimmedExpertise };
    }

    if (topics) {
      const topicsArray = Array.isArray(topics) ? topics : [topics];
      // Trim whitespace and newlines from topics
      const trimmedTopics = topicsArray.map(topic => topic.trim());
      console.log('🎯 Topics before trimming:', topicsArray);
      console.log('🎯 Topics after trimming:', trimmedTopics);
      searchConditions['roleSpecificData.activities'] = { $in: trimmedTopics };
    }

    // Get all speakers matching basic criteria first
    const allSpeakers = await EnhancedUser.find(searchConditions)
      .select('-password -__v')
      .sort({ createdAt: -1 });

    // If no availability filters, return basic results
    if (!availabilityDate && !eventTypes && !subTypes && !minFee && !maxFee && !deliveryModes) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedSpeakers = allSpeakers.slice(skip, skip + parseInt(limit));
      const totalCount = allSpeakers.length;

      const formattedSpeakers = paginatedSpeakers.map(speaker => ({
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        message: `Found ${totalCount} speaker(s) matching criteria`,
        data: {
          speakers: formattedSpeakers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Build availability filter conditions
    let availabilityConditions = {};

    // Filter by availability date
    if (availabilityDate) {
      console.log('📅 Original availabilityDate from query:', availabilityDate);
      
      // Handle multiple dates or single date
      let datesToFilter = [];
      
      if (Array.isArray(availabilityDate)) {
        // Multiple dates provided
        datesToFilter = availabilityDate;
        console.log('📅 Multiple dates provided:', datesToFilter);
      } else if (typeof availabilityDate === 'string') {
        // Single date provided
        datesToFilter = [availabilityDate];
        console.log('📅 Single date provided:', datesToFilter);
      }
      
      // Create date ranges for all provided dates
      const dateRanges = datesToFilter.map(dateStr => {
        try {
          const targetDate = new Date(dateStr);
          
          // Validate the date
          if (isNaN(targetDate.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`);
          }
          
          const startOfDay = new Date(targetDate);
          startOfDay.setUTCHours(0, 0, 0, 0);
          
          const endOfDay = new Date(targetDate);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          return {
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
            originalDate: dateStr
          };
        } catch (error) {
          console.error(`❌ Error parsing date: ${dateStr}`, error);
          throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }
      });
      
      console.log('📅 Date ranges:', dateRanges);
      
      // If multiple dates, use $or to match any of them
      if (dateRanges.length === 1) {
        availabilityConditions.dates = {
          $gte: new Date(dateRanges[0].startOfDay),
          $lte: new Date(dateRanges[0].endOfDay)
        };
      } else {
        // Multiple dates - find records that have dates within any of the ranges
        availabilityConditions.$or = dateRanges.map(range => ({
          dates: {
            $gte: new Date(range.startOfDay),
            $lte: new Date(range.endOfDay)
          }
        }));
      }
    }

    // Filter by event types
    if (eventTypes) {
      const eventTypesArray = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      // Trim whitespace and newlines from event types
      const trimmedEventTypes = eventTypesArray.map(type => type.trim());
      console.log('🎯 Event types before trimming:', eventTypesArray);
      console.log('🎯 Event types after trimming:', trimmedEventTypes);
      availabilityConditions['eventTypes.category'] = { $in: trimmedEventTypes };
    }

    // Filter by sub types
    if (subTypes) {
      const subTypesArray = Array.isArray(subTypes) ? subTypes : [subTypes];
      // Trim whitespace and newlines from sub types
      const trimmedSubTypes = subTypesArray.map(type => type.trim());
      console.log('🎯 Sub types before trimming:', subTypesArray);
      console.log('🎯 Sub types after trimming:', trimmedSubTypes);
      availabilityConditions['eventTypes.subTypes.name'] = { $in: trimmedSubTypes };
    }

    // Filter by delivery modes
    if (deliveryModes) {
      const modesArray = Array.isArray(deliveryModes) ? deliveryModes : [deliveryModes];
      // Trim whitespace and newlines from delivery modes
      const trimmedModes = modesArray.map(mode => mode.trim());
      console.log('🎯 Delivery modes before trimming:', modesArray);
      console.log('🎯 Delivery modes after trimming:', trimmedModes);
      availabilityConditions.modes = { $in: trimmedModes };
    }

    // Filter by fee range
    if (minFee || maxFee) {
      const feeConditions = {};
      if (minFee) {
        feeConditions['eventTypes.subTypes.price'] = { $gte: parseInt(minFee) };
      }
      if (maxFee) {
        feeConditions['eventTypes.subTypes.price'] = { 
          ...feeConditions['eventTypes.subTypes.price'],
          $lte: parseInt(maxFee) 
        };
      }
      availabilityConditions = { ...availabilityConditions, ...feeConditions };
    }

    // Handle combining $or conditions if we have multiple date ranges
    if (availabilityConditions.$or && Object.keys(availabilityConditions).length > 1) {
      // If we have other conditions besides $or, we need to restructure
      const orConditions = availabilityConditions.$or;
      delete availabilityConditions.$or;
      
      // Create a new $and condition to combine date ranges with other filters
      availabilityConditions.$and = [
        { $or: orConditions },
        ...Object.keys(availabilityConditions).map(key => ({
          [key]: availabilityConditions[key]
        }))
      ];
      
      // Clear the individual conditions since they're now in $and
      Object.keys(availabilityConditions).forEach(key => {
        if (key !== '$and') {
          delete availabilityConditions[key];
        }
      });
    }

    console.log('🔍 Final availability conditions:', JSON.stringify(availabilityConditions, null, 2));

    // For debugging: Get all availability records to see what we have
    const allAvailabilityRecords = await Availability.find({})
      .select('userId dates eventTypes modes timeSlots');
    console.log('🔍 All availability records in database:', allAvailabilityRecords.length);
    allAvailabilityRecords.forEach((record, index) => {
      console.log(`📅 Record ${index + 1}:`, {
        _id: record._id,
        userId: record.userId,
        dates: record.dates.map(d => d.toISOString()),
        eventTypes: record.eventTypes
      });
    });

    // Check if the user exists in EnhancedUser collection
    const userIdToCheck = '68c9829eb4953beaec50e44a';
    const userExists = await EnhancedUser.findById(userIdToCheck);
    console.log('👤 User exists check:', {
      userId: userIdToCheck,
      exists: !!userExists,
      role: userExists?.role,
      firstName: userExists?.firstName,
      lastName: userExists?.lastName
    });

    // Direct database check for the specific availability record
    const directAvailabilityCheck = await Availability.findById('68cb1ae91ed115482669cf92');
    console.log('🔍 Direct availability record check:', {
      _id: directAvailabilityCheck?._id,
      userId: directAvailabilityCheck?.userId,
      dates: directAvailabilityCheck?.dates?.map(d => d.toISOString()),
      datesCount: directAvailabilityCheck?.dates?.length
    });

    // Get availability records matching the criteria
    const availabilityRecords = await Availability.find(availabilityConditions)
      .populate({
        path: 'userId',
        model: 'EnhancedUser',
        select: 'firstName lastName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt role',
        match: { role: 'speaker' } // Only populate if user is a speaker
      })
      .select('userId eventTypes modes timeSlots dates');

    console.log('🔍 Availability records found:', availabilityRecords.length);
    console.log('🔍 Sample availability record:', availabilityRecords[0]);

    // Filter out records with null userId and extract unique speaker IDs
    const validAvailabilityRecords = availabilityRecords.filter(record => {
      if (!record.userId) {
        console.log('⚠️ Found availability record with null userId:', record._id);
        return false;
      }
      if (!record.userId._id) {
        console.log('⚠️ Found availability record with userId but no _id:', record._id, record.userId);
        return false;
      }
      return true;
    });

    console.log('✅ Valid availability records:', validAvailabilityRecords.length);
    const availableSpeakerIds = [...new Set(validAvailabilityRecords.map(record => record.userId._id.toString()))];
    console.log('🎯 Available speaker IDs:', availableSpeakerIds);

    // Alternative approach: If no valid records from population, try direct userId matching
    if (validAvailabilityRecords.length === 0 && availabilityRecords.length > 0) {
      console.log('🔄 Trying alternative approach - direct userId matching');
      
      // Get all userIds from availability records (even if population failed)
      const allAvailabilityUserIds = [...new Set(availabilityRecords.map(record => record.userId?.toString()).filter(Boolean))];
      console.log('🔄 All availability userIds:', allAvailabilityUserIds);
      
      // Find speakers that match these userIds
      const speakersFromAvailability = await EnhancedUser.find({
        _id: { $in: allAvailabilityUserIds },
        role: 'speaker'
      }).select('-password -__v');
      
      console.log('🔄 Speakers found from availability userIds:', speakersFromAvailability.length);
      
      // Update availableSpeakerIds with the found speakers
      const foundSpeakerIds = speakersFromAvailability.map(speaker => speaker._id.toString());
      console.log('🔄 Found speaker IDs:', foundSpeakerIds);
      
      // Use these speakers for the rest of the logic
      const availableSpeakers = allSpeakers.filter(speaker => 
        foundSpeakerIds.includes(speaker._id.toString())
      );
      
      console.log('👥 Available speakers after alternative approach:', availableSpeakers.length);
      
      // Apply pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedSpeakers = availableSpeakers.slice(skip, skip + parseInt(limit));
      const totalCount = availableSpeakers.length;

      // Format response data
      const formattedSpeakers = paginatedSpeakers.map(speaker => ({
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt,
        availability: {
          dates: availabilityRecords.flatMap(record => record.dates),
          eventTypes: availabilityRecords.flatMap(record => record.eventTypes),
          modes: [...new Set(availabilityRecords.flatMap(record => record.modes))],
          timeSlots: availabilityRecords.flatMap(record => record.timeSlots)
        }
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return res.status(200).json({
        success: true,
        message: `Found ${totalCount} available speaker(s) matching criteria (alternative approach)`,
        data: {
          speakers: formattedSpeakers,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          },
          filters: {
            availabilityDate,
            eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
            subTypes: Array.isArray(subTypes) ? subTypes : (subTypes ? [subTypes] : []),
            minFee: minFee ? parseInt(minFee) : null,
            maxFee: maxFee ? parseInt(maxFee) : null,
            deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
            location,
            expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
            topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
          }
        }
      });
    }

    // Filter speakers based on availability
    const availableSpeakers = allSpeakers.filter(speaker => 
      availableSpeakerIds.includes(speaker._id.toString())
    );

    console.log('👥 All speakers matching basic criteria:', allSpeakers.length);
    console.log('👥 Available speakers after filtering:', availableSpeakers.length);

    // If no speakers found with availability filters, return empty result
    if (availableSpeakers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No speakers found matching the availability criteria',
        data: {
          speakers: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: parseInt(limit)
          },
          filters: {
            availabilityDate,
            eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
            subTypes: Array.isArray(subTypes) ? subTypes : (subTypes ? [subTypes] : []),
            minFee: minFee ? parseInt(minFee) : null,
            maxFee: maxFee ? parseInt(maxFee) : null,
            deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
            location,
            expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
            topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
          }
        }
      });
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSpeakers = availableSpeakers.slice(skip, skip + parseInt(limit));
    const totalCount = availableSpeakers.length;

    // Format response data with availability information
    const formattedSpeakers = paginatedSpeakers.map(speaker => {
      // Find availability records for this speaker
      const speakerAvailability = validAvailabilityRecords.filter(record => 
        record.userId && record.userId._id && record.userId._id.toString() === speaker._id.toString()
      );

      return {
        _id: speaker._id,
        firstName: speaker.firstName,
        lastName: speaker.lastName,
        fullName: speaker.fullName,
        email: speaker.email,
        mobileNo: speaker.mobileNo,
        profileImageUrl: speaker.profileImageUrl,
        bio: speaker.bio,
        professionalTitle: speaker.professionalTitle,
        location: speaker.location,
        areaOfExpertise: speaker.areaOfExpertise,
        yearsOfExperience: speaker.yearsOfExperience,
        roleSpecificData: {
          industry: speaker.roleSpecificData?.industry,
          activities: speaker.roleSpecificData?.activities,
          socialLinks: speaker.roleSpecificData?.socialLinks
        },
        isProfileComplete: speaker.isProfileComplete,
        createdAt: speaker.createdAt,
        availability: {
          dates: speakerAvailability.flatMap(record => record.dates),
          eventTypes: speakerAvailability.flatMap(record => record.eventTypes),
          modes: [...new Set(speakerAvailability.flatMap(record => record.modes))],
          timeSlots: speakerAvailability.flatMap(record => record.timeSlots)
        }
      };
    });

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: `Found ${totalCount} available speaker(s) matching criteria`,
      data: {
        speakers: formattedSpeakers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        },
        filters: {
          availabilityDate,
          eventTypes: Array.isArray(eventTypes) ? eventTypes : (eventTypes ? [eventTypes] : []),
          subTypes: Array.isArray(subTypes) ? subTypes : (subTypes ? [subTypes] : []),
          minFee: minFee ? parseInt(minFee) : null,
          maxFee: maxFee ? parseInt(maxFee) : null,
          deliveryModes: Array.isArray(deliveryModes) ? deliveryModes : (deliveryModes ? [deliveryModes] : []),
          yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
          location,
          expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
          topics: Array.isArray(topics) ? topics : (topics ? [topics] : [])
        }
      }
    });

  } catch (error) {
    console.error('Error searching speakers with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while searching speakers with filters',
      error: error.message
    });
  }
};

/**
 * Get available event types and sub types for filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAvailableEventTypes = async (req, res) => {
  try {
    // Get all unique event types and sub types from availability records
    const eventTypesData = await Availability.aggregate([
      { $unwind: '$eventTypes' },
      { $unwind: '$eventTypes.subTypes' },
      {
        $group: {
          _id: {
            category: '$eventTypes.category',
            subType: '$eventTypes.subTypes.name'
          },
          minPrice: { $min: '$eventTypes.subTypes.price' },
          maxPrice: { $max: '$eventTypes.subTypes.price' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          subTypes: {
            $push: {
              name: '$_id.subType',
              minPrice: '$minPrice',
              maxPrice: '$maxPrice',
              count: '$count'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Available event types retrieved successfully',
      data: eventTypesData
    });

  } catch (error) {
    console.error('Error getting available event types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while getting event types',
      error: error.message
    });
  }
};
