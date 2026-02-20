import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  verbatim: { type: String, required: true },
  category: { type: String, default: "" },
  tags: [String],
});

export default mongoose.model("Claim", claimSchema);
