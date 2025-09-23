import mongoose from "mongoose";

const eventDetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    expectedAttendees: { type: Number, required: true },
    specialRequirement: { type: String },
    personalMessage: {
      type: String,
      default: `Dear [Speaker Name],

I hope this message finds you well. I am reaching out to invite you to speak at our upcoming event based on your exceptional expertise in AI and Healthcare.

SPEAKING OPPORTUNITY DETAILS:

📅 Event: [Event name will be filled from your details]
📍 Location: [Location will be filled from your details]
👥 Audience: [Expected attendees will be filled from your details]
⏱️ Duration: [Session duration will be filled from your details]
💰 Compensation: [Compensation details will be filled from your details]

WHAT WE OFFER:
• Professional speaking fee/honorarium as outlined
• Travel and accommodation arrangements (if applicable)
• Professional event production and support
• Networking opportunities with industry leaders
• Post-event content and marketing materials

We believe your insights would provide tremendous value to our audience, and we would be honored to have you as our speaker.

Please review the detailed proposal below and let me know if you would like to:
✅ ACCEPT - Confirm your participation
❌ DECLINE - Politely decline this opportunity
🤝 NEGOTIATE - Discuss modifications to the proposal

Looking forward to your response!

Best regards,
[Your name will be added automatically]`
    }
  },
  { _id: false }
);


const compensationSchema = new mongoose.Schema(
  {
    primaryCompensation: {
      speakerFeeAmount: Number,
      honorariumFeeAmount: Number
    },
    travel: {
      travelMode: String,
      travelArrangement: String,
      offeredAmount: { type: Number, default: 0, min: 0 },
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
