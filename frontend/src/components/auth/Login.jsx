import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from "../../contexts/AuthContext";
import { FaLock, FaUser, FaSpinner, FaGoogle, FaFacebookF, FaEye, FaEyeSlash, FaSignInAlt, FaLeaf, FaHandHoldingHeart, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import health-related image
// import healthImage from '../../assets/health-login.jpg'; // You'll need to add this image

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);

  /* ================= AOS INIT ================= */
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  /* ================= EMAIL VERIFY TOAST ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("verified") === "true") {
      toast.success("✅ Email verified successfully! Please login.");
      navigate("/login", { replace: true });
    }

    if (params.get("error")) {
      toast.error("❌ Email verification failed.");
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);

  /* ================= ROLE BASED REDIRECT ================= */
  useEffect(() => {
    if (!authLoading && user) {
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "doctor":
          navigate("/doctor/dashboard", { replace: true });
          break;
        case "patient":
          navigate("/patient/dashboard", { replace: true });
          break;
        case "therapist":
          navigate("/therapy/dashboard", { replace: true });
          break;
        default:
          navigate("/login");
      }
    }
  }, [user, authLoading, navigate]);

  /* ================= LOGIN SUBMIT ================= */
  const onSubmit = async (data) => {
    try {
      clearErrors();
      await login(data.identifier, data.password);
      // redirect handled by useEffect after user set
    } catch (err) {
      setError("root", {
        type: "manual",
        message: err.response?.data?.message || "Login failed",
      });
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login integration is under development`, {
      autoClose: 2000,
    });
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-emerald-50 to-teal-100">
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* Left Side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="inline-flex items-center justify-center p-3 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg mr-3">
                  <FaLeaf className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-emerald-900">
                  AyurSutra  Welcome Back
                </h1>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                <FaHandHoldingHeart className="text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Personalized Care</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                <FaShieldAlt className="text-teal-600" />
                <span className="text-sm font-medium text-gray-700">Secure & Private</span>
              </div>
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
                className="w-full bg-linear-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-shadow"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaSignInAlt className="mr-2" />
                    Sign In to Dashboard
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
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="text-red-500 mr-2" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Facebook')}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FaFacebookF className="text-blue-600 mr-2" />
                <span>Facebook</span>
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                  Create Account
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Health Image & Content */}
          <div className="w-full lg:w-1/2 bg-linear-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-linear(circle at 25px 25px, white 2%, transparent 0%), radial-linear(circle at 75px 75px, white 2%, transparent 0%)`,
                backgroundSize: '100px 100px'
              }}></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 text-white">
              {/* Top Content */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Your Health Journey Starts Here</h3>
              </div>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center text-xl mr-4">
                    DR
                  </div>
                  <div>
                    <h4 className="font-bold">Dr. Priya Sharma</h4>
                    <p className="text-emerald-100 text-sm">Senior Ayurvedic Practitioner</p>
                  </div>
                </div>
                <p className="italic text-emerald-50">
                  "AyurSutra has transformed how we deliver personalized Ayurvedic care to our patients."
                </p>
              </div>

              {/* Image Placeholder - Replace with actual image */}
              <div className="mt-8 rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-linear-to-r from-emerald-500 to-teal-600 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <FaLeaf className="h-16 w-16 text-white mb-4 mx-auto" />
                    <p className="text-white font-medium">Holistic Health & Wellness</p>
                  </div>
                </div>
              </div>

              {/* Bottom Text */}
              <div className="mt-8 text-center">
                <p className="text-emerald-100 text-sm">
                  <span className="font-bold">5000+</span> patients trusted our platform
                  <span className="mx-2">•</span>
                  <span className="font-bold">98%</span> satisfaction rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;