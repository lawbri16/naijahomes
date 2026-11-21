import { Router } from "express";
import { User, Property, Enquiry, Tenancy, Payment } from "../models.js";
import { auth, allow } from "../middleware.js";

const r = Router();
r.use(auth, allow("admin"));

r.get("/stats", async (_q, res) => {
  const [users, properties, pending, enquiries, tenancies, paid] = await Promise.all([
    User.countDocuments(), Property.countDocuments(), Property.countDocuments({ isPublished: false }),
    Enquiry.countDocuments({ status: "new" }), Tenancy.countDocuments({ status: "active" }),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);
  res.json({ users, properties, pendingListings: pending, newEnquiries: enquiries, activeTenancies: tenancies, totalRentRecorded: paid[0]?.total || 0 });
});

r.get("/users", async (req, res) => res.json(await User.find(req.query.role ? { role: req.query.role } : {}).sort("-createdAt")));

r.patch("/users/:id", async (req, res) => {
  const { role, active } = req.body;
  const u = await User.findByIdAndUpdate(req.params.id, { ...(role && { role }), ...(active !== undefined && { active }) }, { new: true });
  u ? res.json(u) : res.status(404).json({ message: "User not found" });
});
export default r;
