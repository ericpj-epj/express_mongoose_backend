import express from "express";
import {
  requestOtp,
  signIn,
  signUp,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/reset-password", resetPassword);

export default router;
