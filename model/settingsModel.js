import mongoose from "mongoose";
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true }, // e.g., 'admin_secret'
  value: { type: String, required: true }, // bcrypt hashed for secrets
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("Setting", settingsSchema);
