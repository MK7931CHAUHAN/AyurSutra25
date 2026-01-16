import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm({ mode: 'onChange' });
  const password = watch('password', '');

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect if email or resetToken is missing
  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, resetToken, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await resetPassword(email, resetToken, data.password);

      toast.success('✅ Password reset successful!', { 
        position: isMobile ? "top-center" : "top-right", 
        autoClose: 3000 
      });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Password reset successful. Please login with your new password.', email }
        });
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError('root.serverError', { type: 'server', message: errorMessage });
      toast.error(`❌ ${errorMessage}`, {
        position: isMobile ? "top-center" : "top-right"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          
          {/* HEADER - 响应式调整 */}
          <div className="bg-linear-to-r from-purple-600 to-pink-600 p-4 sm:p-5 md:p-6 lg:p-8 text-white text-center">
            <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4`}>
              <FaLock className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Create New Password</h2>
            <p className="opacity-90 mt-1 text-xs sm:text-sm md:text-base">Choose a strong and secure password</p>
          </div>

          <div className="p-4 sm:p-5 md:p-6 lg:p-8">

            {/* OTP Verified Success Message */}
            <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start sm:items-center gap-2 sm:gap-3">
              <FaCheck className="text-green-600 mt-0.5 sm:mt-0 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-800 text-sm sm:text-base">OTP Verified Successfully</p>
                <p className="text-xs sm:text-sm text-green-700 mt-0.5">
                  Reset password for: <b className="break-all">{email}</b>
                </p>
              </div>
            </div>

            {/* Server Error */}
            {errors.root?.serverError && (
              <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex gap-2 text-red-700">
                <FaExclamationCircle className="flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base">{errors.root.serverError.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">

              {/* NEW PASSWORD */}
              <div>
                <label className="text-xs sm:text-sm md:text-base font-medium">New Password</label>
                <div className="relative mt-1 sm:mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 w-full py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base rounded-lg border bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                    {...register('password', {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters required" },
                      pattern: { 
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
                        message: "Must include uppercase, lowercase, number & special char" 
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-xs sm:text-sm md:text-base font-medium">Confirm Password</label>
                <div className="relative mt-1 sm:mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="pl-10 pr-10 w-full py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base rounded-lg border bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200"
                    {...register('confirmPassword', {
                      required: "Confirm your password",
                      validate: v => v === password || "Passwords do not match"
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 md:py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base md:text-lg font-medium"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            {/* Back to Login - 移动端优化 */}
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-purple-600 hover:text-purple-800 text-sm sm:text-base transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
