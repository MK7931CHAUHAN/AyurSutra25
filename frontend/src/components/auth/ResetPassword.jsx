// pages/ResetPassword.jsx - Updated version
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaLock, FaCheck, FaExclamationCircle, FaSpinner, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm({
    mode: 'onChange'
  });

  const password = watch('password');

  // Verify token on component mount
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      navigate('/forgot-password');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      
      if (response.data.success) {
        setIsTokenValid(true);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setIsTokenValid(false);
      toast.error('Invalid or expired reset token', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      await resetPassword(token, data.password);
      
      toast.success('🎉 Password reset successfully! You can now login with your new password.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      
      navigate('/login');
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please try again.';
      
      setError('root.serverError', {
        type: 'server',
        message: errorMessage
      });

      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  const validationMessages = {
    required: "This field is required",
    password: {
      minLength: "Password must be at least 6 characters",
      pattern: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    },
    confirmPassword: {
      validate: "Passwords do not match"
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new reset link.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaShieldAlt className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create New Password</h2>
            <p className="opacity-90">Set a strong password for your account</p>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 pt-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Resetting password for:</div>
                  <div>{user.name} ({user.email})</div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-6">
            {/* Server Error Display */}
            {errors.root?.serverError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <div className="flex items-start gap-3">
                  <FaExclamationCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">{errors.root.serverError.message}</p>
                    <p className="text-sm opacity-90">Please check and try again.</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className={`pl-10 pr-10 block w-full px-4 py-3 rounded-lg border ${
                      errors.password 
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                    } transition-all duration-300 outline-none`}
                    {...register('password', {
                      required: validationMessages.required,
                      minLength: {
                        value: 6,
                        message: validationMessages.password.minLength
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                        message: validationMessages.password.pattern
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <FaExclamationCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                ) : password && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className={`text-xs flex items-center gap-1 ${/^.{6,}$/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/^.{6,}$/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      Min 6 characters
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      Uppercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      Lowercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${/\d/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      Number
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className={`pl-10 pr-10 block w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword 
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                    } transition-all duration-300 outline-none`}
                    {...register('confirmPassword', {
                      required: validationMessages.required,
                      validate: value => 
                        value === password || validationMessages.confirmPassword.validate
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <FaExclamationCircle className="w-3 h-3" />
                    {errors.confirmPassword.message}
                  </p>
                ) : watch('confirmPassword') && password === watch('confirmPassword') && !errors.confirmPassword && (
                  <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
                    <FaCheck className="w-3 h-3" />
                    Passwords match ✓
                  </p>
                )}
              </div>

              {/* Security Tips */}
              <div className="text-sm text-gray-500 p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800 mb-1">🔒 Security Tips:</p>
                <ul className="space-y-1">
                  <li>• Use a unique password not used elsewhere</li>
                  <li>• Include uppercase, lowercase, numbers & symbols</li>
                  <li>• Avoid personal information in passwords</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Resetting Password...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;