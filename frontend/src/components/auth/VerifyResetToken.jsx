import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaKey, FaCheck, FaSpinner, FaArrowLeft, 
  FaClock, FaRedo, FaEnvelope, FaLock,
  FaExclamationCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import AOS from 'aos';
import 'aos/dist/aos.css';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth(); // We'll call API directly for resend
  
  // Get email from previous page
  const { email, otpSent } = location.state || {};
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds for resend
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const inputRefs = useRef([]);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  // 🔒 Protect route - redirect if no email
  useEffect(() => {
    if (!email) {
      toast.warning("Please enter your email first");
      navigate("/forgot-password");
    }
    
    // If OTP wasn't sent (account doesn't exist), show warning
    if (otpSent === false) {
      toast.warning(
        <div className="space-y-1">
          <p className="font-semibold">Email Not Found</p>
          <p className="text-sm">No account exists with this email.</p>
        </div>,
        { autoClose: 5000 }
      );
    }
  }, [email, navigate, otpSent]);

  // ⏱ Timer for resend OTP - Fixed timer logic
  useEffect(() => {
    let interval;
    
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0].focus(), 300);
    }
  }, []);

  // Format timer display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Allow only numbers
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage(""); // Clear error on new input
    
    // Auto-focus next input when a digit is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Auto-focus previous input when deleting and going back
    if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste OTP (all 6 digits at once)
  const handlePaste = (e, index) => {
    if (index !== 0) return; // Only allow paste on first input
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      
      setOtp(newOtp);
      setErrorMessage(""); // Clear error
      inputRefs.current[5]?.focus(); // Focus last input
      toast.success("✓ OTP pasted successfully!");
    } else {
      toast.warning("Please paste exactly 6 digits");
    }
  };

  // Handle keydown for navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    if (e.key === 'Enter' && index === 5) {
      handleSubmit(e);
    }
  };

  // Submit OTP for verification
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const otpValue = otp.join("");
    
    // Validate OTP length
    if (otpValue.length !== 6) {
      toast.error("❌ Please enter complete 6-digit OTP");
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage("");
      
      // Call verify OTP API
      const response = await verifyOTP(email, otpValue);
      
      // Mark as verified
      setIsVerified(true);
      
      // Show success message
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheck className="text-green-500" />
          <span className="font-medium">OTP verified successfully!</span>
        </div>,
        { autoClose: 2000 }
      );
      
      // Wait a moment then redirect to reset password
      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email,
            resetToken: response.resetToken,
            verifiedAt: new Date().toISOString()
          }
        });
      }, 1500);
      
    } catch (err) {
      // Increment failed attempts
      setAttempts(prev => prev + 1);
      
      // Get error message
      const errorData = err.response?.data;
      const attemptsLeft = 5 - attempts;
      
      if (errorData?.code === "INVALID_OTP") {
        const message = `Invalid OTP. ${attemptsLeft > 0 ? `${attemptsLeft} attempts remaining` : 'No attempts remaining'}`;
        setErrorMessage(message);
        toast.error(message);
      } else if (errorData?.code === "OTP_EXPIRED") {
        const message = "OTP expired. Please request a new one.";
        setErrorMessage(message);
        toast.error(message);
        setCanResend(true); // Enable resend
      } else if (errorData?.code === "TOO_MANY_ATTEMPTS") {
        const message = errorData.message || "Too many failed attempts. Please try again later.";
        setErrorMessage(message);
        toast.error(message);
        setCanResend(true); // Enable resend
      } else {
        const message = errorData?.message || "Invalid OTP. Please try again.";
        setErrorMessage(message);
        toast.error(message);
      }
      
      // Clear OTP inputs only if it's an invalid OTP error
      if (!errorData?.code || errorData?.code === "INVALID_OTP") {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      
      // If attempts exhausted, enable resend
      if (attempts >= 4) {
        setCanResend(true);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Alternative: Using your existing api service
  const handleResendOTP = async () => {
  if (!canResend || resendLoading) return;

  try {
    setResendLoading(true);
    setErrorMessage("");

    // ✅ Use existing axios api instance
    const api = (await import("../../services/api")).default;

    const res = await api.post("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });

    if (res.data.success) {
      // Reset states
      setTimer(60);
      setCanResend(false);
      setAttempts(0);
      setOtp(["", "", "", "", "", ""]);

      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 200);

      toast.success(
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-green-500" />
          <div>
            <p className="font-medium">New OTP sent!</p>
            <p className="text-sm">Check your email inbox</p>
          </div>
        </div>,
        { autoClose: 4000 }
      );
    } else {
      toast.error(res.data.message || "Failed to resend OTP");
      setCanResend(true);
    }

  } catch (err) {
    console.error("❌ Resend OTP error:", err);

    toast.error(
      err.response?.data?.message ||
      "Network error. Please try again."
    );

    setCanResend(true);
  } finally {
    setResendLoading(false);
  }
};


  // Go back to change email
  const handleChangeEmail = () => {
    navigate("/forgot-password", {
      state: { email } // Preserve email if they want to edit
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Card */}
      <div 
        className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
        data-aos="zoom-in"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white text-center relative overflow-hidden">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
              <FaKey className="text-3xl" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
            <p className="opacity-90">Enter the 6-digit code sent to</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <FaEnvelope className="text-sm" />
              <span className="font-medium truncate max-w-[250px]">{email}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs */}
            <div data-aos="fade-up" data-aos-delay="200">
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                6-Digit Verification Code
              </label>
              
              <div className="flex justify-center gap-3 mb-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onPaste={(e) => handlePaste(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-300 
                      focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none
                      ${digit ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}
                      ${loading || resendLoading ? 'opacity-50' : ''}`}
                    disabled={loading || isVerified || resendLoading}
                  />
                ))}
              </div>
              
              {/* Error Message */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <FaExclamationCircle />
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Timer and Resend Section - FIXED */}
            <div className="text-center space-y-4" data-aos="fade-up" data-aos-delay="400">
              <div className={`flex items-center justify-center gap-2 ${canResend ? 'text-emerald-600' : 'text-gray-600'}`}>
                <FaClock className={canResend ? 'animate-pulse' : ''} />
                <span className="font-mono text-lg">{formatTime(timer)}</span>
                <span className="text-sm">
                  {canResend ? "Ready to resend" : "until you can resend"}
                </span>
              </div>
              
              {/* 🔄 RESEND BUTTON - Fixed click handler */}
              <button
                type="button"
                onClick={handleResendOTP} // Changed to direct API call
                disabled={!canResend || resendLoading || loading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  canResend && !resendLoading
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 hover:shadow-md border border-emerald-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <FaRedo className={resendLoading ? "animate-spin" : ""} />
                {resendLoading ? "Sending OTP..." : "Resend OTP"}
                {canResend && !resendLoading && (
                  <span className="ml-1 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div data-aos="fade-up" data-aos-delay="600">
              <button
                type="submit"
                disabled={loading || isVerified || resendLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3
                  ${isVerified 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                    : loading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95'
                  } ${resendLoading ? 'opacity-50' : ''}`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Verifying...
                  </>
                ) : isVerified ? (
                  <>
                    <FaCheck />
                    Verified! Redirecting...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Verify & Reset Password
                  </>
                )}
              </button>
            </div>

            {/* Back to Email */}
            <div className="text-center pt-4 border-t border-gray-100" data-aos="fade-up" data-aos-delay="800">
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={loading || resendLoading}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <FaArrowLeft />
                Use different email address
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Animation */}
      {isVerified && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm text-center animate-bounce-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-3xl text-emerald-600 animate-scale" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">✓ OTP Verified!</h3>
            <p className="text-gray-600 mb-6">Redirecting to password reset page...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyOTP;