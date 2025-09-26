import express from "express";
import Registration from "../models/eventRegister.js";
import Event from "../models/event.js";
import { createPaymentOrder } from "../services/eventRegisterPaymentService.js";
import { sendConfirmationEmail } from "../services/eventRegisterConfirmationService.js";
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid'

const router = express.Router();

/**
 * STEP 1: Create Registration (ticket selection + user details)
 * No payment created here, just store registrant info in DB
 */
export const registerEvent = async (req, res) => {
  try {
    const { eventId, ticketId, registrant, extras = [] } = req.body;

    if (!eventId || !ticketId) {
      return res.status(400).json({ error: "Missing eventId or ticketId" });
    }

    if (!registrant?.email || !registrant?.name || !registrant?.phone) {
      return res.status(400).json({ error: "Missing registrant details" });
    }

    // Generate userId for registrant
    registrant.userId = uuidv4();

    // Generate userId for each extra
    extras.forEach(extra => {
      extra.userId = uuidv4();
    });

    // 1. Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    
// ✅ Guard here
if (!Array.isArray(event.tickets) || event.tickets.length === 0) {
  return res.status(400).json({ error: "No tickets available for this event" });
}

     // 2. Find selected ticket inside event.tickets
    const selectedTicket = event.tickets.find(
      (ticket) => ticket._id.toString() === ticketId
    );
    if (!selectedTicket) {
      return res.status(404).json({ error: "Selected ticket not found" });
    }

   // 3. Calculate total participants
    const participantCount = 1 + (extras?.length || 0);

    // 4. Calculate total amount based on ticket type
   if (selectedTicket.quantity < participantCount) {
  return res.status(400).json({ error: "Not enough tickets available" });
}

// calculate total amount (even if price = 0)
const totalAmount = (selectedTicket.price || 0) * participantCount;

// Decrease quantity in DB to reserve tickets
selectedTicket.quantity -= participantCount;
await event.save();

    // 5. Create a registration in DB with status 'initiated'
    const registration = await Registration.create({
      event: event._id,
      ticket: {
        ticketId: selectedTicket._id,
        ticketName: selectedTicket.ticketName,
        price: selectedTicket.price,
      },
      registrant,
      participantCount,
      extras,
      totalAmount,
      currency: "INR",
      paymentStatus: totalAmount > 0 ? "initiated" : "paid",
    });

    if (totalAmount === 0) {
      await sendConfirmationEmail(registration, event);
      registration.confirmationSent = true;
      await registration.save();
      return res.json({
        message: "Free registration successful",
        registrationId: registration._id,
        totalAmount,
        currency: "INR"
      });
    }

    res.json({
      message: "Registration created successfully. Proceed to payment.",
      registrationId: registration._id,
      totalAmount,
      currency: "INR"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 2: Create Razorpay Order for Payment
 * This endpoint is called after user confirms details and clicks "Pay"
 */
export const createPaymentForEventRegistration= async (req, res) => {
  try {
     console.log("📌 createPaymentForEventRegistration called with ID:", req.params.id);
    const registration = await Registration.findById(req.params.id).populate("event");

      if (!registration) {
      console.error("❌ Registration not found for ID:", req.params.id);
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.paymentStatus === "paid") {
      console.warn("⚠️ Payment already completed for this registration.");
      return res.status(400).json({ error: "Payment already completed" });
    }
    console.log("✅ Registration found:", registration._id, "Total Amount:", registration.totalAmount);
    
    // Create Razorpay order for this registration
    const order = await createPaymentOrder(
      registration.totalAmount * 100, // convert to paise
      "INR",
     `registration_${registration._id}`
    );
    console.log("📦 Order created:", order);

    if (!order || !order.orderId) {
      console.error("❌ Failed to create payment order");
      return res.status(500).json({ error: "Failed to create payment order" });
    }

    registration.paymentProvider = order.provider;
    registration.paymentProviderData = { orderId: order.orderId };
    registration.paymentStatus = "pending"; // mark as pending until verified
    await registration.save();

    console.log("✅ Registration updated with payment order:", registration.paymentProviderData);

    res.json({
      message: "Payment order created successfully",
      registrationId: registration._id,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "mock_key" // fallback for local testing
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 3: Verify Payment after Razorpay success
 */
export const verifyPayment =  async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        if (registration.ticket && registration.ticket.ticketId) {
        await Event.findOneAndUpdate(
          { _id: registration.event._id, "tickets._id": registration.ticket.ticketId },
          { $inc: { "tickets.$.quantity": registration.participantCount } }
        );
      }
      registration.paymentStatus = "failed";
      await registration.save();
      return res.status(400).json({ error: "Invalid signature, tickets restored" });
    }

    // Mark as paid
    registration.paymentStatus = "paid";
    registration.paymentProviderData = {
      ...(registration.paymentProviderData || {}),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    await registration.save();

    // Send confirmation email
    await sendConfirmationEmail(registration, registration.event);
    registration.confirmationSent = true;
    await registration.save();

    res.json({ ok: true, registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 4: Registration Summary
 */
export const getRegistrationSummary = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate("event");
    if (!reg) return res.status(404).json({ error: "Registration not found" });

    const event = reg.event;
    const summary = {
      topic: event.topic,
      description: event.description,
      date: event.eventDate,
      startTime: event.eventStartTime,
      endTime: event.eventEndTime,
      eventMode: event.eventMode,
      location: event.eventLocation,
      venueAddress: event.venueAddress,
      totalAmount: reg.totalAmount,
      paymentStatus: reg.paymentStatus,
      registrant: reg.registrant,
      extras: reg.extras,
      meetLink: event.eventMode === "online" ? event.eventLocation : null,
      passDownloadUrl: event.eventMode === "offline" ? `${process.env.DOMAIN}/passes/${reg._id}` : null
    };

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/eventRegisterController.js
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId })
      .select('registrant extras')
      .lean();

    // Flatten extras as individual participants if you want them listed separately
  const participants = registrations.flatMap(reg => [
      {
        name: reg.registrant.name,
        email: reg.registrant.email,
        phone: reg.registrant.phone,
        userId: reg.registrant.userId,
      },
      ...(reg.extras?.map(ex => ({
        name: ex.name,
        email: ex.email,
        phone: ex.phone,
        userId: ex.userId,
      })) || [])
    ]);

    res.json({ participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export default router;
