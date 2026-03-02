import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp_code: { type: String, required: true }, // SHA-256 hashed
  purpose: { type: String, enum: ["email_confirmation", "password_reset"] }, // 'email_confirmation' or 'password_reset'
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

export default mongoose.model("OTP", otpSchema);
