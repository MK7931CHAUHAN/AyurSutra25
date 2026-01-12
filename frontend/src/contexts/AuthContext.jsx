// contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 RESTORE USER ON PAGE REFRESH
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set the token in axios headers first
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Try to get user profile
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          throw new Error('Failed to load user');
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("token");
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (identifier, password) => {
    try {
      console.log('AuthContext Login - Sending:', { identifier, password });
      
      // Send identifier (email or phone) instead of email
      const res = await api.post("/auth/login", { 
        identifier,  // Changed from email to identifier
        password 
      });
      
      console.log('AuthContext Login - Response:', res.data);
      
      if (res.data.success) {
        // Store token
        localStorage.setItem("token", res.data.token);
        
        // Set axios default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Update user state
        setUser(res.data.user);
        
        toast.success("Login successful!");
        return res.data;
      } else {
        throw new Error(res.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('AuthContext Login Error:', error.response?.data || error.message);
      setLoading(false);
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Login failed. Please check your credentials.";
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // ---------------- REGISTER ----------------
  const register = async (userData) => {
    try {
      console.log('AuthContext Register - Sending:', userData);
      
      const res = await api.post("/auth/register", userData);

      if (res.data.success) {
        // Save JWT token to localStorage
        localStorage.setItem("token", res.data.token);
        
        // Set axios default header
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Update user state
        setUser(res.data.user);

        toast.success("Registration successful!");
        return res.data;
      } else {
        throw new Error(res.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthContext Register Error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info("Logged out");
    navigate("/login");
  };

  // ---------------- RESET PASSWORD ----------------
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });

      toast.success("Password reset successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
      throw error;
    }
  };

  // ---------------- FORGOT PASSWORD ----------------
  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Password reset email sent!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
      throw error;
    }
  };

  // ---------------- GET CURRENT USER ----------------
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.get("/auth/me");
      
      if (res.data.success) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      resetPassword,
      forgotPassword,
      getCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);