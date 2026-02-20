import Member from "../model/membersModel.js";
// import { sendOtpEmail } from "../controller/authController.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";
import { hashOtp, generateOtpCode, validateOtp } from "../utils/otps.js";
import { isOtpRateLimited } from "../utils/rateLimit.js";
import { isValidEmail } from "../utils/domainUtils.js";
// import { generateOtpCode, hashOtp } from "../utils/authUtils.js";
import OTP from "../model/otpModel.js";
import Organizations from "../model/organizationsModel.js";

export const updateMemberStatus = async (req, res) => {
  try {
    const member_id = req.params.id;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member id",
      });
    }

    // Validate status input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
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
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.json({
      success: true,
      message: "Member status updated successfully",
    });
  } catch (error) {
    console.error("Update member status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resetMemberPassword = async (req, res) => {
  try {
    const member_id = req.params.id;
    console.log("Reset password for member ID:", member_id);
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(404).json({
        success: false,
        error: "MEMBER_NOT_FOUND",
        message: "Member doesn't exist",
      });
    }

    const member = await Member.findById(member_id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: "MEMBER_NOT_FOUND",
        message: "Member doesn't exist",
      });
    }

    if (isOtpRateLimited(member.email, "Reset Password") >= 3) {
      return res.status(429).json({
        success: false,
        error: "VALIDATION_ERROR",
        message: "Rate limit exceeded",
      });
    }
    if (!isValidEmail(member.email)) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid email format" },
      });
    }
    const otpCode = generateOtpCode(6);
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 15 minutes
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
      message: "Server error",
    });
  }
};

export const getMemberAccess = async (req, res) => {
  try {
    const member_id = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "Member doesn't exist",
        },
      });
    }

    const member = await Member.findById(member_id);

    const organizationAccess = await Organizations.findById(
      member.organization_id,
    ).select("apps_and_tools");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.json({
      success: true,
      access: organizationAccess,
    });
  } catch (error) {
    console.error("Get member access error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMemberProfile = async (req, res) => {
  try {
    const member_id = req.body.id;

    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "Member doesn't exist",
        },
      });
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
      member: parsedMemberProfile,
    });
  } catch (err) {
    console.error("Get member profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCurrentMemberAccess = async (req, res) => {
  try {
    const member_id = req.body.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member_id)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "MEMBER_NOT_FOUND",
          message: "Member doesn't exist",
        },
      });
    }

    const member = await Member.findById(member_id);

    const memberAccess = await Organizations.findById(
      member.organization_id,
    ).select("apps_and_tools");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.json({
      success: true,
      access: memberAccess,
    });
  } catch (error) {
    console.error("Get member access error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
