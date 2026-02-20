import express from "express";
import {
  fetchSuppliers,
  fetchSuppliersDetail,
  addSupplier,
  UpdateSupplier,
  deleteSupplier,
} from "../controller/supplierController.js";
import {
  addIngredient,
  editIngredient,
  deleteIngredient,
} from "../controller/ingredientController.js";
import { adminRequired } from "../utils/authUtils.js";
const router = express.Router();

router.get("/", fetchSuppliers);
router.get("/:id", fetchSuppliersDetail);
router.post("/", addSupplier);
router.patch("/:id", UpdateSupplier);
router.delete("/:id", deleteSupplier);
router.post("/:id/ingredients", addIngredient);
router.put("/:id/ingredients/:ingredientId", editIngredient);
router.delete(
  "/:id/ingredients/:ingredientId",

  deleteIngredient,
);
export default router;
