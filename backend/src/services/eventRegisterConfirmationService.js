import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendConfirmationEmail(registration, event) {
  const { registrant } = registration;

  const html = `
    <h2>Registration Confirmed</h2>
    <p>Hello ${registrant.name},</p>
    <p>You are registered for <strong>${event.topic}</strong> happening on ${new Date(event.eventDate).toLocaleDateString()} at ${event.eventStartTime}.</p>
    ${event.eventMode === "online" ? `<p>Join link: ${event.eventLocation}</p>` : ""}
    ${event.eventMode === "offline" ? `<p>Venue: ${event.venueAddress}</p>` : ""}
    <p>Amount Paid: ₹${registration.totalAmount}</p>
  `;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: registrant.email,
    subject: `Registration confirmed for ${event.topic}`,
    html
  });
}
