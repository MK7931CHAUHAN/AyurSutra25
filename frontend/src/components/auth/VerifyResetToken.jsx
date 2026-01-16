import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaKey, FaCheck, FaSpinner, FaArrowLeft, 
  FaClock, FaRedo, FaEnvelope, FaLock,
  FaExclamationCircle, FaMobileAlt
} from "react-icons/fa";
import { toast } from "react-toastify";
import AOS from 'aos';
import 'aos/dist/aos.css';

const VerifyResetToken = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP } = useAuth();
  
  // Get email from previous page
  const { email, otpSent } = location.state || {};
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  const inputRefs = useRef([]);

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ 
      duration: 600, 
      once: true,
      disable: window.innerWidth < 768 // Disable on mobile for performance
    });
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔒 Protect route - redirect if no email
  useEffect(() => {
    if (!email) {
      toast.warning("Please enter your email first");
      navigate("/forgot-password");
    }
    
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

  // ⏱ Timer for resend OTP
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
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage("");
    
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    if (!value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste OTP (all 6 digits at once)
  const handlePaste = (e, index) => {
    if (index !== 0) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      
      setOtp(newOtp);
      setErrorMessage("");
      inputRefs.current[5]?.focus();
      
      if (isMobile) {
        // On mobile, hide keyboard after paste for better UX
        inputRefs.current[5]?.blur();
      }
      
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
    
    if (otpValue.length !== 6) {
      toast.error("❌ Please enter complete 6-digit OTP");
      // Shake animation for mobile feedback
      inputRefs.current.forEach(input => {
        if (input) {
          input.classList.add('animate-shake');
          setTimeout(() => input.classList.remove('animate-shake'), 500);
        }
      });
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage("");
      
      const response = await verifyOTP(email, otpValue);
      
      setIsVerified(true);
      
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheck className="text-green-500" />
          <span className="font-medium">OTP verified successfully!</span>
        </div>,
        { autoClose: 2000 }
      );
      
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
      setAttempts(prev => prev + 1);
      
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
        setCanResend(true);
      } else if (errorData?.code === "TOO_MANY_ATTEMPTS") {
        const message = errorData.message || "Too many failed attempts. Please try again later.";
        setErrorMessage(message);
        toast.error(message);
        setCanResend(true);
      } else {
        const message = errorData?.message || "Invalid OTP. Please try again.";
        setErrorMessage(message);
        toast.error(message);
      }
      
      if (!errorData?.code || errorData?.code === "INVALID_OTP") {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      
      if (attempts >= 4) {
        setCanResend(true);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || resendLoading) return;

    try {
      setResendLoading(true);
      setErrorMessage("");

      const api = (await import("../../services/api")).default;

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        setTimer(60);
        setCanResend(false);
        setAttempts(0);
        setOtp(["", "", "", "", "", ""]);

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
      state: { email }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 md:p-6">
      {/* Animated Background Elements - Reduced on mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {!isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </>
        )}
      </div>

      {/* Main Card */}
      <div 
        className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl w-full max-w-md overflow-hidden border border-white/20 mx-2 md:mx-0"
        data-aos={!isMobile ? "zoom-in" : ""}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white text-center relative overflow-hidden">
          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
              <FaKey className="text-2xl md:text-3xl" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Verify OTP</h2>
            <p className="opacity-90 text-sm md:text-base">Enter the 6-digit code sent to</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full max-w-[90%]">
              <FaEnvelope className="text-xs md:text-sm" />
              <span className="font-medium truncate text-sm md:text-base">{email}</span>
            </div>
            
            {/* Mobile-specific tip */}
            {isMobile && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <FaMobileAlt />
                <span>Tap boxes or paste code</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Inputs - Responsive sizing */}
            <div data-aos={!isMobile ? "fade-up" : ""} data-aos-delay={!isMobile ? "200" : ""}>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                6-Digit Verification Code
              </label>
              
              <div className="flex justify-center gap-2 md:gap-3 mb-2 px-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onPaste={(e) => handlePaste(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`
                      w-12 h-12 md:w-14 md:h-14 
                      text-center text-xl md:text-2xl font-bold 
                      border-2 rounded-lg md:rounded-xl 
                      transition-all duration-300 
                      focus:ring-2 focus:ring-emerald-400 focus:border-transparent 
                      outline-none touch-manipulation
                      ${digit ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}
                      ${loading || resendLoading ? 'opacity-50' : ''}
                      ${isMobile ? 'text-lg' : ''}
                    `}
                    disabled={loading || isVerified || resendLoading}
                    aria-label={`Digit ${index + 1} of 6`}
                  />
                ))}
              </div>
              
              {/* Mobile Paste Hint */}
              {isMobile && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Pro tip: Long press to paste all 6 digits at once
                </p>
              )}
              
              {/* Error Message */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg md:rounded-xl animate-fade-in">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <FaExclamationCircle />
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Timer and Resend Section */}
            <div className="text-center space-y-4" data-aos={!isMobile ? "fade-up" : ""} data-aos-delay={!isMobile ? "400" : ""}>
              <div className={`flex items-center justify-center gap-2 ${canResend ? 'text-emerald-600' : 'text-gray-600'} text-sm md:text-base`}>
                <FaClock className={canResend ? 'animate-pulse' : ''} />
                <span className="font-mono text-base md:text-lg">{formatTime(timer)}</span>
                <span className="text-xs md:text-sm">
                  {canResend ? "Ready to resend" : "until you can resend"}
                </span>
              </div>
              
              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendLoading || loading}
                className={`
                  inline-flex items-center gap-2 
                  px-4 py-2 md:px-5 md:py-2.5 
                  rounded-lg md:rounded-xl 
                  font-medium transition-all duration-300 
                  active:scale-95 touch-manipulation
                  ${canResend && !resendLoading
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 hover:from-emerald-200 hover:to-teal-200 hover:shadow-md border border-emerald-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
              >
                <FaRedo className={resendLoading ? "animate-spin" : ""} />
                <span className="text-sm md:text-base">
                  {resendLoading ? "Sending OTP..." : "Resend OTP"}
                </span>
                {canResend && !resendLoading && (
                  <span className="ml-1 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full hidden md:inline">
                    Ready
                  </span>
                )}
              </button>
            </div>

            {/* Submit Button */}
            <div data-aos={!isMobile ? "fade-up" : ""} data-aos-delay={!isMobile ? "600" : ""}>
              <button
                type="submit"
                disabled={loading || isVerified || resendLoading}
                className={`
                  w-full py-3 md:py-3.5 px-4 
                  rounded-lg md:rounded-xl 
                  font-semibold text-base md:text-lg 
                  transition-all duration-300 
                  flex items-center justify-center gap-3
                  touch-manipulation
                  active:scale-95
                  ${isVerified 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' 
                    : loading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                  } ${resendLoading ? 'opacity-50' : ''}
                `}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : isVerified ? (
                  <>
                    <FaCheck />
                    <span>Verified! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <FaLock />
                    <span>Verify & Reset Password</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Email */}
            <div className="text-center pt-4 border-t border-gray-100" data-aos={!isMobile ? "fade-up" : ""} data-aos-delay={!isMobile ? "800" : ""}>
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={loading || resendLoading}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 text-sm md:text-base touch-manipulation"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-sm w-full text-center animate-bounce-in">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-2xl md:text-3xl text-emerald-600 animate-scale" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">✓ OTP Verified!</h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">Redirecting to password reset page...</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
              <div className="bg-emerald-600 h-full rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for mobile optimizations */}
      <style jsx>{`
        @media (max-width: 640px) {
          input {
            font-size: 1.25rem !important;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          button, input {
            cursor: default;
          }
          
          button:active {
            opacity: 0.8;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .touch-manipulation {
          touch-action: manipulation;
        }
      `}</style>
    </div>
  );
};

export default VerifyResetToken;
