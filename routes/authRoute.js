import express from "express";
import {
  requestOtp,
  signIn,
  signUp,
  resetPassword,
} from "../controller/authController.js";
import { adminRequired } from "../middleware/authUtils.js";
import { sanitizeBody } from "../middleware/sanitizeBody.js";
const router = express.Router();

router.post("/request-otp", sanitizeBody(["email", "purpose"]), requestOtp);
router.post("/sign-up", sanitizeBody(["email", "password", "otp"]), signUp);
router.post("/sign-in", sanitizeBody(["email", "password"]), signIn);
router.post(
  "/reset-password",
  sanitizeBody(["email", "otp", "new_password"]),
  resetPassword,
);

export default router;
