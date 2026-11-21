import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header>
      <div className="company"> 🏡 NaijaHomes </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/properties">Properties</Link>
        <Link to="/contact">Contact</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button className="nav-btn" onClick={() => { logout(); navigate("/"); }}>
              Log out ({user.name.split(" ")[0]})
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Client login</Link>
            <Link to="/agent/login">Agent login</Link>
          </>
        )}
      </nav>
    </header>
  );
}
