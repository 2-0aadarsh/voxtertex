import express from "express";
import {
  registerEvent,
  createPaymentForEventRegistration,
  verifyPayment,
  getRegistrationSummary,
  getEventParticipants
} from "../controllers/eventRegisterController.js";

const router = express.Router();

// STEP 1: Create registration (user details + ticket selection)
router.post("/register-event", registerEvent);

// STEP 2: Create Razorpay order for payment
router.post("/:id/create-payment-order", createPaymentForEventRegistration);

// STEP 3: Verify payment after Razorpay returns success
router.post("/:id/verify-payment", verifyPayment);

// STEP 4: Get registration summary
router.get("/:id/summary", getRegistrationSummary);

router.get('/event/:eventId/participants', getEventParticipants);


export default router;
