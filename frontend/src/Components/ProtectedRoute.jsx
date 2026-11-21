import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="dash-msg">Loading...</p>;
  if (!user) {
    // agent-only pages send you to the agent login, everything else to the client login
    const to = /\/dashboard\/(listings|pending|admin)/.test(loc.pathname) ? "/agent/login" : "/login";
    return <Navigate to={to} state={{ from: loc.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
