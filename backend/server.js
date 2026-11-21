import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/properties.js";
import enquiryRoutes from "./routes/enquiries.js";
import tenancyRoutes from "./routes/tenancies.js";
import adminRoutes from "./routes/admin.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]); // fixes the Atlas "querySrv ECONNREFUSED" error on some networks

fs.mkdirSync("uploads", { recursive: true });
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/tenancies", tenancyRoutes);
app.use("/api/admin", adminRoutes);

// In production (after `npm run build`) this server also serves the website, so one link runs everything
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../frontend/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res, next) =>
    req.path.startsWith("/api") || req.path.startsWith("/uploads") ? next() : res.sendFile(path.join(dist, "index.html")));
}

// Express 4 does not catch async errors by itself, so unhandled rejections land here
process.on("unhandledRejection", (e) => console.error(e));
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.name === "ValidationError" || err.name === "CastError" ? 400 : err.code === 11000 ? 409 : 500;
  res.status(status).json({ message: status === 500 ? "Server error" : err.message });
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log("API running on port", process.env.PORT || 5000));
