import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { User } from "./models.js";

const read = async (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const u = await User.findById(id);
    return u?.active ? u : null;
  } catch { return null; }
};
export const optionalAuth = async (req, _res, next) => { req.user = await read(req); next(); };
export const auth = async (req, res, next) => {
  req.user = await read(req);
  req.user ? next() : res.status(401).json({ message: "Please log in" });
};
export const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: "Not allowed" });

// ---- Image storage ----
// With CLOUDINARY_URL set, images go to Cloudinary (survives redeploys, works from any computer).
// Without it, they are saved in backend/uploads (fine for local development only).
export const useCloud = !!process.env.CLOUDINARY_URL;

export const upload = multer({
  storage: useCloud
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: "uploads",
        filename: (_r, f, cb) => cb(null, crypto.randomUUID() + path.extname(f.originalname).toLowerCase()),
      }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_r, f, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(f.mimetype)),
});

const toCloud = (file) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "naijahomes", resource_type: "image", transformation: [{ width: 1600, crop: "limit", quality: "auto" }] },
        (err, r) => (err ? reject(err) : resolve(r.secure_url)))
      .end(file.buffer);
  });

// Turns the uploaded files from multer into the URLs we store in MongoDB
export const saveImages = (files = []) => Promise.all(files.map((f) => (useCloud ? toCloud(f) : `/uploads/${f.filename}`)));

// Deletes one stored image (best effort)
export const removeImage = (url) => {
  if (url.includes("res.cloudinary.com")) {
    const id = url.split("/upload/")[1]?.replace(/^v\d+\//, "").replace(/\.[^./]+$/, "");
    if (id && useCloud) cloudinary.uploader.destroy(id).catch(() => {});
  } else if (url.startsWith("/uploads/")) {
    fs.unlink(path.join("uploads", path.basename(url)), () => {});
  }
};
