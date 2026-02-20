import express from "express";
import {
  RequestOTp,
  signIn,
  signUp,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/request-otp", RequestOTp);
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/reset-password", resetPassword);

export default router;
