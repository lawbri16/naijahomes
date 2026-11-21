import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavBar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useAuth } from "../AuthContext";

// portal: "client" (tenants / prospective tenants) or "agent" (agents & property owners); mode: "login" | "register"
export default function Auth({ portal, mode }) {
  const isLogin = mode === "login";
  const isAgent = portal === "agent";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", role: "agent" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const base = isAgent ? "/agent" : "";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (isLogin) await login({ email: f.email, password: f.password }, portal);
      else await register(f, portal);
      navigate(from || "/dashboard", { replace: true });
    } catch (err) { setError(err.message); setBusy(false); }
  };

  const title = `${isAgent ? "Agent & owner" : "Client"} ${isLogin ? "login" : "registration"}`;
  return (
    <>
      <NavBar />
      <form className="dash-card auth-card form-grid" onSubmit={submit}>
        <h2>{title}</h2>
        <p className="muted">
          {isAgent ? "For real estate agents and property owners who list and manage properties." : "For people looking to rent or buy a property."}
        </p>
        {!isLogin && <label className="fld"><span>Full name</span><input name="name" required value={f.name} onChange={set} /></label>}
        <label className="fld"><span>Email</span><input name="email" type="email" required value={f.email} onChange={set} /></label>
        {!isLogin && <label className="fld"><span>Phone</span><input name="phone" required value={f.phone} onChange={set} /></label>}
        <label className="fld"><span>Password</span><input name="password" type="password" minLength={8} required value={f.password} onChange={set} /></label>
        {!isLogin && isAgent && (
          <label className="fld"><span>I am a</span>
            <select name="role" value={f.role} onChange={set}><option value="agent">Real estate agent</option><option value="owner">Property owner</option></select>
          </label>
        )}
        {error && <p className="dash-error">{error}</p>}
        <button className="primary-btn" disabled={busy}>{busy ? "Please wait..." : isLogin ? "Log in" : "Create account"}</button>
        <p className="portal-note">
          {isLogin ? <>No account? <Link to={`${base}/register`}>Register</Link></> : <>Already registered? <Link to={`${base}/login`}>Log in</Link></>}
          <br />
          {isAgent ? <>Looking for a property? <Link to="/login">Client login</Link></> : <>Agent or property owner? <Link to="/agent/login">Agent login</Link></>}
        </p>
      </form>
      <Footer />
    </>
  );
}
