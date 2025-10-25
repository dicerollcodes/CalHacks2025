import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API client
let apiInstance = null;

function getBrevoClient() {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
  }
  return apiInstance;
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification code email via Brevo
 */
export async function sendVerificationEmail(email, code) {
  const client = getBrevoClient();

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Your Shatter the Ice Verification Code";
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL || "noreply@shattertheice.com",
    name: "Shatter the Ice"
  };
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background-color: #f5f5f5;
          padding: 40px 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          font-size: 60px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #0ea5e9;
        }
        .code {
          font-size: 48px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #000000;
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          padding: 20px 40px;
          border-radius: 12px;
          margin: 30px 0;
          display: inline-block;
        }
        p {
          color: #374151;
          line-height: 1.6;
          margin: 16px 0;
          font-size: 16px;
        }
        strong {
          color: #000000;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">❄️</div>
        <h1>Verify Your Email</h1>
        <p>Welcome to Shatter the Ice! Enter this code to complete your registration:</p>
        <div class="code">${code}</div>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <div class="footer">
          <p>© 2025 Shatter the Ice • Finding your perfect roommate</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log('Verification email sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email, name) {
  const client = getBrevoClient();

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Welcome to Shatter the Ice! 🧊";
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL || "noreply@shattertheice.com",
    name: "Shatter the Ice"
  };
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #000000;
          color: #ffffff;
          padding: 40px 20px;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
        }
        h1 {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 16px 0;
        }
        .cta {
          display: inline-block;
          background: #ffffff;
          color: #000000;
          padding: 16px 32px;
          border-radius: 24px;
          text-decoration: none;
          font-weight: bold;
          margin: 24px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧊 Welcome, ${name}!</h1>
        <p>Your profile is all set up. You're ready to find your perfect roommate!</p>
        <p>Share your profile link with potential roommates and see your compatibility instantly.</p>
        <p>Remember: Your interests stay private until you find meaningful overlap.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await client.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - welcome email is not critical
  }
}
