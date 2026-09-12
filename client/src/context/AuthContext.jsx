import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";
import { connectSocket, disconnectSocket } from "../api/socket.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("hu_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hu_token");
    if (token) connectSocket(token);
    setReady(true);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    if (!["farmer", "supplier"].includes(data.user.role)) {
      throw new Error("This portal is for farmers and suppliers only");
    }
    localStorage.setItem("hu_token", data.token);
    localStorage.setItem("hu_user", JSON.stringify(data.user));
    connectSocket(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("hu_token");
    localStorage.removeItem("hu_user");
    disconnectSocket();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
