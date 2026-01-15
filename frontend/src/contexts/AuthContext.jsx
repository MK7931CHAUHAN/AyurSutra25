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
      const token =  sessionStorage.getItem("token");

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
        sessionStorage.setItem("token", res.data.token);
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
      const res = await api.post("/auth/login", {
        identifier,
        password,
      });

      if (res.data.success) {
        const { token, user, redirectTo } = res.data;

        sessionStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(user);
        await getCurrentUser();
        toast.success("✅ Login successful");
        navigate(redirectTo || "/dashboard", { replace: true });

        return res.data;
      }
    } catch (err) {
      const data = err.response?.data;

      // 🔒 Doctor-specific errors
      if (data?.code === "DOCTOR_NOT_APPROVED") {
        toast.warning(data.message);
      } else if (data?.code === "EMAIL_NOT_VERIFIED") {
        toast.warning("Please verify your email first");
      } else if (data?.code === "ACCOUNT_SUSPENDED") {
        toast.error("Account suspended. Contact support.");
      } else {
        toast.error(data?.message || "Login failed");
      }

      throw err;
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
     sessionStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login", { replace: true });
  };

  /* =====================================================
     🔑 FORGOT PASSWORD (SEND OTP)
  ===================================================== */
  const forgotPassword = async (email) => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        toast.success("OTP sent to your email");
        navigate("/verify-otp", {
          state: { email },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔄 RESEND OTP (SAME API – SAFE)
  ===================================================== */
  const resendOTP = async (email) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        toast.success("New OTP sent");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     ✅ VERIFY OTP
  ===================================================== */
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.toString().trim(),
      });

      if (res.data.success) {
        toast.success("OTP verified");

        navigate("/reset-password", {
          state: {
            email,
            resetToken: res.data.resetToken,
          },
        });

        return res.data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔒 RESET PASSWORD
  ===================================================== */
  const resetPassword = async (email, resetToken, password) => {
  try {
    setLoading(true);

    const res = await api.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword: password, // ✅ FIX HERE
    });

    if (res.data.success) {
      toast.success("Password reset successfully");
      navigate("/login", { replace: true });
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Reset failed");
    throw err;
  } finally {
    setLoading(false);
  }
};

// Delete doctor (Admin)
const deleteDoctor = async (id) => {
  const res = await api.delete(`/auth/admin/doctors/${id}`);
  return res.data;
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
        forgotPassword,
        resendOTP,
        verifyOTP,
        resetPassword,
        getCurrentUser,
        deleteDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
