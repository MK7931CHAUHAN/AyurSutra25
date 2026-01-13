import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Sparkles } from 'lucide-react';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-blue-50">
        {/* AyurSutra Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-4">
            <div className="h-20 w-20 bg-linear-to-r from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center animate-pulse">
              <Activity className="h-10 w-10 text-white" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
            </div>
          </div>
      
        </div>
        
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    let redirectPath = '/';
    
    switch(user?.role) {
      case 'admin':
        redirectPath = '/admin';
        break;
      case 'doctor':
        redirectPath = '/doctor';
        break;
      case 'patient':
        redirectPath = '/patient';
        break;
      case 'therapist':
        redirectPath = '/therapy';
        break;
      default:
        redirectPath = '/';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PrivateRoute;