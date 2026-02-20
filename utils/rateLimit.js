import OTP from "../model/otpModel.js";

export async function isOtpRateLimited(email, purpose) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const recentCount = await OTP.countDocuments({
    email,
    purpose,
    created_at: { $gt: oneMinuteAgo },
  });

  return recentCount >= 3; // Allow max 3 OTPs per minute
}
