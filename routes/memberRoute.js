import express from "express";
import {
  updateMemberStatus,
  resetMemberPassword,
  getMemberAccess,
  getMemberProfile,
  getCurrentMemberAccess,
} from "../controller/memberController.js";

const router = express.Router();

router.patch("/:id", updateMemberStatus);
router.post("/:id/resetPassword", resetMemberPassword);
router.get("/:id/access", getMemberAccess);
router.get("/me", getMemberProfile);
router.post("/me/access", getCurrentMemberAccess);
// router.delete("/delete/:id", deleteMember);
export default router;
