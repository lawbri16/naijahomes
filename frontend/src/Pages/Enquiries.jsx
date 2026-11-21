import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Enquiries() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/enquiries").then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const setStatus = (e, status) =>
    api(`/enquiries/${e.id}`, { method: "PATCH", body: { status } })
      .then((u) => setItems(items.map((x) => (x.id === e.id ? { ...x, status: u.status } : x))))
      .catch((err) => setError(err.message));

  return (
    <>
      <h2>{user.role === "tenant" ? "My enquiries" : "Enquiries"}</h2>
      {error && <p className="dash-error">{error}</p>}
      {loading ? <p className="dash-msg">Loading...</p> : items.length === 0 ? <p className="dash-msg">No enquiries yet.</p> : items.map((e) => (
        <div className="dash-card" key={e.id}>
          <div className="dash-head">
            <strong>{e.property ? `${e.property.title} (${e.property.neighbourhood}, ${e.property.city})` : "Removed property"}</strong>
            {user.role === "tenant" ? <span className="badge">{e.status}</span> : (
              <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value)}>
                <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
              </select>
            )}
          </div>
          <p>{e.message}</p>
          <p className="muted">{e.name} · {e.email}{e.phone && ` · ${e.phone}`} · {new Date(e.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </>
  );
}
