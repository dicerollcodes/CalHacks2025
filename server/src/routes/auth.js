import express from 'express';
import { nanoid } from 'nanoid';
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import School from '../models/School.js';
import { sendVerificationEmail, generateVerificationCode } from '../services/emailService.js';
import { generateToken } from '../services/jwtService.js';

const router = express.Router();

/**
 * POST /api/auth/check-user
 * Check if a user exists with given email
 */
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists with verified email
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: true
    });

    res.json({
      exists: !!existingUser
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

/**
 * POST /api/auth/send-code
 * Send 6-digit verification code to email
 */
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Extract domain from email
    const emailDomain = email.toLowerCase().split('@')[1];

    // Check if domain is associated with a school
    const school = await School.findOne({ domain: emailDomain });
    if (!school) {
      return res.status(400).json({
        error: "Please use your school email. If you're still receiving this message, Shatter the Ice is not live at your school yet!"
      });
    }

    // Check if user already exists with verified email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }

    // Check if email verification bypass is enabled
    const bypassEmailVerification = process.env.BYPASS_EMAIL_VERIFICATION === 'true';

    // Generate 6-digit code (or use bypass code)
    const code = bypassEmailVerification ? '000000' : generateVerificationCode();

    // Delete ALL existing codes for this email (verified and unverified)
    await VerificationCode.deleteMany({ email: email.toLowerCase() });

    // Create new verification code (expires in 15 minutes)
    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    await verificationCode.save();

    // Send email via Brevo (unless bypassed)
    if (!bypassEmailVerification) {
      await sendVerificationEmail(email, code);
    } else {
      console.log('⚠️  EMAIL BYPASS ENABLED - Use code: 000000');
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 900 // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

/**
 * POST /api/auth/verify-code
 * Verify 6-digit code
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code: code.toString()
    });

    if (!verificationCode) {
      return res.status(400).json({
        error: 'Invalid verification code',
        code: 'INVALID_CODE'
      });
    }

    // Check if code is valid (not expired, not already used, < 5 attempts)
    if (!verificationCode.isValid()) {
      if (verificationCode.verified) {
        return res.status(400).json({
          error: 'Code already used',
          code: 'CODE_USED'
        });
      }
      if (verificationCode.expiresAt < new Date()) {
        return res.status(400).json({
          error: 'Code expired. Please request a new one.',
          code: 'CODE_EXPIRED'
        });
      }
      if (verificationCode.attempts >= 5) {
        return res.status(400).json({
          error: 'Too many attempts. Please request a new code.',
          code: 'TOO_MANY_ATTEMPTS'
        });
      }
    }

    // Increment attempts
    verificationCode.attempts += 1;

    // Wrong code
    if (verificationCode.code !== code.toString()) {
      await verificationCode.save();
      return res.status(400).json({
        error: 'Incorrect code',
        code: 'WRONG_CODE',
        attemptsLeft: Math.max(0, 5 - verificationCode.attempts)
      });
    }

    // Mark as verified
    verificationCode.verified = true;
    await verificationCode.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      email: email.toLowerCase()
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

/**
 * POST /api/auth/complete-signup
 * Complete signup after email verification
 */
router.post('/complete-signup', async (req, res) => {
  try {
    const { email, name, username, privateInterests, socials } = req.body;

    if (!email || !name || !username) {
      return res.status(400).json({
        error: 'Email, name, and username are required'
      });
    }

    // Extract domain from email and find matching school
    const emailDomain = email.toLowerCase().split('@')[1];
    const school = await School.findOne({ domain: emailDomain });

    if (!school) {
      return res.status(400).json({
        error: "Please use your school email. If you're still receiving this message, Shatter the Ice is not live at your school yet!"
      });
    }

    const schoolId = school._id;

    // Validate username format
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username.toLowerCase()) || username.length < 3 || username.length > 20) {
      return res.status(400).json({
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username already taken',
        code: 'USERNAME_TAKEN'
      });
    }

    // Verify that the email was verified
    const verifiedCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      verified: true
    });

    if (!verifiedCode) {
      return res.status(400).json({
        error: 'Email not verified. Please verify your email first.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.emailVerified) {
      return res.status(400).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create or update user
    if (user) {
      // Update existing unverified user
      user.name = name;
      user.username = username.toLowerCase();
      user.schoolId = schoolId;
      user.privateInterests = privateInterests || [];
      user.socials = socials || {};
      user.emailVerified = true;
      await user.save();
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase(),
        name,
        username: username.toLowerCase(),
        schoolId,
        privateInterests: privateInterests || [],
        socials: socials || {},
        emailVerified: true
      });
      await user.save();
    }

    // Populate school info
    await user.populate('schoolId');

    // Generate JWT token (7-day expiration)
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Signup completed successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        school: user.schoolId.name,
        profileUrl: `${req.protocol}://${req.get('host')}/user/${user.username}`
      }
    });

  } catch (error) {
    console.error('Error completing signup:', error);
    res.status(500).json({ error: 'Failed to complete signup' });
  }
});

/**
 * POST /api/auth/login
 * Login with email (send verification code)
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Extract domain from email
    const emailDomain = email.toLowerCase().split('@')[1];

    // Check if domain is associated with a school
    const school = await School.findOne({ domain: emailDomain });
    if (!school) {
      return res.status(400).json({
        error: "Please use your school email. If you're still receiving this message, Shatter the Ice is not live at your school yet!"
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: 'No account found with this email',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check if email verification bypass is enabled
    const bypassEmailVerification = process.env.BYPASS_EMAIL_VERIFICATION === 'true';

    // Generate and send verification code (same as signup)
    const code = bypassEmailVerification ? '000000' : generateVerificationCode();

    // Delete ALL existing codes for this email (verified and unverified)
    await VerificationCode.deleteMany({ email: email.toLowerCase() });

    const verificationCode = new VerificationCode({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await verificationCode.save();

    // Send email via Brevo (unless bypassed)
    if (!bypassEmailVerification) {
      await sendVerificationEmail(email, code);
    } else {
      console.log('⚠️  EMAIL BYPASS ENABLED - Use code: 000000');
    }

    res.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 900
    });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to send login code' });
  }
});

/**
 * POST /api/auth/verify-login
 * Verify login code and return user info
 */
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Verify the code (same logic as verify-code)
    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code: code.toString()
    });

    if (!verificationCode || !verificationCode.isValid() || verificationCode.code !== code.toString()) {
      return res.status(400).json({
        error: 'Invalid or expired code',
        code: 'INVALID_CODE'
      });
    }

    // Mark as verified
    verificationCode.verified = true;
    await verificationCode.save();

    // Get user
    const user = await User.findOne({ email: email.toLowerCase() }).populate('schoolId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token (7-day expiration)
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        school: user.schoolId.name,
        profileUrl: `${req.protocol}://${req.get('host')}/user/${user.username}`
      }
    });

  } catch (error) {
    console.error('Error verifying login:', error);
    res.status(500).json({ error: 'Failed to verify login' });
  }
});

export default router;
