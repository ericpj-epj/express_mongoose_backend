import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  email: { type: String, unique: true }, // unique index
  password: { type: String, required: true }, // bcrypt hashed
  email_confirmed: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "pending",
  }, // 'active', 'inactive', 'pending'
  last_login: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  role: { type: String, enum: ["member", "admin"], default: "member" }, // 'member' or 'admin'
});

export default mongoose.model("Member", memberSchema);
