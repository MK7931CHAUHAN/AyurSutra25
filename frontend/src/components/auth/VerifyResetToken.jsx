// pages/VerifyResetToken.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaKey, FaCheck, FaTimes, FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const VerifyResetToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [user, setUser] = useState(null);
  const [enteredToken, setEnteredToken] = useState(token || '');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async (tokenToVerify) => {
    try {
      setLoading(true);
      const response = await api.get(`/auth/verify-reset-token/${tokenToVerify}`);
      
      if (response.data.success) {
        setIsValid(true);
        setUser(response.data.user);
        toast.success('Token verified successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setIsValid(false);
      toast.error('Invalid or expired token', {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = (e) => {
    e.preventDefault();
    if (enteredToken.length === 6) {
      verifyToken(enteredToken);
    } else {
      toast.error('Please enter a valid 6-digit code', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleProceedToReset = () => {
    if (isValid && token) {
      navigate(`/reset-password/${token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <FaTimes className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
              <p className="opacity-90">This reset link is invalid or has expired</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaExclamationTriangle className="w-6 h-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-800">What happened?</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>The reset link may have expired (valid for 10 minutes only)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>The token might be incorrect or already used</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>You might have copied the link incorrectly</span>
                  </li>
                </ul>
              </div>

              {/* Manual Token Input */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FaKey className="text-blue-500" />
                  <h4 className="font-medium text-gray-800">Enter Token Manually</h4>
                </div>
                
                {!showManualInput ? (
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    I have a 6-digit token
                  </button>
                ) : (
                  <form onSubmit={handleManualTokenSubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={enteredToken}
                        onChange={(e) => setEnteredToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest font-bold"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enteredToken.length !== 6}
                      className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify Token
                    </button>
                  </form>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg text-center hover:shadow-xl transition-all duration-300"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Token Verified!</h2>
            <p className="opacity-90">You can now reset your password</p>
          </div>

          <div className="p-6">
            {/* Token Display */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold tracking-widest text-green-600 mb-2">
                  {token}
                </div>
                <p className="text-sm text-green-600">6-digit verification code</p>
                <p className="text-xs text-green-500 mt-1">Valid for 10 minutes</p>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-800 mb-2">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{user.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleProceedToReset}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Reset Password Now
              </button>
              
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaArrowLeft />
                Back to Login
              </Link>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>For security reasons, this page will expire automatically.</p>
              <p>If you didn't request this, please contact support immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetToken;