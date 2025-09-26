import mongoose from "mongoose";

const ExtraMemberSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: String,
  phone: String
}, { _id: false });

const EventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registrant: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String }
  },
  extras: [ExtraMemberSchema],
  totalAmount: Number,
  currency: { type: String, default: 'INR' },
  paymentStatus: { type: String, enum: ['pending','paid','failed', 'initiated'], default: 'initiated' },
  paymentProvider: String,
  paymentProviderData: Object,
  confirmationSent: { type: Boolean, default: false },
  reminders: {
    reminder24Sent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false }
  }
}, { timestamps: true });

const EventRegistration = mongoose.model('Registration', EventRegistrationSchema);
export default EventRegistration;
