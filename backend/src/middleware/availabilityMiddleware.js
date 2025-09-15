import mongoose from "mongoose";
import { parseISO, isValid } from "date-fns";

export const validateGetAvailability = (req, res, next) => {
  const { year, month } = req.params;

  // Check if year & month are integers
  if (!year || isNaN(year) || year < 1970 || year > 2100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid year. Must be between 1970 and 2100.',
    });
  }

  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({
      success: false,
      message: 'Invalid month. Must be between 1 and 12.',
    });
  }

  next();
};


export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate are required" });
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (!isValid(start) || !isValid(end)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  if (start > end) {
    return res.status(400).json({ error: "startDate cannot be after endDate" });
  }

  next();
};


export const validateAvailabilityId = (req, res, next) => {
  const { availabilityId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid availability ID format",
    });
  }

  next();
};


export const validateAvailability = (req, res, next) => {
  const { dates, eventTypes, modes, timeSlots,userId  } = req.body;

  // ✅ For testing: assign dummy userId if not provided
  req.body.userId = userId || "66d4a0c7f7f9a8d29b123456"; // replace with some valid ObjectId string for testing

  // Validate dates
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({
      message: "At least one date must be provided in 'dates' array",
    });
  }

  for (const date of dates) {
    if (isNaN(Date.parse(date))) {
      return res.status(400).json({
        message: `Invalid date format: ${date}`,
      });
    }
  }

  // Validate eventTypes (optional but good for safety)
  if (eventTypes && !Array.isArray(eventTypes)) {
    return res.status(400).json({
      message: "'eventTypes' must be an array",
    });
  }

  // Validate modes
  if (modes && !Array.isArray(modes)) {
    return res.status(400).json({
      message: "'modes' must be an array",
    });
  }

  // Validate timeSlots
  if (timeSlots && !Array.isArray(timeSlots)) {
    return res.status(400).json({
      message: "'timeSlots' must be an array",
    });
  }

  next();
};
