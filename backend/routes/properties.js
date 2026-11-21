import { Router } from "express";
import { Property } from "../models.js";
import { auth, optionalAuth, allow, upload, saveImages, removeImage } from "../middleware.js";

const r = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const manages = (p, u) => u.role === "admin" || [p.owner, p.agent].some((x) => x?.toString() === u.id);
const list = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => s.trim()).filter(Boolean);
const populate = [{ path: "agent", select: "name phone email" }, { path: "owner", select: "name" }];

// GET /api/properties?q=&type=&city=&purpose=&minPrice=&maxPrice=&bedrooms=&sort=&page=&limit=
r.get("/", optionalAuth, async (req, res) => {
  const { q, type, city, purpose, minPrice, maxPrice, bedrooms, sort = "newest", mine } = req.query;
  const f = {};
  if (mine && req.user) f.$or = [{ owner: req.user.id }, { agent: req.user.id }];
  else if (req.query.pending && ["agent", "admin"].includes(req.user?.role)) f.isPublished = false; // listings waiting to be published
  else if (req.user?.role !== "admin") f.isPublished = true;
  if (q?.trim()) { const re = new RegExp(esc(q.trim()), "i"); f.$and = [{ $or: [{ title: re }, { neighbourhood: re }, { city: re }] }]; }
  if (type && type !== "all") f.type = type;
  if (city && city !== "all") f.city = city;
  if (purpose && purpose !== "all") f.purpose = purpose;
  if (bedrooms) f.bedrooms = { $gte: Number(bedrooms) };
  if (minPrice || maxPrice) f.price = {
    ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }),
  };
  const order = { "price-low": { price: 1 }, "price-high": { price: -1 } }[sort] || { createdAt: -1 };
  const limit = Math.min(Number(req.query.limit) || 12, 100), page = Math.max(Number(req.query.page) || 1, 1);
  const [data, total] = await Promise.all([
    Property.find(f).sort(order).skip((page - 1) * limit).limit(limit).populate(populate),
    Property.countDocuments(f),
  ]);
  res.json({ data, total, page, pages: Math.ceil(total / limit) });
});

r.get("/meta/filters", async (_q, res) => {
  const [cities, types] = await Promise.all([Property.distinct("city", { isPublished: true }), Property.distinct("type", { isPublished: true })]);
  res.json({ cities: cities.sort(), types: types.sort() });
});
r.get("/meta/stats", async (_q, res) => {
  const [properties, cities] = await Promise.all([Property.countDocuments({ isPublished: true }), Property.distinct("city", { isPublished: true })]);
  res.json({ properties, cities: cities.length });
});

r.get("/:id", optionalAuth, async (req, res) => {
  const p = await Property.findById(req.params.id).populate(populate);
  if (!p || (!p.isPublished && !(req.user && manages(p, req.user)))) return res.status(404).json({ message: "Property not found" });
  res.json(p);
});

// Owners, agents and admins create listings (multipart/form-data; images in field "images")
r.post("/", auth, allow("owner", "agent", "admin"), upload.array("images", 8), async (req, res) => {
  const b = req.body, u = req.user;
  const p = await Property.create({
    ...b,
    amenities: list(b.amenities),
    images: await saveImages(req.files),
    owner: u.role === "owner" ? u.id : b.owner || u.id,
    agent: u.role === "agent" ? u.id : b.agent,
    isPublished: u.role !== "owner", // owner listings wait for an agent/admin to publish
    pricePeriod: b.purpose === "rent" ? b.pricePeriod || "year" : null,
  });
  res.status(201).json(p);
});

r.patch("/:id", auth, upload.array("images", 8), async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Property not found" });
  if (!manages(p, req.user)) return res.status(403).json({ message: "Not allowed" });
  const { owner, agent, isPublished, ...rest } = req.body; // protected fields
  Object.assign(p, rest);
  if (p.purpose === "sale") p.pricePeriod = null;
  if (rest.amenities) p.amenities = list(rest.amenities);
  const drop = list(rest.removeImages);
  const gone = p.images.filter((i) => drop.includes(i)); // only images that really belong to this property
  if (gone.length) { p.images = p.images.filter((i) => !gone.includes(i)); gone.forEach(removeImage); }
  if (req.files?.length) p.images.push(...(await saveImages(req.files)));
  await p.save();
  res.json(p);
});

r.patch("/:id/publish", auth, allow("agent", "admin"), async (req, res) => {
  const p = await Property.findByIdAndUpdate(req.params.id, { isPublished: req.body.isPublished !== false, ...(req.user.role === "agent" && { agent: req.user.id }) }, { new: true });
  p ? res.json(p) : res.status(404).json({ message: "Property not found" });
});

r.delete("/:id", auth, async (req, res) => {
  const p = await Property.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Property not found" });
  if (!manages(p, req.user)) return res.status(403).json({ message: "Not allowed" });
  p.images.forEach(removeImage);
  await p.deleteOne();
  res.status(204).end();
});
export default r;
