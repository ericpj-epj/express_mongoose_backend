import express from "express";
import {
  updateMemberStatus,
  resetMemberPassword,
  getMemberAccess,
  getMemberProfile,
  getCurrentMemberAccess,
} from "../controller/memberController.js";
import { adminRequired } from "../middleware/authUtils.js";
const router = express.Router();

router.patch("/:id", adminRequired, updateMemberStatus);
router.post("/:id/resetPassword", adminRequired, resetMemberPassword);
router.get("/:id/access", adminRequired, getMemberAccess);
router.get("/me", adminRequired, getMemberProfile);
router.post("/me/access", adminRequired, getCurrentMemberAccess);
// router.delete("/delete/:id", deleteMember);
export default router;
