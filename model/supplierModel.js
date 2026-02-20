import mongoose from "mongoose";
import Ingredient from "./ingredientModel.js";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, default: "" },
  ingredient_supplier_org_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IngredientSupplierOrg",
    optional: true,
  },
  ingredients: { type: mongoose.Schema.Types.Array, of: Ingredient },
  createdAt: Date,
  updatedAt: Date,
  __v: Number,
});

export default mongoose.model("Supplier", supplierSchema);
