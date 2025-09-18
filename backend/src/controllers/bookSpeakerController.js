import Booking from "../models/bookingSpeaker.js";
import EnhancedProfile from "../models/enhancedProfile.js";
import Availability from "../models/availability.js";
import mongoose from "mongoose";

import User from "../models/user.js";

// GET /api/speaker-profile

export const getAllSpeakerProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
      if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: "No speaker profiles found" });
    }

    const formattedProfiles = profiles.map(profile => ({
      username: profile.userName || "Unknown", // ✅ directly use userName field
      bio: profile.bio,
      about: profile.about,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      awards: profile.awards,
      videos: profile.videos
    }));
    
    return res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error("Error fetching speaker profiles:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speaker profiles"
    });
  }
};

export const createSpeakerBooking = async (req, res) => {
  try {
    const organizerId = req.user._id; // ✅ from authenticateJWT
    const {
      speakerId,
      date,
      timeSlot,
      eventName,
      eventType,
      location,
      expectedAttendees,
      amount,
      specialRequirement,
      personalMessage
    } = req.body;
    console.log("🔎 Received speakerId (should be user._id):", speakerId);
      // ✅ Parse timeSlot into start & end
    // let startTime, endTime;
    // if (typeof timeSlot === "string" && timeSlot.includes("-")) {
    //   [startTime, endTime] = timeSlot.split("-");
    // } else if (timeSlot?.start && timeSlot?.end) {
    //   startTime = timeSlot.start;
    //   endTime = timeSlot.end;
    // } else {
    //   return res.status(400).json({ success: false, message: "Invalid timeSlot format" });
    // }
     const [startTime, endTime] = (timeSlot || "").split("-").map(s => s.trim());

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeSlot. Please send in format 'HH:MM-HH:MM'"
      });
    }
    console.log("Parsed slot:", { startTime, endTime });

    // 1 Validate speaker exists
    const speakerProfile = await EnhancedProfile.findOne({ user: speakerId });
    console.log("🔎 Found speaker profile:", speakerProfile);

    if (!speakerProfile) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }

    // 2 Check if speaker has availability for that date and time
   

const selectedDate = new Date(date); // date from req.body
const startOfDay = new Date(selectedDate);
startOfDay.setUTCHours(0, 0, 0, 0);

const endOfDay = new Date(selectedDate);
endOfDay.setUTCHours(23, 59, 59, 999);

console.log("Querying Availability for:", {
  userId: speakerId,
  startOfDay: new Date(date).setUTCHours(0,0,0,0),
  endOfDay: new Date(date).setUTCHours(23,59,59,999)
});

const availability = await Availability.findOne({
  userId: mongoose.Types.ObjectId.isValid(speakerId)
    ? new mongoose.Types.ObjectId(speakerId)
    : speakerId, // ✅ Handles both ObjectId and string
  dates: {
    $elemMatch: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }
});

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Speaker not available on selected date"
      });
    }
    console.log("DEBUG: Stored slots =>", availability.timeSlots);
console.log("DEBUG: Requested slot =>", startTime, endTime);
console.log("Querying Availability for:", {
  userId: speakerId,
  date: startOfDay.toISOString(),
  endDate: endOfDay.toISOString()
});


    // Check if the requested slot matches any stored slot
    const slotMatch = availability.timeSlots.find(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!slotMatch) {
      return res.status(400).json({
        success: false,
        message: "Selected date/time is not available for this speaker"
      });
    }
    const count = await Booking.countDocuments(); 
    const bookingId = `BK-${String(count + 1).padStart(5, "0")}`;

    // let formattedTimeSlot;
    // if (typeof timeSlot === "string") {
    // formattedTimeSlot = timeSlot; // already a string like "10:00-12:00"
    // } else if (timeSlot?.start && timeSlot?.end) {
    //     formattedTimeSlot = `${timeSlot.start}-${timeSlot.end}`;
    // } else {
    //     formattedTimeSlot = "Not Provided";
    // }

    // 3️⃣ Create booking
    const booking = new Booking({
    bookingId,
    organizer: organizerId,
    speaker: speakerId,
    date: new Date(date),
    timeSlot: `${startTime}-${endTime}`,
    eventDetails: {
        name: eventName,
        type: eventType,
        location,
        expectedAttendees
      },
    preferences: {
        amount,
        specialRequirement,
        personalMessage
      }
    });

    await booking.save();
       // 4️⃣ Remove booked timeSlot from availability
    availability.timeSlots = availability.timeSlots.filter(
      slot => !(slot.start === timeSlot.start && slot.end === timeSlot.end)
    );

    // If there are no more time slots, remove that date as well
    if (availability.timeSlots.length === 0) {
      availability.dates = availability.dates.filter(d => d !== date);
    }

    await availability.save();

    console.log("Updated availability after booking:", availability);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while booking speaker",
      error: error.message
    });
  }
};



