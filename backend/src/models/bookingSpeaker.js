import mongoose from "mongoose";

const eventDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    expectedAttendees: { type: Number, required: true }
  },
  { _id: false } // prevent creating a separate _id for this subdocument
);

const compensationSchema = new mongoose.Schema(
  {
    primaryCompensation: {
      speakerFeeAmount: Number,
      honorariumFeeAmount: Number
    },
    travel: {
      travelMode: String,
      travelArrangement: String
    },
    lodging: {
      accommodationType: String,
      lodgingArrangement: String,
      checkInDate: Date,
      checkOutDate: Date
    },
    additionalArrangements: {
      localTransportation: String,
      meals: String,
      additionalExpenses: String
    }
  },
  { _id: false }
);

const bookingSpeakerSchema = new mongoose.Schema(
  {
    bookingId: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "EnhancedUser" },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: "EnhancedUser" },
    date: Date,
    timeSlot: String,
    eventDetails: eventDetailsSchema, // ✅ Properly defined subdocument
    compensationAndArrangements: compensationSchema
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSpeakerSchema);
