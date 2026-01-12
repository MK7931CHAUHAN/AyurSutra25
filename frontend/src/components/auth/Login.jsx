import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from "../../contexts/AuthContext";
import { FaLock, FaUser, FaSpinner, FaGoogle, FaFacebookF, FaEye, FaEyeSlash, FaSignInAlt, FaLeaf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false
    },
    mode: 'onChange'
  });

  const [showPassword, setShowPassword] = useState(false);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const role = user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else if (role === "patient") navigate("/patient/dashboard");
      else if (role === "therapist") navigate("/therapy/dashboard");
      else navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (data) => {
    try {
      console.log('Submitting login form:', data);
      
      // Call login with identifier (not email)
      await login(data.identifier, data.password);
      
      
    } catch (err) {
      console.error('Login failed:', err);
      // Error toast is already shown by AuthContext
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Login failed'
      });
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login integration is under development!`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <FaLeaf className="animate-pulse text-6xl text-emerald-600 mx-auto mb-4" />
          <div className="flex items-center space-x-2">
            <FaSpinner className="animate-spin text-2xl text-emerald-500" />
            <span className="text-emerald-700 font-medium">Loading AyurSutra...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg mb-4">
              <FaLeaf className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="you@example.com or 9876543210"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.identifier ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  {...register('identifier', {
                    required: 'Email or phone is required'
                  })}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 rounded"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaSignInAlt className="mr-2" />
                  Sign In
                </span>
              )}
            </button>

            {/* Error Message */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.root.message}
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaGoogle className="text-red-500 mr-2" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('Facebook')}
              className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-blue-50"
            >
              <FaFacebookF className="text-blue-600 mr-2" />
              <span>Facebook</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;