import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import supplierRoute from "./routes/supplierRoute.js";
import authRoute from "./routes/authRoute.js";
import organizationRoute from "./routes/organizationRoute.js";
import memberRoute from "./routes/memberRoute.js";
import adminRoute from "./routes/adminRoute.js";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
dotenv.config();
app.use(bodyParser.json());
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
};
app.use(cors(corsOptions));
app.use(errorHandler);

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

app.use("/api/suppliers", cors(corsOptions), supplierRoute);
app.use("/api/auth", authRoute);
app.use("/api/organizations", organizationRoute);
app.use("/api/members", memberRoute);
app.use("/api/admin", adminRoute);
