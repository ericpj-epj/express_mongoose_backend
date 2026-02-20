import Member from "../models/Member.js";
import OTP from "../models/OTP.js";
import { isValidEmail, findOrgByEmailDomain } from "../utils/authUtils.js";
import { isOtpRateLimited } from "../utils/rateLimit";

export const RequestOTpService = async (req, res) => {
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
