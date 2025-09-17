const emailTemplate = (otp) => `
        <!DOCTYPE html>
        <html>

        <head>
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }

                .email-container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .header {
                    background-color: #4caf50;
                    color: #ffffff;
                    text-align: center;
                    padding: 20px;
                    font-size: 24px;
                }

                .content {
                    padding: 20px;
                    color: #333333;
                    line-height: 1.6;
                }

                .content p {
                    margin: 0 0 20px;
                }

                .otp-box {
                    display: block; /*Makes the box take up the full width*/
                    width: 85%; /* Full width */
                    text-align: center; /* Centers the text */
                    background-color: #4caf50;
                    color: #ffffff;
                    padding: 12px 25px;
                    border-radius: 4px; 
                    font-size: 25px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }

                .footer {
                    background-color: #f4f4f4;
                    color: #888888;
                    text-align: center;
                    padding: 10px 20px;
                    font-size: 12px;
                }
            </style>
        </head>

        <body>
            <div class="email-container">
                <div class="header">
                    Verify Your Email
                </div>
                <div class="content">
                    <p>Hi [User],</p>
                    <p>Thank you for signing up! Use the OTP below to verify your email address:</p>
                    <div class="otp-box">
                        ${otp} <!-- Insert dynamic OTP here -->
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br>The [Your App Name] Team</p>
                </div>
                <div class="footer">
                    © 2024 pingpong. All rights reserved.
                </div>
            </div>
        </body>

        </html>`;

const passwordResetEmailTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 10px 0;
    }
    .header h1 {
      color: #333333;
      font-size: 24px;
    }
    .content {
      margin: 20px 0;
      line-height: 1.6;
      color: #555555;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello [User],</p>
      <p>We received a request to reset your password for your [Your App Name] account. Click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>If you didn’t request this, you can safely ignore this email. Your password will not be changed.</p>
      <p>For your security, this link will expire in 1 hour from now.</p>
    </div>
    <div class="footer">
      <p>&copy; [Your App Name] | All rights reserved</p>
    </div>
  </div>
</body>
</html>
`;

const contactUsEmailTemplate = (userName, userEmail, message) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Us Message</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 650px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0px 4px 12px rgba(0,0,0,0.1);
      }
      .header {
        background: #2563eb;
        color: #ffffff;
        text-align: center;
        padding: 20px 15px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 25px;
        color: #333333;
        line-height: 1.6;
      }
      .content p {
        margin: 8px 0;
      }
      .highlight {
        font-weight: bold;
        color: #111827;
      }
      .message-box {
        margin-top: 15px;
        padding: 15px;
        background: #f9fafb;
        border-left: 4px solid #2563eb;
        border-radius: 6px;
        font-style: italic;
        color: #444;
      }
      .footer {
        background: #f1f5f9;
        padding: 15px;
        text-align: center;
        font-size: 13px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Contact Request</h1>
      </div>
      <div class="content">
        <p>Hello <span class="highlight">Admin</span>,</p>
        <p>You’ve received a new message from the Contact Us form.</p>
        
        <p><span class="highlight">Name:</span> ${userName}</p>
        <p><span class="highlight">Email:</span> ${userEmail}</p>
        
        <div class="message-box">
          ${message}
        </div>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Chittchat — Contact Us Notification
      </div>
    </div>
  </body>
  </html>
  `;
};

const passwordResetLinkTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset Link</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 20px;
    }
    .reset-button {
      display: inline-block;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .reset-button:hover {
      background-color: #e55a2b;
    }
    .security-tip {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      VoxVertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hello [User],</p>
      <p>You requested to reset your password. Click the button below to reset your password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="reset-button">Reset Password</a>
      </div>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <div class="security-tip">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this link with anyone. VoxVertex will never ask for your password reset link.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 VoxVertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const passwordResetOTPTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Reset OTP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content p {
      margin: 0 0 20px;
    }
    .otp-box {
      display: block;
      width: 85%;
      text-align: center;
      background-color: #ff6b35;
      color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      margin: 20px auto;
      letter-spacing: 5px;
    }
    .security-tip {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      VoxVertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p>Hello [User],</p>
      <p>You requested to reset your password. Use the following OTP to verify your identity:</p>
      <div class="otp-box">
        ${otp}
      </div>
      <p>This OTP will expire in 15 minutes.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <div class="security-tip">
        <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Security Tip:</strong> Never share this OTP with anyone. VoxVertex will never ask for your OTP.</p>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 VoxVertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const passwordChangedTemplate = () => `
<!DOCTYPE html>
<html>
<head>
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      color: #333333;
      line-height: 1.6;
    }
    .security-notice {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      background: #333;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      VoxVertex
    </div>
    <div class="content">
      <h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully</h2>
      <p>Hello [User],</p>
      <p>Your password has been successfully changed on [Date].</p>
      <div class="security-notice">
        <p style="color: #155724; margin: 0; font-size: 14px;"><strong>Security Notice:</strong> If you didn't make this change, please contact our support team immediately.</p>
      </div>
      <p>You can now log in with your new password.</p>
    </div>
    <div class="footer">
      <p style="margin: 0;">© 2024 VoxVertex. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

export { emailTemplate, passwordResetEmailTemplate, contactUsEmailTemplate, passwordResetLinkTemplate, passwordResetOTPTemplate, passwordChangedTemplate };
