import "dotenv/config"

import transporter from '../configs/nodemailer.config.js';
import { contactUsEmailTemplate, emailTemplate, passwordResetEmailTemplate } from '../utils/emails/emailTemplate.js';

const sendEmailVerification = async (to, subject, htmlContent) => {
  try {
    // Generate the email body with dynamic values (OTP, User, App Name)
    const emailHtml = emailTemplate(htmlContent.otp) // Insert OTP
      .replace('[User]', htmlContent.username) // Insert User Name
      .replace('[Your App Name]', htmlContent.appName); // Insert App Name

    // Mail options
    const mailOptions = {
      from: 'Chittchat <no-reply@chittchat.com>', // Valid sender address
      to: to, // Recipient
      subject: subject, // Subject line
      html: emailHtml, // Email body (HTML format)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendForgetPassword = async(to, subject, emailContent) => {
  try {
    // Reset URL: frontend + token
    // const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${emailContent.token}`;
    const resetUrl = `${emailContent.url}`;
    // Generate HTML using template
    const emailHtml = passwordResetEmailTemplate(resetUrl)
      .replaceAll('[User]', emailContent.username)
      .replaceAll('[Your App Name]', emailContent.appName);

    const mailOptions = {
      from: 'Chittchat <no-reply@chittchat.com>',
      to,
      subject,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};


const sendContactUsMail = async (userData) => {
  try {
    const { name, email, subject, message } = userData;

    // Generate HTML template
    const emailHtml = contactUsEmailTemplate(name, email, message);

    // Mail options
    const mailOptions = {
      from: `"Makeover Contact" <no-reply@chittchat.com>`,
      to: "aadarsh0811@gmail.com", // 🔥 Admin email (replace with real admin email)
      subject: `New Contact Us Message `,
      replyTo: email, // allows admin to reply directly to user
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending Contact Us email:", error);
    throw error;
  }
};

export { sendEmailVerification,sendForgetPassword, sendContactUsMail };