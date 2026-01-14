import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Activity, Sparkles } from "lucide-react";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  // ❌ NOT LOGGED IN
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ ROLE NOT ALLOWED
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRedirectMap = {
      admin: "/admin/dashboard",
      doctor: "/doctor/dashboard",
      patient: "/patient/dashboard",
      therapist: "/therapy/dashboard",
    };

    return (
      <Navigate
        to={roleRedirectMap[user.role] || "/"}
        replace
      />
    );
  }

  // ✅ ACCESS GRANTED
  return children;
};

export default PrivateRoute;
