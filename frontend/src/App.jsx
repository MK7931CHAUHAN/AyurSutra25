import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

/* ================= PUBLIC PAGES ================= */
import HomePage from "./pages/HomePage";

/* ================= AUTH PAGES ================= */
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPass";
import VerifyResetToken from "./components/auth/VerifyResetToken";
import ResetPassword from "./components/auth/ResetPassword";

/* ================= ROLE LAYOUT ================= */
import RoleLayout from "./components/Layout";

/* ================= ROLE ROUTES ================= */
import AdminRoutes from "./routes/AdminRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";
import PatientRoutes from "./routes/PatientRoutes";
import TherapyRoutes from "./routes/TherapyRoutes";

function App() {
  return (
    <Routes>

      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/" element={<HomePage />} />

      {/* ===== AUTH ROUTES ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-token/:token" element={<VerifyResetToken />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ===== ADMIN ROUTES ===== */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<AdminRoutes />} />
      </Route>

      {/* ===== DOCTOR ROUTES ===== */}
      <Route
        path="/doctor/*"
        element={
          <PrivateRoute allowedRoles={["doctor"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<DoctorRoutes />} />
      </Route>

      {/* ===== PATIENT ROUTES ===== */}
      <Route
        path="/patient/*"
        element={
          <PrivateRoute allowedRoles={["patient"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<PatientRoutes />} />
      </Route>

      {/* ===== THERAPY ROUTES ===== */}
      <Route
        path="/therapy/*"
        element={
          <PrivateRoute allowedRoles={["therapist"]}>
            <RoleLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<TherapyRoutes />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
