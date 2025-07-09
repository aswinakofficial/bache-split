import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const { user, access, refresh } = JSON.parse(saved);
      setUser(user);
      setAccess(access);
      setRefresh(refresh);
    }
  }, []);

  const login = async (googleToken) => {
    const res = await api.post("/auth/google-login/", { token: googleToken });
    const authData = {
      user: {
        user_id: res.data.user_id,
        email: res.data.email,
        name: res.data.name,
        picture: res.data.picture,
      },
      access: res.data.access,
      refresh: res.data.refresh,
    };
    setUser(authData.user);
    setAccess(authData.access);
    setRefresh(authData.refresh);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    localStorage.removeItem("auth");
  };

  // Optionally: implement token refresh logic here

  return (
    <AuthContext.Provider value={{ user, access, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};