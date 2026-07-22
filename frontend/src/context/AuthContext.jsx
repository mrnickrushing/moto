import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = admin

  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin")) {
      setUser(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // If 2FA is enabled, the account isn't authenticated yet — the caller
    // must collect a code and call verifyLogin2FA with the returned mfa_token.
    if (!data.mfa_required) setUser(data);
    return data;
  };

  const verifyLogin2FA = async (mfaToken, code) => {
    const { data } = await api.post("/auth/login/verify-2fa", { mfa_token: mfaToken, code });
    setUser(data);
    return data;
  };

  const acceptInvite = async (token, password) => {
    const { data } = await api.post(`/auth/invite/${token}/accept`, { password });
    setUser(data);
    return data;
  };

  const resetPassword = async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, acceptInvite, resetPassword, verifyLogin2FA }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
