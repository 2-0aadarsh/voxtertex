// models/booking.js
import mongoose from "mongoose";
import { nanoid } from "nanoid"; // ✅ install with npm i nanoid

const bookingSpeakerSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `BK-${nanoid(10)}` // ✅ always unique, like BK-abc123xyz
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedUser",
    required: true
  },
  speaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedProfile",
    required: true
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  eventDetails: {
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    expectedAttendees: { type: Number, required: true }
  },
  preferences: {
    amount: { type: Number, required: true },
    specialRequirement: String,
    personalMessage: String
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSpeakerSchema);
