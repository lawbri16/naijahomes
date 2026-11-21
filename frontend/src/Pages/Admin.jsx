import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Admin() {
  const { user: me } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api("/admin/stats"), api("/admin/users")]).then(([s, u]) => { setStats(s); setUsers(u); }).catch((e) => setError(e.message));
  }, []);

  const update = (u, body) =>
    api(`/admin/users/${u.id}`, { method: "PATCH", body })
      .then((n) => setUsers(users.map((x) => (x.id === u.id ? n : x))))
      .catch((e) => setError(e.message));

  const cards = stats && [
    ["Users", stats.users], ["Properties", stats.properties], ["Pending listings", stats.pendingListings],
    ["New enquiries", stats.newEnquiries], ["Active tenancies", stats.activeTenancies],
    ["Rent recorded", "₦" + stats.totalRentRecorded.toLocaleString()],
  ];

  return (
    <>
      <h2>Administrator dashboard</h2>
      {error && <p className="dash-error">{error}</p>}
      {cards && <div className="stat-grid">{cards.map(([l, v]) => <div className="dash-card" key={l}><p className="muted">{l}</p><strong>{v}</strong></div>)}</div>}
      <h2>Users</h2>
      <div className="dash-card" style={{ overflowX: "auto" }}>
        <table className="dash-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td>
                <td>
                  <select value={u.role} disabled={u.id === me.id} onChange={(e) => update(u, { role: e.target.value })}>
                    {["tenant", "owner", "agent", "admin"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td><input type="checkbox" checked={u.active} disabled={u.id === me.id} onChange={(e) => update(u, { active: e.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
