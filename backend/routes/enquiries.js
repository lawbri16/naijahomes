import { Router } from "express";
import { Enquiry, Property } from "../models.js";
import { auth, optionalAuth } from "../middleware.js";

const r = Router();

// Anyone can enquire (logged in or not)
r.post("/", optionalAuth, async (req, res) => {
  const { property, name, email, phone, message } = req.body;
  if (!(await Property.exists({ _id: property, isPublished: true }))) return res.status(404).json({ message: "Property not found" });
  const e = await Enquiry.create({ property, name, email, phone, message, user: req.user?.id });
  res.status(201).json(e);
});

// Owners/agents see enquiries for their own properties; admin sees all
r.get("/", auth, async (req, res) => {
  let f = {};
  if (req.user.role === "tenant") f = { user: req.user.id };
  else if (req.user.role !== "admin") {
    const ids = await Property.find({ $or: [{ owner: req.user.id }, { agent: req.user.id }] }).distinct("_id");
    f = { property: { $in: ids } };
  }
  res.json(await Enquiry.find(f).sort("-createdAt").populate("property", "title neighbourhood city"));
});

r.patch("/:id", auth, async (req, res) => {
  const e = await Enquiry.findById(req.params.id).populate("property");
  if (!e) return res.status(404).json({ message: "Enquiry not found" });
  const p = e.property, ok = req.user.role === "admin" || [p.owner, p.agent].some((x) => x?.toString() === req.user.id);
  if (!ok) return res.status(403).json({ message: "Not allowed" });
  e.status = req.body.status;
  await e.save();
  res.json(e);
});
export default r;
