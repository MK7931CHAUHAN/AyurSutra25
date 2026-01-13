import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaKey, FaCheck, FaExclamationCircle, FaSpinner, FaArrowLeft, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  
  const { email, userId } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const pasteArray = pasteData.split('');
    const newOtp = [...otp];
    
    pasteArray.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus last input
    const lastIndex = Math.min(pasteArray.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const otpString = otp.join('');

  if (otpString.length !== 6) {
    toast.error('Please enter all 6 digits');
    return;
  }

  try {
    setLoading(true);

    const response = await verifyOTP(email, otpString);

    navigate('/reset-password', {
      state: {
        email,
        resetToken: response.resetToken
      }
    });

    toast.success('✅ OTP verified successfully!', {
      position: "top-right",
      autoClose: 3000,
    });

  } catch (err) {
    const errorMessage =
      err.response?.data?.message || 'Invalid OTP. Please try again.';

    toast.error(`❌ ${errorMessage}`);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } finally {
    setLoading(false);
  }
};


  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setResendLoading(true);
      
      await resendOTP(email);
      
      setTimer(600); // Reset timer to 10 minutes
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      toast.success('📧 New OTP sent to your email!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FaKey className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
            <p className="opacity-90">Enter 6-digit code sent to your email</p>
          </div>

          <div className="p-6">
            {/* Email Display */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-1">Code sent to:</p>
              <p className="font-medium text-gray-800 text-lg">{email}</p>
              
              {/* Timer */}
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gray-100 rounded-full">
                <FaClock className="text-gray-600" />
                <span className={`font-mono ${timer < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                  {formatTime(timer)}
                </span>
                <span className="text-sm text-gray-500">remaining</span>
              </div>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* OTP Help Text */}
                <div className="text-center text-sm text-gray-500">
                  <p>Enter the 6-digit code from your email</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-2" />
                    Verify & Continue
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600 mb-3">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendLoading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    canResend
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  {resendLoading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Sending...
                    </>
                  ) : canResend ? (
                    'Resend OTP'
                  ) : (
                    `Resend available in ${formatTime(timer)}`
                  )}
                </button>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <FaArrowLeft />
                  Use different email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;