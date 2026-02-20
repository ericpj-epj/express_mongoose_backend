import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userRoute from "./routes/memberRoute.js";
import supplierRoute from "./routes/supplierRoute.js";
import authRoute from "./routes/authRoute.js";
import organizationRoute from "./routes/organizationRoute.js";
import memberRoute from "./routes/memberRoute.js";
import adminRoute from "./routes/adminRoute.js";
import cors from "cors";

const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/crud";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

app.use("/api/users", userRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/auth", authRoute);
app.use("/api/organizations", organizationRoute);
app.use("/api/members", memberRoute);
app.use("/api/admin", adminRoute);
