// import Availability from "../models/availability.js";
// import User from "../models/user.js";
// import Profile from "../models/profile.js";

// // Add new availability slot
// export const addAvailability = async (req, res) => {
//   try {
//     const { date, eventType, timeSlot } = req.body;

//     const validUser = await User.findOne({
//       _id: req.user._id
//     });
//     if(validUser.role !== 'Expert') {
//       return res.status(403).json({
//         success: false,
//         message: "Only experts can create availability slots"
//       });
//     }

//     const currentDate = new Date();
//     const inputDate = new Date(date);

//     if (inputDate < currentDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot create availability for past dates"
//       });
//     }

//     // Get user details
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     const userName = `${user.firstName} ${user.lastName}`;

//     // Check for duplicate
//     const duplicate = await Availability.findOne({
//       expertId: req.user._id,
//       date,
//       "timeSlot.start": timeSlot.start,
//       "timeSlot.end": timeSlot.end,
//       eventType
//     });

//     if (duplicate) {
//       return res.status(400).json({
//         success: false,
//         message: "Identical availability slot already exists"
//       });
//     }

//     // Check for time overlap
//     const overlap = await Availability.findOne({
//       expertId: req.user._id,
//       date,
//       isBooked: false,
//       $or: [
//         {
//           "timeSlot.start": { $lt: timeSlot.end },
//           "timeSlot.end": { $gt: timeSlot.start }
//         }
//       ]
//     });

//     if (overlap) {
//       return res.status(400).json({
//         success: false,
//         message: `Time overlaps with existing ${overlap.eventType} commitment`,
//         conflictingSlot: overlap
//       });
//     }

//     const newAvailability = new Availability({
//       ...req.body,
//       expertId: req.user._id,
//       userName
//     });

//     await newAvailability.save();
//     res.status(201).json({
//       success: true,
//       availability: newAvailability
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Duplicate time slot detected"
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get all availabilities for an expert
// export const getExpertAvailabilities = async (req, res) => {
//   try {
//     const availabilities = await Availability.find({
//       expertId: req.user._id,
//       isBooked: false
//     }).sort({ date: 1 });

//     res.status(200).json({
//       success: true,
//       count: availabilities.length,
//       availabilities
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching availabilities",
//       error: error.message
//     });
//   }
// };

// // Update an availability slot
// export const updateAvailability = async (req, res) => {
//   try {
//     const { availabilityId } = req.params;

//     const { date } = req.body;

//     // Validate date is not in the past if date is being updated
//     if (date) {
//       const currentDate = new Date();
//       const inputDate = new Date(date);
      
//       if (inputDate < currentDate) {
//         return res.status(400).json({
//           success: false,
//           message: "Cannot update availability to past dates"
//         });
//       }
//     }

//     // Prevent userName updates
//     if (req.body.userName) {
//       delete req.body.userName;
//     }

//     const availability = await Availability.findOneAndUpdate(
//       {
//         _id: availabilityId,
//         expertId: req.user._id,
//         isBooked: false
//       },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found or already booked"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Availability updated successfully",
//       availability
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating availability",
//       error: error.message
//     });
//   }
// };

// // Delete an availability slot
// export const deleteAvailability = async (req, res) => {
//   try {
//     const { availabilityId } = req.params;

//     const availability = await Availability.findOneAndDelete({
//       _id: availabilityId,
//       expertId: req.user._id,
//       isBooked: false
//     });

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found or already booked"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Availability deleted successfully"
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting availability",
//       error: error.message
//     });
//   }
// };

// // Get availability by ID (new addition)
// export const getAvailabilityById = async (req, res) => {
//   try {
//     const availability = await Availability.findOne({
//       _id: req.params.availabilityId,
//       expertId: req.user._id
//     }).populate('expertId', 'firstName lastName');

//     if (!availability) {
//       return res.status(404).json({
//         success: false,
//         message: "Availability not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       availability
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching availability",
//       error: error.message
//     });
//   }
// };



import Availability from '../models/availability.js';

// Note: normalizeDate function removed as it's no longer needed with UTC date handling

// Get availability for a specific month
// export const getAvailability = async (req, res) => {
//   try {
//     const { year, month } = req.params;
//     const userId = req.user._id;

//     const startDate = new Date(Number(year), Number(month) - 1, 1);
//     const endDate = new Date(Number(year), Number(month), 0);
//     startDate.setHours(0,0,0,0);
//     endDate.setHours(23,59,59,999);

//     const availability = await Availability.find({
//       userId,
//       date: { $gte: startDate, $lte: endDate }
//     }).sort({ date: 1 });

//     res.status(200).json({ success: true, data: availability });
//   } catch (error) {
//     console.error('Error fetching availability:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch availability' });
//   }
// };

// Get availability for a specific speaker (for organizers to view)
export const getSpeakerAvailability = async (req, res) => {
  try {
    const { speakerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: "Speaker ID is required",
      });
    }

    // Fetch availability document for this speaker
    const availabilityDoc = await Availability.findOne({ userId: speakerId });

    if (!availabilityDoc) {
      return res.status(404).json({
        success: false,
        message: "No availability found for this speaker",
      });
    }

    // Convert dates array to JS Date objects
    let availableDates = availabilityDoc.dates.map(d => new Date(d));

    // Filter dates
    if (startDate && endDate) {
      const startUTC = new Date(startDate + "T00:00:00.000Z");
      const endUTC = new Date(endDate + "T23:59:59.999Z");
      availableDates = availableDates.filter(
        d => d >= startUTC && d <= endUTC
      );
    } else {
      // Default: only return future dates
      const todayUTC = new Date();
      todayUTC.setUTCHours(0, 0, 0, 0);
      availableDates = availableDates.filter(d => d >= todayUTC);
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: availabilityDoc._id,
        speakerId: availabilityDoc.userId,
        dates: availableDates.sort((a, b) => a - b), // sort ascending
        eventTypes: availabilityDoc.eventTypes,
        modes: availabilityDoc.modes,
        timeSlots: availabilityDoc.timeSlots,
      },
    });
  } catch (error) {
    console.error("Error fetching speaker availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speaker availability",
    });
  }
};


// Get availability for authenticated user
export const getAvailability = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const userId = req.user._id; // Get user from JWT authentication
    
    // Create date range in UTC to match stored dates
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const availability = await Availability.find({
      userId: userId, // Filter by authenticated user
      dates: { $gte: start, $lte: end },
    });

    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
};


// Get availability for a date range (query: startDate, endDate)
export const getAvailabilityByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id; // Get user from JWT authentication

    // Query availability where date is within range for authenticated user
    // Convert query dates to UTC to match stored dates
    const startUTC = new Date(startDate + 'T00:00:00.000Z');
    const endUTC = new Date(endDate + 'T23:59:59.999Z');
    
    const availabilities = await Availability.find({
      userId: userId, // Filter by authenticated user
      dates: { $elemMatch: { $gte: startUTC, $lte: endUTC } },
    }).sort({ "dates": 1 });

    return res.status(200).json({ 
      success: true,
      count: availabilities.length,
      data: availabilities 
    });

  } catch (error) {
    console.error("Error fetching availability by range:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get availability for a id
export const getAvailabilityById = async (req, res) => {
  try {
    const { availabilityId } = req.params;

    // Fetch the availability
    const availability = await Availability.findOne({
      _id: availabilityId,
      userId: req.user._id, // ensure user can only access their own data
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability not found",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error fetching availability by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching availability",
    });
  }
};

// Set availability for single or multiple dates

export const setAvailability = async (req, res, next) => {
  try {
    // ✅ Only speakers can set availability
    if (req.user.role !== "speaker") {
      return res.status(403).json({ message: "Only speakers can set availability" });
    }

    const { dates, eventTypes, modes, timeSlots } = req.body;
    const userId = req.user._id; // ✅ Always use logged-in speaker

    console.log("Setting availability for SPEAKER:", userId, { dates, eventTypes, modes, timeSlots });

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: "At least one date is required" });
    }

    // Upsert (create/update) a single Availability entry for this speaker
    const availability = await Availability.findOneAndUpdate(
      { userId }, // ✅ ensures only this speaker's record is modified
      {
        $addToSet: {
          dates: {
            $each: dates.map(d => {
              if (typeof d === "string" && d.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = d.split("-").map(Number);
                return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // store as UTC
              }
              return new Date(d);
            }),
          },
        },
        $set: {
          eventTypes,
          modes,
          timeSlots,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          userId,
        },
      },
      { new: true, upsert: true }
    );

    console.log("✅ Availability saved successfully:", availability);

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: availability,
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    next(error);
  }
};




// Delete availability for specific dates
export const deleteAvailability = async (req, res) => {
  try {
    const { dates } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ success: false, message: 'Dates array is required' });
    }

    const normalizedDates = dates.map(d => {
      const nd = new Date(d);
      nd.setHours(0,0,0,0);
      return nd;
    });

    const result = await Availability.deleteMany({
      userId,
      date: { $in: normalizedDates }
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} availability entries`
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ success: false, message: 'Failed to delete availability' });
  }
};
