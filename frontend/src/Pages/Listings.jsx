import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import PropertyForm from "../Components/PropertyForm";

// <Listings /> = your listings (all listings for admin); <Listings pending /> = listings waiting to be published
export default function Listings({ pending = false }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, property = edit
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const canPublish = ["agent", "admin"].includes(user.role);
  const scope = pending ? "pending=1" : user.role === "admin" ? "" : "mine=1";

  const load = () => {
    setLoading(true);
    api(`/properties?limit=100&${scope}`).then((r) => setItems(r.data)).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, [pending]); // eslint-disable-line

  const run = (p) => p.then(load).catch((e) => setError(e.message));
  const publish = (p, v) => run(api(`/properties/${p.id}/publish`, { method: "PATCH", body: { isPublished: v } }));
  const remove = (p) => window.confirm(`Delete "${p.title}"?`) && run(api(`/properties/${p.id}`, { method: "DELETE" }));

  if (editing) return <PropertyForm property={editing.id ? editing : null} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); load(); }} />;

  return (
    <>
      <div className="dash-head">
        <h2>{pending ? "Pending listings" : user.role === "admin" ? "All listings" : "My listings"}</h2>
        {!pending && <button className="primary-btn" onClick={() => setEditing({})}>+ Add property</button>}
      </div>
      {error && <p className="dash-error">{error}</p>}
      {loading ? <p className="dash-msg">Loading...</p> : items.length === 0 ? <p className="dash-msg">{pending ? "Nothing is waiting to be published." : "No listings yet."}</p> : items.map((p) => (
        <div className="dash-card dash-row" key={p.id}>
          {p.image && <img src={p.image} alt="" />}
          <div className="grow">
            <strong>{p.title}</strong>
            <p>{p.location} · ₦{p.price.toLocaleString()}{p.pricePeriod && ` / ${p.pricePeriod}`}</p>
            <span className={`badge ${p.isPublished ? "ok" : "wait"}`}>{p.isPublished ? "Published" : "Pending"}</span>{" "}
            <span className="badge">{p.status}</span>
          </div>
          <div className="row-actions">
            <Link to={`/property/${p.id}`} className="ghost-btn">View</Link>
            {canPublish && <button className="ghost-btn" onClick={() => publish(p, !p.isPublished)}>{p.isPublished ? "Unpublish" : "Publish"}</button>}
            {!pending && <button className="ghost-btn" onClick={() => setEditing(p)}>Edit</button>}
            {!pending && <button className="ghost-btn danger" onClick={() => remove(p)}>Delete</button>}
          </div>
        </div>
      ))}
    </>
  );
}
