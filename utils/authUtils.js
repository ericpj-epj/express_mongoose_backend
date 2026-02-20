import Organization from "../model/organizationsModel.js";

import jwt from "jsonwebtoken";

export const adminRequired = async (req, res, next) => {
  try {
    /* ==============================
       1️⃣ Validate Admin Secret
    ============================== */
    const providedSecret = req.headers["x-admin-secret"]?.trim();

    if (!providedSecret) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin secret is missing",
        },
      });
    }

    const isValidSecret = await verifyAdminSecret(providedSecret);

    if (!isValidSecret) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin secret is invalid",
        },
      });
    }

    /* ==============================
       2️⃣ Validate JWT Token
    ============================== */
    const authHeader = req.headers.authorization?.trim();

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or missing authentication token",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    /* ==============================
       ✅ All checks passed
    ============================== */
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
};

function verifyAdminSecret(inputSecret) {
  return inputSecret === process.env.ADMIN_SECRET;
}
