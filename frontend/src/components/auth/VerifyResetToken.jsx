import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaKey, FaCheck, FaSpinner, FaArrowLeft, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  const { email } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // 🔒 Protect route
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  // ⏱ Timer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const i = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [timer]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const copy = [...otp];
    copy[i] = val;
    setOtp(copy);
    if (val && i < 5) inputRefs.current[i + 1].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyOTP(email, otpValue);

      navigate("/reset-password", {
        state: {
          email,
          resetToken: res.resetToken,
        },
      });

      toast.success("OTP verified successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await resendOTP(email);
      setTimer(600);
      setCanResend(false);
      toast.success("New OTP sent!");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
          <FaKey className="mx-auto text-3xl mb-2" />
          <h2 className="text-2xl font-bold">Verify OTP</h2>
          <p className="opacity-90">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                maxLength="1"
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-12 h-12 border text-center text-xl rounded-lg focus:ring-2 focus:ring-green-400"
              />
            ))}
          </div>

          <button
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg flex justify-center items-center"
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Verify OTP"}
          </button>

          <div className="text-center text-sm text-gray-600">
            {canResend ? (
              <button onClick={handleResend} disabled={resendLoading}>
                Resend OTP
              </button>
            ) : (
              `Resend in ${Math.floor(timer / 60)}:${timer % 60}`
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-gray-500 flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft /> Change email
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
