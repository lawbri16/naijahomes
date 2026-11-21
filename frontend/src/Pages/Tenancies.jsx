import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const naira = (n) => "₦" + Number(n).toLocaleString();
const date = (d) => (d ? new Date(d).toLocaleDateString() : "-");

function TenancyCard({ t, isLandlord, onChange }) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({ payments: [], totalPaid: 0 });
  const [pay, setPay] = useState({ amount: "", paidOn: "", method: "transfer", reference: "", note: "" });
  const [error, setError] = useState("");

  const loadPay = () => api(`/tenancies/${t.id}/payments`).then(setData).catch((e) => setError(e.message));
  const toggle = () => { if (!show) loadPay(); setShow(!show); };
  const set = (e) => setPay({ ...pay, [e.target.name]: e.target.value });

  const addPayment = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api(`/tenancies/${t.id}/payments`, { method: "POST", body: { ...pay, amount: Number(pay.amount), paidOn: pay.paidOn || undefined } });
      setPay({ amount: "", paidOn: "", method: "transfer", reference: "", note: "" });
      loadPay();
    } catch (err) { setError(err.message); }
  };
  const end = () => window.confirm("End this tenancy?") && api(`/tenancies/${t.id}/end`, { method: "PATCH" }).then(onChange).catch((e) => setError(e.message));

  return (
    <div className="dash-card">
      <div className="dash-head">
        <div>
          <strong>{t.property?.title}</strong>
          <p>{t.property?.neighbourhood}, {t.property?.city} · Tenant: {t.tenant?.name} ({t.tenant?.email})</p>
          <p>{naira(t.rentAmount)} per {t.period} · {date(t.startDate)} to {date(t.endDate)} <span className={`badge ${t.status === "active" ? "ok" : ""}`}>{t.status}</span></p>
        </div>
        <div className="row-actions">
          <button className="ghost-btn" onClick={toggle}>{show ? "Hide payments" : "Payments"}</button>
          {isLandlord && t.status === "active" && <button className="ghost-btn danger" onClick={end}>End tenancy</button>}
        </div>
      </div>
      {show && (
        <>
          {error && <p className="dash-error">{error}</p>}
          <p><strong>Total paid: {naira(data.totalPaid)}</strong></p>
          {data.payments.length === 0 ? <p className="muted">No payments recorded yet.</p> : (
            <table className="dash-table"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th></tr></thead>
              <tbody>{data.payments.map((p) => <tr key={p.id}><td>{date(p.paidOn)}</td><td>{naira(p.amount)}</td><td>{p.method}</td><td>{p.reference || "-"}</td><td>{p.note || "-"}</td></tr>)}</tbody>
            </table>
          )}
          {isLandlord && (
            <form className="form-grid" onSubmit={addPayment}>
              <label className="fld"><span>Amount (₦)</span><input name="amount" type="number" min="1" required value={pay.amount} onChange={set} /></label>
              <label className="fld"><span>Date paid</span><input name="paidOn" type="date" value={pay.paidOn} onChange={set} /></label>
              <label className="fld"><span>Method</span>
                <select name="method" value={pay.method} onChange={set}><option>transfer</option><option>cash</option><option>card</option><option>other</option></select>
              </label>
              <label className="fld"><span>Reference</span><input name="reference" value={pay.reference} onChange={set} /></label>
              <label className="fld"><span>Note</span><input name="note" value={pay.note} onChange={set} /></label>
              <div className="form-actions"><button className="primary-btn">Record payment</button></div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default function Tenancies() {
  const { user } = useAuth();
  const isLandlord = ["owner", "agent", "admin"].includes(user.role);
  const [list, setList] = useState([]);
  const [props, setProps] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ property: "", tenantEmail: "", startDate: "", endDate: "", rentAmount: "", period: "year" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const load = () => {
    api("/tenancies").then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false));
    if (isLandlord)
      api(`/properties?limit=100${user.role === "admin" ? "" : "&mine=1"}`).then((r) => setProps(r.data.filter((p) => p.status === "available")));
  };
  useEffect(load, []); // eslint-disable-line

  const create = async (e) => {
    e.preventDefault(); setError("");
    try {
      await api("/tenancies", { method: "POST", body: { ...form, rentAmount: Number(form.rentAmount), endDate: form.endDate || undefined } });
      setOpen(false); setForm({ ...form, tenantEmail: "", rentAmount: "" }); load();
    } catch (err) { setError(err.message); }
  };

  return (
    <>
      <div className="dash-head">
        <h2>{isLandlord ? "Tenants & rent" : "My tenancies & rent"}</h2>
        {isLandlord && <button className="primary-btn" onClick={() => setOpen(!open)}>{open ? "Close" : "+ New tenancy"}</button>}
      </div>
      {error && <p className="dash-error">{error}</p>}
      {open && (
        <form className="dash-card form-grid" onSubmit={create}>
          <label className="fld"><span>Property (available ones only)</span>
            <select name="property" required value={form.property} onChange={set}>
              <option value="">Choose...</option>{props.map((p) => <option key={p.id} value={p.id}>{p.title} - {p.location}</option>)}
            </select>
          </label>
          <label className="fld"><span>Tenant's email (they must have a tenant account)</span><input name="tenantEmail" type="email" required value={form.tenantEmail} onChange={set} /></label>
          <label className="fld"><span>Start date</span><input name="startDate" type="date" required value={form.startDate} onChange={set} /></label>
          <label className="fld"><span>End date (optional)</span><input name="endDate" type="date" value={form.endDate} onChange={set} /></label>
          <label className="fld"><span>Rent amount (₦)</span><input name="rentAmount" type="number" min="1" required value={form.rentAmount} onChange={set} /></label>
          <label className="fld"><span>Rent is paid per</span>
            <select name="period" value={form.period} onChange={set}><option value="year">Year</option><option value="month">Month</option></select>
          </label>
          <div className="form-actions"><button className="primary-btn">Create tenancy</button></div>
        </form>
      )}
      {loading ? <p className="dash-msg">Loading...</p> : list.length === 0 ? <p className="dash-msg">No tenancies yet.</p> : list.map((t) => <TenancyCard key={t.id} t={t} isLandlord={isLandlord} onChange={load} />)}
    </>
  );
}
