import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, login as loginRequest, tokenStore } from '../api/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const data = await apiRequest('/auth/me/');
      setUser(data);
      return data;
    } catch {
      await tokenStore.clear();
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    (async () => {
      const access = await tokenStore.getAccess();
      const refresh = await tokenStore.getRefresh();
      if (access || refresh) await loadUser();
      setLoading(false);
    })();
  }, []);

  async function signIn(username, password) {
    await loginRequest(username.trim(), password);
    const profile = await loadUser();
    if (!profile) throw { detail: 'No se pudo cargar el perfil del usuario.' };
  }

  async function signOut() {
    await tokenStore.clear();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, signIn, signOut, refreshUser: loadUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
