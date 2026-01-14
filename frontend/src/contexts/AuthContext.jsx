// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Load user on refresh (FIXED)
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          await getCurrentUser(); // ⏳ WAIT here
        } catch (err) {
          logout();
        }
      }

      setLoading(false); // ✅ AFTER auth check
    };

    loadUser();
  }, []);

  // Register
  const register = async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        toast.success("Registration successful!");
        return res.data;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  // Login
  const login = async (identifier, password) => {
    try {
      const res = await api.post("/auth/login", { identifier, password });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common["Authorization"] =
          `Bearer ${res.data.token}`;

        setUser(res.data.user);
        return res.data;
      }
    } catch (error) {
      if (error.response?.data?.code === "EMAIL_NOT_VERIFIED") {
        toast.warning("Please verify your email first.");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  };

  // Get Current User
  const getCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      console.error("Failed to load user:", error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
