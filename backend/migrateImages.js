// Moves images that were saved on this computer (backend/uploads) to Cloudinary and updates the database.
// Needs CLOUDINARY_URL in .env. Run once: npm run migrate-images
import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { Property } from "./models.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
if (!process.env.CLOUDINARY_URL) { console.error("Set CLOUDINARY_URL in .env first"); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);

let moved = 0, missing = 0;
for (const p of await Property.find({ images: /^\/uploads\// })) {
  const next = [];
  for (const img of p.images) {
    const file = path.join("uploads", path.basename(img));
    if (!img.startsWith("/uploads/")) { next.push(img); continue; }
    if (!fs.existsSync(file)) { missing++; console.log("File not found, dropping:", img); continue; }
    const r = await cloudinary.uploader.upload(file, { folder: "naijahomes", transformation: [{ width: 1600, crop: "limit", quality: "auto" }] });
    next.push(r.secure_url); moved++;
  }
  p.images = next;
  await p.save();
}
console.log(`Moved ${moved} image(s) to Cloudinary. Missing files: ${missing}`);
await mongoose.disconnect();
