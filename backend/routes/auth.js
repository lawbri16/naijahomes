import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models.js";
import { auth } from "../middleware.js";

const r = Router();
const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
// Two separate doors: clients (tenants / prospective tenants) and the agent portal (agents, property owners, admin)
const PORTALS = { client: ["tenant"], agent: ["agent", "owner", "admin"] };

r.post("/register", async (req, res) => {
  const { name, email, phone, password, role, portal } = req.body;
  if (!PORTALS[portal]) return res.status(400).json({ message: "Unknown portal" });
  const finalRole = portal === "client" ? "tenant" : role;
  if (!PORTALS[portal].includes(finalRole) || finalRole === "admin") return res.status(400).json({ message: "Choose agent or property owner" });
  if (await User.findOne({ email: email?.toLowerCase() })) return res.status(409).json({ message: "Email already registered" });
  const user = await User.create({ name, email, phone, password, role: finalRole });
  res.status(201).json({ token: sign(user), user });
});

r.post("/login", async (req, res) => {
  const { email, password, portal } = req.body;
  if (!PORTALS[portal]) return res.status(400).json({ message: "Unknown portal" });
  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
  if (!user || !user.active || !(await user.matches(password || ""))) return res.status(401).json({ message: "Wrong email or password" });
  if (!PORTALS[portal].includes(user.role))
    return res.status(403).json({ message: user.role === "tenant" ? "This is a client account. Please use the Client login." : "This is an agent/owner account. Please use the Agent login." });
  res.json({ token: sign(user), user });
});

r.get("/me", auth, (req, res) => res.json(req.user));
export default r;
