import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema, model } = mongoose;
const ref = (m, extra = {}) => ({ type: Schema.Types.ObjectId, ref: m, ...extra });
// Every document is sent to the client with `id` (not `_id`) so your components keep working.
const opts = {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false, transform: (_, r) => { delete r._id; delete r.password; } },
};

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["tenant", "owner", "agent", "admin"], default: "tenant" },
  active: { type: Boolean, default: true },
}, opts);
userSchema.pre("save", async function () {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matches = function (pw) { return bcrypt.compare(pw, this.password); };

const propertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  purpose: { type: String, enum: ["sale", "rent"], required: true },
  type: { type: String, required: true, lowercase: true }, // apartment, duplex, detached-house...
  price: { type: Number, required: true, min: 0 },
  pricePeriod: { type: String, enum: ["year", "month", null], default: null },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  area: { type: Number, default: 0 }, // size in m², same as your mock data
  city: { type: String, required: true, trim: true },
  neighbourhood: { type: String, required: true, trim: true },
  amenities: [String],
  images: [String],
  owner: ref("User", { required: true }),
  agent: ref("User"),
  status: { type: String, enum: ["available", "rented", "sold"], default: "available" },
  isPublished: { type: Boolean, default: false },
}, opts);
propertySchema.virtual("location").get(function () { return `${this.neighbourhood}, ${this.city}`; });
propertySchema.virtual("image").get(function () { return this.images?.[0]; });
propertySchema.index({ city: 1, type: 1, price: 1 });

const enquirySchema = new Schema({
  property: ref("Property", { required: true }),
  user: ref("User"),
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
}, opts);

const tenancySchema = new Schema({
  property: ref("Property", { required: true }),
  tenant: ref("User", { required: true }),
  landlord: ref("User", { required: true }), // owner/agent who manages it
  startDate: { type: Date, required: true },
  endDate: Date,
  rentAmount: { type: Number, required: true },
  period: { type: String, enum: ["month", "year"], default: "year" },
  status: { type: String, enum: ["active", "ended"], default: "active" },
}, opts);

const paymentSchema = new Schema({
  tenancy: ref("Tenancy", { required: true }),
  amount: { type: Number, required: true, min: 1 },
  paidOn: { type: Date, default: Date.now },
  method: { type: String, enum: ["cash", "transfer", "card", "other"], default: "transfer" },
  reference: String,
  note: String,
}, opts);

export const User = model("User", userSchema);
export const Property = model("Property", propertySchema);
export const Enquiry = model("Enquiry", enquirySchema);
export const Tenancy = model("Tenancy", tenancySchema);
export const Payment = model("Payment", paymentSchema);
