import mongoose from "mongoose";

const organizationsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  allowed_domains: { type: [String], default: [] }, // e.g., ['acme.com', 'acme.io']
  apps_and_tools: {
    leadlogic: { type: Boolean, default: false },
    signals: { type: Boolean, default: false },
    skutrition: { type: Boolean, default: false },
    internal_tools: { type: Boolean, default: false },
  },
});

export default mongoose.model("Organization", organizationsSchema);
