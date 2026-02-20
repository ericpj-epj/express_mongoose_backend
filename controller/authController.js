import bcrypt from "bcrypt";
import { generateJwt } from "../utils/jwtUtils.js";
import { adminRequired } from "../utils/authUtils.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOtpCode, hashOtp, validateOtp } from "../utils/otps.js";
import { isOtpRateLimited } from "../utils/rateLimit.js";
import Member from "../model/membersModel.js";
import OTP from "../model/otpModel.js";
import { findOrgByEmailDomain, isValidEmail } from "../utils/domainUtils.js";

//request otp function
export const RequestOTp = async (req, res) => {
  const { email, purpose } = req.body;

  // Validate inputs
  if (!email || !purpose) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: email, purpose",
      },
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
    });
  }

  if (!["email_confirmation", "password_reset"].includes(purpose)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid purpose" },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limit
  if (await isOtpRateLimited(normalizedEmail, purpose)) {
    return res.status(429).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "OTP request rate limit exceeded. Try again later.",
      },
    });
  }

  // Validate based on purpose
  if (purpose === "email_confirmation") {
    const org = await findOrgByEmailDomain(normalizedEmail);
    if (!org) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_EMAIL_DOMAIN",
          message: "Email domain not in organization's allowed list",
        },
      });
    }
  } else if (purpose === "password_reset") {
    const member = await Member.findOne({ email: normalizedEmail });
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: "MEMBER_NOT_FOUND", message: "Member does not exist" },
      });
    }
  }
  // Generate and store OTP
  // bring back to 15 mins the expiresAt after testing
  const otpCode = generateOtpCode(6);
  const otpHash = hashOtp(otpCode);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 15 minutes
  const otp = new OTP({
    email: normalizedEmail,
    otp_code: otpHash,
    purpose,
    expires_at: expiresAt,
    used: false,
  });

  try {
    const savedOTP = await otp.save();

    // Send email (implement your email service)
    await sendEmail(normalizedEmail, otpCode, purpose);

    res.json({
      success: true,
      message: "OTP sent to email",
      expires_in_minutes: 15,
    });
  } catch (err) {
    console.error("OTP Save Error:", err);
  }
};

export const signUp = async (req, res) => {
  // Implement sign-up logic here
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: email, password, otp",
      },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
    });
  }

  // Verify OTP
  const otpDoc = await validateOtp(
    normalizedEmail,
    otp.trim(),
    "email_confirmation",
  );
  if (!otpDoc) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_OTP", message: "OTP is incorrect or expired" },
    });
  }

  // Find organization by email domain
  const org = await findOrgByEmailDomain(normalizedEmail);
  if (!org) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_EMAIL_DOMAIN",
        message: "Email domain not in organization's allowed list",
      },
    });
  }

  // Hash password and create member
  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();

  const newMember = {
    organization_id: org._id,
    email: normalizedEmail,
    password: passwordHash,
    email_confirmed: true,
    status: "active",
    last_login: null,
    updated_at: now,
    role: "member",
  };

  try {
    const result = await Member.insertOne(newMember);

    // Mark OTP as used
    await OTP.updateOne({ _id: otpDoc._id }, { $set: { used: true } });

    // Generate JWT
    const token = generateJwt({
      ...newMember,
      _id: result._id,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      member_id: result.insertedId,
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email already registered",
        },
      });
    }
    throw err;
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: email, password",
      },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
    });
  }

  const member = await Member.findOne({ email: normalizedEmail });

  if (!member) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password incorrect",
      },
    });
  }

  const passwordValid = await bcrypt.compare(password, member.password || "");
  if (!passwordValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password incorrect",
      },
    });
  }

  if (member.status !== "active") {
    return res.status(403).json({
      success: false,
      error: { code: "MEMBER_INACTIVE", message: "Member account is inactive" },
    });
  }

  if (!member.email_confirmed) {
    return res.status(403).json({
      success: false,
      error: {
        code: "EMAIL_NOT_CONFIRMED",
        message: "Member's email address has not been confirmed",
      },
    });
  }

  // Update last login
  const now = new Date();
  await Member.updateOne(
    { _id: member._id },
    { $set: { last_login: now, updated_at: now } },
  );

  const token = generateJwt(member);

  res.json({
    success: true,
    message: "Signed in successfully",
    token,
    member: {
      id: member._id.toString(),
      email: member.email,
      organization_id: member.organization_id?.toString() || null,
      status: member.status || "active",
      email_confirmed: Boolean(member.email_confirmed),
      role: member.role || "member",
    },
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing required fields: email, otp, new_password",
      },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
    });
  }

  const otpDoc = await validateOtp(
    normalizedEmail,
    otp.trim(),
    "password_reset",
  );
  if (!otpDoc) {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_OTP", message: "OTP is incorrect or expired" },
    });
  }

  const member = await Member.findOne({ email: normalizedEmail });
  if (!member) {
    return res.status(404).json({
      success: false,
      error: { code: "MEMBER_NOT_FOUND", message: "Member does not exist" },
    });
  }

  const passwordHash = await bcrypt.hash(new_password, 10);

  await Member.updateOne(
    { _id: member._id },
    { $set: { password: passwordHash, updated_at: new Date() } },
  );

  await OTP.updateOne({ _id: otpDoc._id }, { $set: { used: true } });

  res.json({
    success: true,
    message: "Password reset successfully",
  });
};
