import express from "express";
import {
  fetchOrganization,
  fetchOrganizationsDetail,
  UpdateOrganization,
  deleteOrganization,
  getOrganizationMembers,
} from "../controller/organizationController.js";
import { adminRequired } from "../utils/authUtils.js";

const router = express.Router();

router.get("/", adminRequired, fetchOrganization);
router.get("/:org_id", adminRequired, fetchOrganizationsDetail);
router.get("/:org_id/members", adminRequired, getOrganizationMembers);
router.put("/:org_id", adminRequired, UpdateOrganization);
router.delete("/:org_id", adminRequired, deleteOrganization);

export default router;
