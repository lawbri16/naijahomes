// Creates (or resets) the administrator account from ADMIN_EMAIL / ADMIN_PASSWORD in .env. Run: npm run admin
import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import { User } from "./models.js";

const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
if (!email || !password) { console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first"); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
let u = await User.findOne({ email: email.toLowerCase() });
if (u) Object.assign(u, { role: "admin", password, active: true });
else u = new User({ name: "Administrator", email, password, role: "admin" });
await u.save();
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
