import { Router } from "express";
import { Tenancy, Payment, Property, User } from "../models.js";
import { auth, allow } from "../middleware.js";

const r = Router();
r.use(auth);
const mine = (u) => (u.role === "admin" ? {} : { $or: [{ landlord: u.id }, { tenant: u.id }] });
const pop = [{ path: "property", select: "title neighbourhood city" }, { path: "tenant", select: "name email phone" }];

r.get("/", async (req, res) => res.json(await Tenancy.find(mine(req.user)).sort("-createdAt").populate(pop)));

// Create a tenancy for a property you manage; tenant is found by email
r.post("/", allow("owner", "agent", "admin"), async (req, res) => {
  const { property, tenantEmail, startDate, endDate, rentAmount, period } = req.body;
  const p = await Property.findById(property);
  const manages = p && (req.user.role === "admin" || [p.owner, p.agent].some((x) => x?.toString() === req.user.id));
  if (!manages) return res.status(403).json({ message: "You do not manage this property" });
  const tenant = await User.findOne({ email: tenantEmail?.toLowerCase(), role: "tenant" });
  if (!tenant) return res.status(404).json({ message: "No tenant account with that email" });
  const t = await Tenancy.create({ property, tenant: tenant.id, landlord: req.user.id, startDate, endDate, rentAmount, period });
  await Property.findByIdAndUpdate(property, { status: "rented" });
  res.status(201).json(await t.populate(pop));
});

const load = async (req, res) => {
  const t = await Tenancy.findOne({ _id: req.params.id, ...mine(req.user) });
  if (!t) res.status(404).json({ message: "Tenancy not found" });
  return t;
};

r.patch("/:id/end", allow("owner", "agent", "admin"), async (req, res) => {
  const t = await load(req, res); if (!t) return;
  t.status = "ended"; t.endDate = new Date(); await t.save();
  await Property.findByIdAndUpdate(t.property, { status: "available" });
  res.json(t);
});

r.get("/:id/payments", async (req, res) => {
  const t = await load(req, res); if (!t) return;
  const payments = await Payment.find({ tenancy: t.id }).sort("-paidOn");
  res.json({ payments, totalPaid: payments.reduce((s, p) => s + p.amount, 0) });
});

r.post("/:id/payments", allow("owner", "agent", "admin"), async (req, res) => {
  const t = await load(req, res); if (!t) return;
  const { amount, paidOn, method, reference, note } = req.body;
  res.status(201).json(await Payment.create({ tenancy: t.id, amount, paidOn, method, reference, note }));
});
export default r;
