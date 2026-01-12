// pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaEnvelope, FaCheck, FaExclamationCircle, FaSpinner, FaArrowLeft, FaShieldAlt, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch
  } = useForm({
    mode: 'onChange'
  });

  const email = watch('email');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const response = await forgotPassword(data.email);
      
      setEmailSent(true);
      setResetToken(response.token || ''); // Save token for display
      reset();
      
      toast.success('📧 Reset link sent! Please check your email.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
      
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Token copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const validationMessages = {
    required: "Email is required",
    email: {
      pattern: "Please enter a valid email address"
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <FaCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Sent!</h2>
              <p className="opacity-90">Check your inbox for reset instructions</p>
            </div>

            <div className="p-6">
              {/* Token Display (for development) */}
              {resetToken && process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaShieldAlt className="text-blue-500" />
                      <span className="font-medium text-blue-700">Development Token</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(resetToken)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold tracking-widest text-blue-600 mb-2">
                      {resetToken}
                    </div>
                    <p className="text-sm text-blue-600">Use this 6-digit code to reset password</p>
                  </div>
                  <div className="mt-3 text-center">
                    <Link
                      to={`/reset-password/${resetToken}`}
                      className="inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                    >
                      Go to Reset Page
                    </Link>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">📧 Check Your Email</h3>
                <p className="text-gray-600">
                  We've sent a password reset link with a 6-digit verification code to:
                </p>
                <p className="font-medium text-gray-800 mt-1">{email || 'your email'}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    What to do next:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Open the email from AYURSUTRA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Copy the 6-digit verification code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Click the reset link or enter code manually</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>Create your new password</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                  <h4 className="font-medium text-yellow-800 mb-2">Didn't receive the email?</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait 1-2 minutes and check again</li>
                    <li>• Add noreply@ayursutra.com to your contacts</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    reset();
                  }}
                  className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Try Another Email
                </button>
                
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FaArrowLeft />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaEnvelope className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
            <p className="opacity-90">Enter your email to receive reset instructions</p>
          </div>

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
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className={`pl-10 block w-full px-4 py-3 rounded-lg border ${
                      errors.email 
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                    } transition-all duration-300 outline-none`}
                    {...register('email', {
                      required: validationMessages.required,
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: validationMessages.email.pattern
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <FaExclamationCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-700 mb-1">ℹ️ How it works:</p>
                <ul className="space-y-1">
                  <li>• Enter your registered email address</li>
                  <li>• We'll send a 6-digit verification code to your email</li>
                  <li>• Use the code to reset your password</li>
                  <li>• The code expires in 10 minutes</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Instructions'
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

export default ForgotPassword;