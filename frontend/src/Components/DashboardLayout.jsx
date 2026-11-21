import { NavLink, Outlet } from "react-router-dom";
import NavBar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../AuthContext";

const LINKS = {
  tenant: [["tenancies", "My tenancies & rent"], ["enquiries", "My enquiries"]],
  owner: [["listings", "My listings"], ["enquiries", "Enquiries"], ["tenancies", "Tenants & rent"]],
  agent: [["listings", "My listings"], ["pending", "Pending listings"], ["enquiries", "Enquiries"], ["tenancies", "Tenants & rent"]],
  admin: [["admin", "Users"], ["pending", "Pending listings"], ["listings", "All listings"], ["enquiries", "Enquiries"], ["tenancies", "Tenants & rent"]],
};

export default function DashboardLayout() {
  const { user } = useAuth();
  return (
    <>
      <NavBar />
      <div className="dash">
        <aside className="dash-side">
          <p className="dash-user"><strong>{user.name}</strong><span>{user.role}</span></p>
          {LINKS[user.role].map(([to, label]) => (
            <NavLink key={to} to={`/dashboard/${to}`} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
          ))}
        </aside>
        <section className="dash-main"><Outlet /></section>
      </div>
      <Footer />
    </>
  );
}
