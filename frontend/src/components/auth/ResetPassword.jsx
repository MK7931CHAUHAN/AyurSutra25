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

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm({ mode: 'onChange' });
  const password = watch('password', '');

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

      toast.success('✅ Password reset successful!', { position: "top-right", autoClose: 3000 });

      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { message: 'Password reset successful. Please login with your new password.', email }
        });
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError('root.serverError', { type: 'server', message: errorMessage });
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white text-center">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <FaLock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Create New Password</h2>
            <p className="opacity-90 mt-1">Choose a strong and secure password</p>
          </div>

          <div className="p-6">

            {/* OTP Verified Success Message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheck className="text-green-600" />
              <div>
                <p className="font-medium text-green-800">OTP Verified Successfully</p>
                <p className="text-sm text-green-700">Reset password for: <b>{email}</b></p>
              </div>
            </div>

            {/* Server Error */}
            {errors.root?.serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-red-700">
                <FaExclamationCircle />
                <p>{errors.root.serverError.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* NEW PASSWORD */}
              <div>
                <label className="text-sm font-medium">New Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none"
                    {...register('password', {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters required" },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: "Must include uppercase, lowercase, number & special char" }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative mt-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    className="pl-10 pr-10 w-full py-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none"
                    {...register('confirmPassword', {
                      required: "Confirm your password",
                      validate: v => v === password || "Passwords do not match"
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex justify-center items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
