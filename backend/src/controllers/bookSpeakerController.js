import Booking from "../models/bookingSpeaker.js";
import EnhancedProfile from "../models/enhancedProfile.js";
import Availability from "../models/availability.js";
import mongoose from "mongoose";

import User from "../models/user.js";

// GET /api/speaker-profile

export const getAllSpeakerProfiles = async (req, res) => {
  try {
    const profiles = await EnhancedProfile.find()
      .populate({
        path: "user",
        match: { role: "speaker" }, // ✅ Only users with speaker role
        select: "firstName lastName email role"
      });

    // Remove profiles with no matching user (null after match)
    const filteredProfiles = profiles.filter(profile => profile.user !== null);

    if (!filteredProfiles.length) {
      return res.status(404).json({ message: "No speaker profiles found" });
    }

    const formattedProfiles = filteredProfiles.map(profile => ({
      username: profile.user?.firstName
        ? `${profile.user.firstName} ${profile.user.lastName}`.trim()
        : "Unknown",
      email: profile.user?.email || null,
      role: profile.user?.role || "N/A",
      bio: profile.bio || null,
      about: profile.about || null,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      awards: profile.awards,
      videos: profile.featuredVideos || []
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
    const organizerId = req.user._id;

    // Destructure request body
    const {
      speakerId,
      date,
      timeSlot,
      eventDetails,
      compensationAndArrangements
    } = req.body;

    // Validate event details
    if (
      !eventDetails ||
      !eventDetails.name ||
      !eventDetails.type ||
      !eventDetails.location ||
      !eventDetails.expectedAttendees
    ) {
      return res.status(400).json({
        success: false,
        message: "Event name, type, location, and expected attendees are required"
      });
    }

    // Parse timeSlot
    const [startTime, endTime] = (timeSlot || "").split("-").map(s => s.trim());
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeSlot. Please send in format 'HH:MM-HH:MM'"
      });
    }

    // Validate Speaker
    const speakerProfile = await EnhancedProfile.findOne({ user: speakerId });
    if (!speakerProfile) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }

    // Check availability for selected date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const availability = await Availability.findOne({
      userId: new mongoose.Types.ObjectId(speakerId),
      dates: { $elemMatch: { $gte: startOfDay, $lte: endOfDay } }
    });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Speaker not available on selected date"
      });
    }

    // Find the slot being booked
    const slotMatch = availability.timeSlots.find(
      slot => startTime >= slot.startTime && endTime <= slot.endTime
    );

    if (!slotMatch) {
      return res.status(400).json({
        success: false,
        message: "Selected date/time is not available for this speaker"
      });
    }

    // Validate compensation
    if (!compensationAndArrangements || !compensationAndArrangements.primaryCompensation) {
      return res.status(400).json({
        success: false,
        message: "Primary compensation is required"
      });
    }

    const { primaryCompensation, travel, lodging, additionalArrangements } = compensationAndArrangements;

    const parsedSpeakerFee = primaryCompensation.speakerFeeAmount
      ? Number(primaryCompensation.speakerFeeAmount)
      : 0;
    const parsedHonorariumFee = primaryCompensation.honorariumFeeAmount
      ? Number(primaryCompensation.honorariumFeeAmount)
      : 0;

    if (parsedSpeakerFee <= 0 && parsedHonorariumFee <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one primary compensation (Speaker Fee or Honorarium Fee) is required"
      });
    }

    // Create bookingId
    const count = await Booking.countDocuments();
    const bookingId = `BK-${String(count + 1).padStart(5, "0")}`;

    // Create Booking
    const booking = new Booking({
      bookingId,
      organizer: organizerId,
      speaker: speakerId,
      date: new Date(date),
      timeSlot: `${startTime}-${endTime}`,
      eventDetails: {
        name: eventDetails.name,
        type: eventDetails.type,
        location: eventDetails.location,
        expectedAttendees: eventDetails.expectedAttendees,
        specialRequirement: eventDetails.specialRequirement || "",
        personalMessage
      },
      compensationAndArrangements: {
        primaryCompensation: {
          speakerFeeAmount: parsedSpeakerFee,
          honorariumFeeAmount: parsedHonorariumFee
        },
        travel: {
          travelMode: travel?.travelMode || "",
          arrangements: travel?.arrangements || "",
          offeredAmount: travel?.offeredAmount || 0
        },
        lodging: {
          ...lodging,
          checkInDate: lodging?.checkInDate ? new Date(lodging.checkInDate) : null,
          checkOutDate: lodging?.checkOutDate ? new Date(lodging.checkOutDate) : null
        },
        additionalArrangements: additionalArrangements || {}
      }
    });

    await booking.save();

    // --- Hybrid availability update logic (date + partial time split) ---
    const bookedDateISO = startOfDay.toISOString();
    const newTimeSlots = [];

    for (let slot of availability.timeSlots) {
      if (slot.startTime === slotMatch.startTime && slot.endTime === slotMatch.endTime) {
        // Partial slot before booking
        if (startTime > slot.startTime) {
          newTimeSlots.push({ ...slot, endTime: startTime });
        }
        // Partial slot after booking
        if (endTime < slot.endTime) {
          newTimeSlots.push({ ...slot, startTime: endTime });
        }
      } else {
        newTimeSlots.push(slot); // unaffected slots
      }
    }

    availability.timeSlots = newTimeSlots;

    // Remove booked date if no slots left
    if (availability.timeSlots.length === 0) {
      availability.dates = availability.dates.filter(d => d.toISOString() !== bookedDateISO);
    }

    // Save updated availability
    await availability.save();

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









