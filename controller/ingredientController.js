import Ingredient from "../model/ingredientModel.js";
import Supplier from "../model/supplierModel.js";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

export const addIngredient = async (req, res) => {
  try {
    const {
      ingredient_name,
      description,
      limitations,
      application_notes,
      claims,
    } = req.body;

    const newIngredient = new Ingredient({
      ingredient_name,
      description,
      limitations,
      application_notes,
      claims,
    });
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      throw new AppError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");
    }
    supplier.ingredients.push(newIngredient);
    await supplier.save();
    res.status(201).json({
      message: "Ingredient added successfully",
      ingredient: newIngredient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add ingredient",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};

export const editIngredient = async (req, res) => {
  try {
    const { id, ingredientId } = req.params;
    const {
      ingredient_name,
      description,
      limitations,
      application_notes,
      claims,
    } = req.body;

    const ingredient = await Supplier.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        "ingredients._id": new ObjectId(ingredientId),
      },
      {
        $set: {
          "ingredients.$.ingredient_name": ingredient_name,
          "ingredients.$.description": description,
          "ingredients.$.limitations": limitations,
          "ingredients.$.application_notes": application_notes,
          "ingredients.$.claims": claims,
        },
      },
      { new: true },
    );

    if (!ingredient) {
      throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
    }
    res.status(200).json({
      message: "Ingredient updated successfully",
      ingredient: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update ingredient",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};
export const deleteIngredient = async (req, res) => {
  try {
    const { id, ingredientId } = req.params;
    const supplier = await Supplier.findByIdAndUpdate(id, {
      $pull: { ingredients: { _id: new ObjectId(ingredientId) } },
    });
    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }
    res.status(200).json({
      message: "Ingredient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete ingredient",
      error: {
        code: error.code || "SERVER_ERROR",
        message: error.message || "Server error",
      },
    });
  }
};
