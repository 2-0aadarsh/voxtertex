// // models/availability.js
// import mongoose from "mongoose";

// const availabilitySchema = new mongoose.Schema({
//   expertId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   userName: {
//     type: String,
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true
//   },
//   eventType: {
//     type: String,
//     required: true,
//     // enum: ["Workshop", "Keynote", "Consultation", "Panel", "Other"] // Add your event types
//   },
//   mode: {
//     type: String,
//     required: true,
//     // enum: ["In-Person", "Virtual", "Hybrid"]
//   },
//   timeSlot: {
//     start: { type: String, required: true }, // Format: "HH:MM" (e.g., "09:00")
//     end: { type: String, required: true }   // Format: "HH:MM" (e.g., "17:00")
//   },
//   // duration: {
//   //   value: { type: Number, required: true },
//   //   unit: { 
//   //     type: String, 
//   //     required: true,
//   //   //   enum: ["hours", "days", "weeks"] 
//   //   }
//   // },
//   bookingPrice: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   isBooked: {
//     type: Boolean,
//     default: false
//   },
//   bookedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   }
// }, { timestamps: true });

// // In availabilitySchema
// availabilitySchema.index(
//   { expertId: 1, date: 1, "timeSlot.start": 1, "timeSlot.end": 1 },
//   { unique: true, partialFilterExpression: { isBooked: false } }
// );

// availabilitySchema.pre('save', async function(next) {
//   const existing = await this.constructor.findOne({
//     expertId: this.expertId,
//     date: this.date,
//     isBooked: false,
//     $or: [
//       { 
//         "timeSlot.start": { $lt: this.timeSlot.end },
//         "timeSlot.end": { $gt: this.timeSlot.start }
//       }
//     ]
//   });

//   if (existing) {
//     throw new Error(`Time conflict with existing ${existing.eventType} booking`);
//   }
//   next();
// });

// const Availability = mongoose.model("Availability", availabilitySchema);
// export default Availability;



import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  slot: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
    required: true
  },
  startTime: {
    type: String,
    required: true // format HH:MM
  },
  endTime: {
    type: String,
    required: true // format HH:MM
  }
}, { _id: false });

const eventTypeSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: [
      'Corporate & Professional Events',
      'Educational & Training Formats',
      'Specialized & Niche Events'
    ],
    required: false
  },
  subTypes: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  }]
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // allow multiple dates for same availability
  dates: [{
    type: Date,
    required: true
  }],

  eventTypes: [eventTypeSchema],

  modes: [{
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    required: true
  }],

  timeSlots: [timeSlotSchema],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user doesn't duplicate the same date inside "dates"
availabilitySchema.pre('save', function(next) {
  this.dates = [...new Set(this.dates.map(d => d.toISOString()))].map(d => new Date(d));
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Availability', availabilitySchema);