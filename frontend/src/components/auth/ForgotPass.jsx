import { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { FaEnvelope, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({ mode: 'onChange' });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // ✅ Backend may or may not return userId — we DON'T care
      await forgotPassword(data.email);

      toast.success('📩 OTP sent to your email (if account exists)', {
        position: "top-right",
        autoClose: 3000
      });

      // ✅ ALWAYS go to verify OTP
      navigate('/verify-reset-token', {
        state: {
          email: data.email
        }
      });

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to send OTP. Please try again.';

      setError('root.serverError', {
        type: 'server',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* HEADER */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-4">
              <FaEnvelope className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
            <p className="opacity-90">Enter your email to receive OTP</p>
          </div>

          <div className="p-6">

            {/* SERVER ERROR */}
            {errors.root?.serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <div className="flex gap-2">
                  <FaExclamationCircle />
                  <p>{errors.root.serverError.message}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                      errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    } focus:ring-2 focus:ring-blue-200 outline-none`}
                    {...register('email', {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@gmail\.com$/i,
                        message: "Only Gmail addresses are allowed"
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationCircle />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* INFO */}
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                <ul className="space-y-1">
                  <li>• OTP will be sent if email exists</li>
                  <li>• OTP valid for 10 minutes</li>
                  <li>• Do not refresh the page</li>
                </ul>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              {/* BACK TO LOGIN */}
              <p className="text-center text-sm text-gray-600">
                Remember password?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Login
                </button>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
