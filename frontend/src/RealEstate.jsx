import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import About from "./Pages/AboutUs";
import Properties from "./Pages/Properties";
import PropertyDetails from "./Pages/PropertyDetails";
import Contact from "./Pages/ContactUs";
import Auth from "./Pages/Auth";
import Listings from "./Pages/Listings";
import Enquiries from "./Pages/Enquiries";
import Tenancies from "./Pages/Tenancies";
import Admin from "./Pages/Admin";
import DashboardLayout from "./Components/DashboardLayout";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider, useAuth } from "./AuthContext";

import "./RealEstate.css";
import "./dashboard.css";

// /dashboard sends each role to its first page
function DashHome() {
  const { user } = useAuth();
  return <Navigate to={`/dashboard/${{ admin: "admin", tenant: "tenancies" }[user.role] || "listings"}`} replace />;
}

export default function RealEstate() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/contact" element={<Contact />} />

          {/* Two separate doors: clients, and agents/property owners */}
          <Route path="/login" element={<Auth portal="client" mode="login" />} />
          <Route path="/register" element={<Auth portal="client" mode="register" />} />
          <Route path="/agent/login" element={<Auth portal="agent" mode="login" />} />
          <Route path="/agent/register" element={<Auth portal="agent" mode="register" />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashHome />} />
            <Route path="listings" element={<ProtectedRoute roles={["owner", "agent", "admin"]}><Listings /></ProtectedRoute>} />
            <Route path="pending" element={<ProtectedRoute roles={["agent", "admin"]}><Listings pending /></ProtectedRoute>} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="tenancies" element={<Tenancies />} />
            <Route path="admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
