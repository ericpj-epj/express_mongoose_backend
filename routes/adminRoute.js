import express from "express";
import { setAdminSecret } from "../controller/adminController.js";

const router = express.Router();

router.post("/secret", setAdminSecret);

export default router;
