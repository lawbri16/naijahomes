import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api("/auth/me").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);

  const save = ({ token, user }) => { localStorage.setItem("token", token); setUser(user); return user; };
  // portal is "client" or "agent"
  const login = async (body, portal) => save(await api("/auth/login", { method: "POST", body: { ...body, portal } }));
  const register = async (body, portal) => save(await api("/auth/register", { method: "POST", body: { ...body, portal } }));
  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
