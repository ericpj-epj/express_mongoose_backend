import Settings from "../model/settingsModel.js";
import bcrypt from "bcrypt";

export const setAdminSecret = async (req, res) => {
  const { current_secret, new_secret } = req.body;

  const trimmedNew = (new_secret || "").trim();
  const trimmedCurrent = (current_secret || "").trim();

  if (!trimmedNew) {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "new_secret is required" },
    });
  }

  // Check if secret already exists
  const existingDoc = await Settings.findOne({ key: "admin_secret" });

  if (existingDoc) {
    // Verify current secret
    const isValid = await bcrypt.compare(trimmedCurrent, existingDoc.value);
    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Current admin secret is incorrect",
        },
      });
    }
  }

  // Hash and store new secret
  const hashedSecret = await bcrypt.hash(trimmedNew, 10);

  await Settings.updateOne(
    { key: "admin_secret" },
    {
      $set: {
        key: "admin_secret",
        value: hashedSecret,
        updated_at: new Date(),
      },
    },
    { upsert: true },
  );

  res.json({
    success: true,
    message: "Admin secret updated successfully",
  });
};
