import { useState } from "react";
import { api, pretty } from "../api";

const TYPES = ["apartment", "duplex", "detached-house", "serviced-apartment", "terrace", "bungalow", "studio", "mansion", "land"];
const Field = ({ label, children }) => <label className="fld"><span>{label}</span>{children}</label>;

export default function PropertyForm({ property, onDone, onCancel }) {
  const [f, setF] = useState({
    title: property?.title || "", purpose: property?.purpose || "sale", type: property?.type || "apartment",
    price: property?.price ?? "", pricePeriod: property?.pricePeriod || "year",
    bedrooms: property?.bedrooms ?? 1, bathrooms: property?.bathrooms ?? 1, area: property?.area ?? "",
    city: property?.city || "", neighbourhood: property?.neighbourhood || "",
    amenities: property?.amenities?.join(", ") || "", description: property?.description || "",
  });
  const [files, setFiles] = useState([]);
  const [remove, setRemove] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const toggleRemove = (img) => setRemove(remove.includes(img) ? remove.filter((i) => i !== img) : [...remove, img]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => { if (!(k === "pricePeriod" && f.purpose === "sale")) fd.append(k, v); });
    files.forEach((file) => fd.append("images", file));
    if (remove.length) fd.append("removeImages", remove.join(","));
    try {
      await api(property ? `/properties/${property.id}` : "/properties", { method: property ? "PATCH" : "POST", body: fd });
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form className="dash-card form-grid" onSubmit={submit}>
      <h2>{property ? "Edit property" : "Add a property"}</h2>
      <Field label="Title"><input name="title" required value={f.title} onChange={set} /></Field>
      <Field label="For">
        <select name="purpose" value={f.purpose} onChange={set}><option value="sale">Sale</option><option value="rent">Rent</option></select>
      </Field>
      <Field label="Property type">
        <select name="type" value={f.type} onChange={set}>{TYPES.map((t) => <option key={t} value={t}>{pretty(t)}</option>)}</select>
      </Field>
      <Field label="Price (₦)"><input name="price" type="number" min="0" required value={f.price} onChange={set} /></Field>
      {f.purpose === "rent" && (
        <Field label="Rent is paid per">
          <select name="pricePeriod" value={f.pricePeriod} onChange={set}><option value="year">Year</option><option value="month">Month</option></select>
        </Field>
      )}
      <Field label="Bedrooms"><input name="bedrooms" type="number" min="0" required value={f.bedrooms} onChange={set} /></Field>
      <Field label="Bathrooms"><input name="bathrooms" type="number" min="0" required value={f.bathrooms} onChange={set} /></Field>
      <Field label="Size (m²)"><input name="area" type="number" min="0" required value={f.area} onChange={set} /></Field>
      <Field label="City">
        <input name="city" list="cities" required value={f.city} onChange={set} />
        <datalist id="cities"><option>Lagos</option><option>Abuja</option><option>Ibadan</option><option>Port Harcourt</option></datalist>
      </Field>
      <Field label="Neighbourhood"><input name="neighbourhood" required value={f.neighbourhood} onChange={set} /></Field>
      <Field label="Amenities (comma separated)"><input name="amenities" value={f.amenities} onChange={set} /></Field>
      <Field label="Description"><textarea name="description" rows="4" value={f.description} onChange={set} /></Field>
      {property?.images?.length > 0 && (
        <div className="existing-images">
          {property.images.map((img) => (
            <label key={img} className={remove.includes(img) ? "gone" : ""}>
              <img src={img} alt="" />
              <span><input type="checkbox" checked={remove.includes(img)} onChange={() => toggleRemove(img)} /> Remove</span>
            </label>
          ))}
        </div>
      )}
      <Field label="Upload images (JPG, PNG, WebP; max 8 at a time, 5 MB each)">
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles([...e.target.files])} />
      </Field>
      {error && <p className="dash-error">{error}</p>}
      <div className="form-actions">
        <button className="primary-btn" disabled={busy}>{busy ? "Saving..." : "Save property"}</button>
        <button type="button" className="ghost-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
