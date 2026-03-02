import express from "express";
import {
  fetchSuppliers,
  fetchSuppliersDetail,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controller/supplierController.js";
import {
  addIngredient,
  editIngredient,
  deleteIngredient,
} from "../controller/ingredientController.js";
import { adminRequired } from "../middleware/authUtils.js";
import { sanitizeBody } from "../middleware/sanitizeBody.js";

const router = express.Router();

router.get("/", adminRequired, fetchSuppliers);
router.get("/:id", adminRequired, fetchSuppliersDetail);
router.post(
  "/",
  adminRequired,
  sanitizeBody(["name", "description", "contact_info"]),
  addSupplier,
);
router.patch(
  "/:id",
  adminRequired,
  sanitizeBody(["name", "description", "contact_info"]),
  updateSupplier,
);
router.delete("/:id", adminRequired, deleteSupplier);
router.post(
  "/:id/ingredients",
  adminRequired,
  sanitizeBody(["name", "description", "category"]),
  addIngredient,
);
router.put(
  "/:id/ingredients/:ingredientId",
  adminRequired,
  sanitizeBody(["name", "description", "category"]),
  editIngredient,
);
router.delete(
  "/:id/ingredients/:ingredientId",

  deleteIngredient,
);
export default router;
