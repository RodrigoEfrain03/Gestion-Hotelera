import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, authStorage } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expired = () => { authStorage.clear(); setUser(null); };
    window.addEventListener('hotel-auth-expired', expired);
    let alive = true;
    const bootstrap = async () => {
      if (!authStorage.getAccess()) { if (alive) setLoading(false); return; }
      try { const me = await api.me(); if (alive) setUser(me); }
      catch { authStorage.clear(); if (alive) setUser(null); }
      finally { if (alive) setLoading(false); }
    };
    bootstrap();
    return () => { alive = false; window.removeEventListener('hotel-auth-expired', expired); };
  }, []);

  const login = async (username, password) => {
    const tokens = await api.login({ username, password });
    authStorage.set(tokens);
    const me = await api.me();
    setUser(me);
    return me;
  };

  const logout = () => { authStorage.clear(); setUser(null); };
  const value = useMemo(() => ({ user, loading, login, logout, isAdmin: user?.role === "Administrador" }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return value;
}
