import Member from "../model/membersModel.js";
// import { sendOtpEmail } from "../controller/authController.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import { hashOtp, generateOtpCode } from "../utils/otps.js";
import { isOtpRateLimited } from "../middleware/rateLimit.js";
import { isValidEmail } from "../utils/domainUtils.js";
// import { generateOtpCode, hashOtp } from "../middleware/authUtils.js";
import OTP from "../model/otpModel.js";
import Organizations from "../model/organizationsModel.js";
import AppError from "../utils/AppError.js";

export const updateMemberStatus = async (req, res) => {
  try {
    const member_id = req.params.id;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }

    // Validate status input
    if (!status) {
      throw new AppError("Status is required", 400, "STATUS_REQUIRED");
    }

    // Update member
    const updated = await Member.findByIdAndUpdate(
      member_id,
      {
        status,
        updated_at: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }

    return res.json({
      success: true,
      message: "Member status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

export const resetMemberPassword = async (req, res) => {
  try {
    const member_id = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      throw new AppError("Member doesn't exist", 404, "MEMBER_NOT_FOUND");
    }

    const member = await Member.findById(member_id);

    if (!member) {
      throw new AppError("Member doesn't exist", 404, "MEMBER_NOT_FOUND");
    }

    if ((await isOtpRateLimited(member.email, "Reset Password")) >= 3) {
      throw new AppError("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    }

    if (!isValidEmail(member.email)) {
      throw new AppError("Invalid email format", 400, "VALIDATION_ERROR");
    }

    const otpCode = generateOtpCode(6);
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const otp = new OTP({
      email: member.email,
      otp_code: otpHash,
      purpose: "password_reset",
      expires_at: expiresAt,
      used: false,
    });

    await sendEmail(member.email, otpCode, "Reset Password");
    await otp.save();

    return res.json({
      success: true,
      message: "OTP sent to member's email for password reset",
    });
  } catch (error) {
    console.error("Reset member password error:", error);

    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

export const getMemberAccess = async (req, res) => {
  try {
    const member_id = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      throw new AppError("Invalid member ID format", 400, "VALIDATION_ERROR");
    }

    const member = await Member.findById(member_id)
      .select("organization_id")
      .lean();

    if (!member) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }

    const organizationAccess = await Organizations.findById(
      member.organization_id,
    ).select("apps_and_tools");

    return res.json({
      success: true,
      message: "Member access fetched successfully",
      access: organizationAccess,
    });
  } catch (error) {
    console.error("Get member access error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

export const getMemberProfile = async (req, res) => {
  try {
    const member_id = req.body.id;

    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }

    const memberProfile = await Member.findById(member_id);
    const parsedMemberProfile = {
      id: memberProfile._id,
      email: memberProfile.email,
      organization_id: memberProfile.organization_id,
      status: memberProfile.status,
      email_confirmed: memberProfile.email_confirmed,
      last_login: memberProfile.last_login,
      created_at: memberProfile.created_at,
      updated_at: memberProfile.updated_at,
      role: memberProfile.role,
    };
    return res.json({
      success: true,
      message: "Member profile fetched successfully",
      member: parsedMemberProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

export const getCurrentMemberAccess = async (req, res) => {
  try {
    const member_id = req.body.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      throw new AppError("Invalid member ID format", 400, "VALIDATION_ERROR");
    }

    const member = await Member.findById(member_id)
      .select("organization_id")
      .lean();

    if (!member) {
      throw new AppError("Member not found", 404, "MEMBER_NOT_FOUND");
    }
    const memberAccess = await Organizations.findById(
      member.organization_id,
    ).select("apps_and_tools");

    return res.json({
      success: true,
      message: "Member access fetched successfully",
      access: memberAccess,
    });
  } catch (error) {
    console.error("Get member access error:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};
