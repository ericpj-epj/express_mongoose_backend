import { randomInt } from "crypto";
import crypto from "crypto";
import OTP from "../model/otpModel.js";

export function generateOtpCode(length) {
  return randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0");
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function validateOtp(email, otp, purpose) {
  const otpHash = hashOtp(otp);
  const now = new Date();
  const otpDoc = await OTP.findOne({
    email,
    otp_code: otpHash,
    purpose,
    used: false,
    expires_at: { $gt: new Date() },
  });

  return otpDoc;
}
