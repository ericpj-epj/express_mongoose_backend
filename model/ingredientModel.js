import mongoose from "mongoose";
import Claim from "./claimModel.js";

const ingredientSchema = new mongoose.Schema({
  ingredient_name: { type: String, required: true },
  description: { type: String, default: "" },
  limitations: { type: String, default: "" },
  application_notes: { type: String, default: "" },
  claims: { type: mongoose.Schema.Types.Array, of: Claim },
});

export default mongoose.model("Ingredient", ingredientSchema);
