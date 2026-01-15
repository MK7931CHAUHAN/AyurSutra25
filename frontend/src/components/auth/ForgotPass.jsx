import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEnvelope, FaSpinner, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import api from "../../services/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    defaultValues: {
      email: ""
    }
  });

  const email = watch("email");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      console.log("📧 Sending OTP to:", data.email);

      // ✅ Call the API - should work without 403 now
      const response = await api.post('/auth/forgot-password', {
        email: data.email.trim().toLowerCase()
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        toast.success(
          response.data.message || '📩 OTP sent to your email',
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            theme: "colored"
          }
        );

        // ✅ Navigate to verify OTP page
        navigate('/verify-reset-token', {
          state: {
            email: data.email,
            otpSent: response.data.otpSent || false
          }
        });
      } else {
        // Handle API success: false but 200 status
        toast.warning(response.data.message || 'Unable to process request');
      }

    } catch (err) {
      console.error("❌ Forgot password error:", err);
      
      const errorData = err.response?.data;
      const statusCode = err.response?.status;
      
      // Handle specific error codes
      if (errorData?.code === "ACCOUNT_SUSPENDED") {
        toast.error(
          <div>
            <p className="font-semibold">Account Suspended</p>
            <p>{errorData.message}</p>
            <p className="text-sm mt-1">Please contact support for assistance.</p>
          </div>,
          { autoClose: 5000 }
        );
        
        setError('root.serverError', {
          type: 'server',
          message: errorData.message
        });
        
      } else if (errorData?.code === "DOCTOR_PENDING") {
        toast.warning(
          <div>
            <p className="font-semibold">Doctor Account Pending</p>
            <p>{errorData.message}</p>
            <p className="text-sm mt-1">Please wait for admin approval first.</p>
          </div>,
          { autoClose: 5000 }
        );
        
        setError('root.serverError', {
          type: 'server',
          message: errorData.message
        });
        
      } else if (statusCode === 429) {
        // Too many requests
        toast.error("Too many attempts. Please try again later.");
        
      } else if (statusCode === 403) {
        // Forbidden - but our backend shouldn't return 403 now
        toast.error("Access denied. Please contact support.");
        
      } else if (statusCode === 500) {
        toast.error("Server error. Please try again later.");
        
      } else {
        // Generic error
        const errorMessage = 
          errorData?.message || 
          err.message || 
          'Failed to send OTP. Please try again.';
        
        toast.error(errorMessage);
        
        setError('root.serverError', {
          type: 'server',
          message: errorMessage
        });
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-4">
              <FaShieldAlt className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-600 mt-2">
              Enter your email to receive a password reset OTP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 ${
                    errors.email ? 'text-red-400' : 
                    email ? 'text-emerald-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  placeholder="Enter your registered email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Server Error */}
            {errors.root?.serverError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">
                  ⚠ {errors.root.serverError.message}
                </p>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-sm">
                <span className="font-semibold">Security Note:</span> For security reasons, we don't reveal whether an email exists in our system. If the email is registered, you'll receive an OTP.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <FaArrowLeft />
                Back to Login
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              <span className="font-medium">Need help?</span> Contact support at{" "}
              <a href="mailto:support@ayursutra.com" className="text-emerald-600 hover:underline">
                support@ayursutra.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;