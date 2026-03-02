import express from "express";
import {
  fetchOrganization,
  fetchOrganizationsDetail,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
} from "../controller/organizationController.js";
import { adminRequired } from "../middleware/authUtils.js";
import { sanitizeBody } from "../middleware/sanitizeBody.js";

const router = express.Router();

router.get("/", adminRequired, fetchOrganization);
router.get("/:org_id", adminRequired, fetchOrganizationsDetail);
router.get("/:org_id/members", adminRequired, getOrganizationMembers);
router.put(
  "/:org_id",
  adminRequired,
  sanitizeBody(["name", "description", "allowed_domains", "apps_and_tools"]),
  updateOrganization,
);
router.delete("/:org_id", adminRequired, deleteOrganization);

export default router;
