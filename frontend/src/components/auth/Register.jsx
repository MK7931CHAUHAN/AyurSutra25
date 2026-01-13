import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaSpinner, FaGraduationCap, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useForm } from 'react-hook-form';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
    watch,
    reset,
    setError
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'patient'
    }
  });

  const password = watch('password');

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  const onSubmit = async (data) => {
  try {
    // Prepare registration payload
    const registerData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || "",
      password: data.password,
      role: data.role || "patient", // default role if not provided
    };

    // Call your registration API
    await registerAuth(registerData);

    // Success toast
    toast.success('🎉 Registration successful! Please login to continue.', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });

    // Reset form
    reset();

    // ✅ Redirect to login page (not dashboard)
    navigate('/login');
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';

    // Set form-level error (if using react-hook-form)
    setError('root.serverError', {
      type: 'server',
      message: errorMessage
    });

    // Error toast
    toast.error(`❌ ${errorMessage}`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  }
};

  // Validation messages configuration
  const validationMessages = {
    required: "This field is required",
   name: {
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters",
      },
      pattern: {
        value: /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
        message: "Name should contain only letters and spaces",
      },
    },
    email: {
      pattern: "Please enter a valid email address"
    },
    phone: {
      pattern: "Please enter a valid 10-digit phone number",
      minLength: "Phone number must be 10 digits"
    },
    password: {
      minLength: "Password must be at least 6 characters",
      pattern: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    },
    confirmPassword: {
      validate: "Passwords do not match"
    }
  };

  return (
    <div className="min-h-100 flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50 font-['Inter',sans-serif] overflow-hidden px-4">
      {/* SVG Wave Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 320">
          <path fill="#4f46e5" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#3b82f6" fillOpacity="0.2" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Horizontal Card Container */}
      <div className="w-full max-w-6xl relative z-10" data-aos="fade-up" data-aos-delay="100">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-300 hover:shadow-3xl flex flex-col md:flex-row">
          
          {/* Left Side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12">
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <FaGraduationCap className="w-8 h-8 text-white" />
              </div>
             <h3 className="text-3xl font-bold text-gray-900 mb-2 text-center lg:text-center">
               AYURSUTRA HealthCare
            </h3>

            </div>

            {/* Server Error Display */}
            {errors.root?.serverError && (
              <div 
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-fade-in"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <div className="flex items-start gap-3">
                  <FaExclamationCircle className="w-5 h-5 mt-0.5 flex shrink-0" />
                  <div>
                    <p className="font-medium mb-1">{errors.root.serverError.message}</p>
                    <p className="text-sm opacity-90">Please check your information and try again.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Preview (Only shown when form is valid) */}
            {isValid && isDirty && !errors.root?.serverError && (
              <div 
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 animate-fade-in"
                data-aos="fade-up"
                data-aos-delay="150"
              >
                <div className="flex items-start gap-3">
                  <FaCheck className="w-5 h-5 mt-0.5 flex shrink-0" />
                  <div>
                    <p className="font-medium mb-1">All fields look good! ✨</p>
                    <p className="text-sm opacity-90">You're ready to create your account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-6">
                {/* Name Input */}
                <div data-aos="fade-up" data-aos-delay="200">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className={`h-5 w-5 transition-colors ${
                        errors.name ? 'text-red-400' : 
                        watch('name') ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                      errors.name
                        ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                        : watch("name")
                        ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                        : "border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                    } transition-all duration-300 outline-none`}

                    /* ✅ Block invalid keys */
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                        "Tab",
                      ];

                      if (
                        !/^[A-Za-z\s]$/.test(e.key) &&
                        !allowedKeys.includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}

                    /* ✅ Clean paste & typing */
                    onInput={(e) => {
                      let value = e.target.value;

                      value = value.replace(/[^A-Za-z\s]/g, ""); // no numbers/special chars
                      value = value.replace(/\s+/g, " ");       // single space only
                      value = value.replace(/^\s/, "");         // no leading space

                      e.target.value = value;
                    }}

                    {...registerForm("name", {
                      required: validationMessages.required,
                      minLength: validationMessages.name.minLength,
                      pattern: validationMessages.name.pattern,
                    })}
                  />


                    {watch('name') && !errors.name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                      <FaExclamationCircle className="w-3 h-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div data-aos="fade-up" data-aos-delay="250">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className={`h-5 w-5 transition-colors ${
                        errors.email ? 'text-red-400' : 
                        watch('email') ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Email address"
                      className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                        errors.email 
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                          : watch('email') 
                            ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                            : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                      } transition-all duration-300 outline-none`}
                      {...registerForm('email', {
                        required: validationMessages.required,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: validationMessages.email.pattern
                        }
                      })}
                    />
                    {watch('email') && !errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                      <FaExclamationCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div data-aos="fade-up" data-aos-delay="260">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaPhone className={`h-5 w-5 transition-colors ${
                        errors.phone ? 'text-red-400' : 
                        watch('phone') ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone number (10 digits)"
                      className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                        errors.phone 
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                          : watch('phone') 
                            ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                            : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                      } transition-all duration-300 outline-none`}
                      {...registerForm('phone', {
                        required: validationMessages.required,
                        pattern: {
                          value: /^\d{10}$/,
                          message: validationMessages.phone.pattern
                        },
                        minLength: {
                          value: 10,
                          message: validationMessages.phone.minLength
                        },
                        maxLength: {
                          value: 10,
                          message: validationMessages.phone.pattern
                        }
                      })}
                    />
                    {watch('phone') && !errors.phone && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                      <FaExclamationCircle className="w-3 h-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div data-aos="fade-up" data-aos-delay="300">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className={`h-5 w-5 transition-colors ${
                        errors.password ? 'text-red-400' : 
                        watch('password') ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Password (min. 6 characters)"
                      className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                        errors.password 
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                          : watch('password') 
                            ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                            : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                      } transition-all duration-300 outline-none`}
                      {...registerForm('password', {
                        required: validationMessages.required,
                        minLength: {
                          value: 6,
                          message: validationMessages.password.minLength
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                          message: validationMessages.password.pattern
                        }
                      })}
                    />
                    {watch('password') && !errors.password && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                      <FaExclamationCircle className="w-3 h-3" />
                      {errors.password.message}
                    </p>
                  ) : watch('password') && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className={`text-xs flex items-center gap-1 ${/^.{6,}$/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/^.{6,}$/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        Min 6 characters
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        Uppercase letter
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        Lowercase letter
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${/\d/.test(password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${/\d/.test(password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                        Number
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div data-aos="fade-up" data-aos-delay="350">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className={`h-5 w-5 transition-colors ${
                        errors.confirmPassword ? 'text-red-400' : 
                        watch('confirmPassword') && password === watch('confirmPassword') ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm Password"
                      className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                        errors.confirmPassword 
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200' 
                          : watch('confirmPassword') && password === watch('confirmPassword')
                            ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200'
                            : 'border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200'
                      } transition-all duration-300 outline-none`}
                      {...registerForm('confirmPassword', {
                        required: validationMessages.required,
                        validate: value => 
                          value === password || validationMessages.confirmPassword.validate
                      })}
                    />
                    {watch('confirmPassword') && password === watch('confirmPassword') && !errors.confirmPassword && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <FaCheck className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                      <FaExclamationCircle className="w-3 h-3" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                  {watch('confirmPassword') && password === watch('confirmPassword') && !errors.confirmPassword && (
                    <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2 animate-fade-in">
                      <FaCheck className="w-3 h-3" />
                      Passwords match ✓
                    </p>
                  )}
                </div>
              </div>

              {/* Role Selection (Hidden for regular registration) */}
              <input type="hidden" {...registerForm('role')} value="patient" />

              {/* Terms and Conditions */}
              <div 
                className="text-sm text-gray-600"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <p className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="terms" className="leading-tight">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </p>
              </div>

              {/* Submit Button */}
              <div data-aos="fade-up" data-aos-delay="450">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full py-4 px-4 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Register Now
                        <svg 
                          className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>

              {/* Login Link */}
              <div 
                className="text-center pt-4 border-t border-gray-100"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Right Side - Image */}
          <div className="w-full md:w-1/2 relative overflow-hidden">
            <div 
              className="h-full w-full bg-linear-to-br from-blue-500 to-purple-600 relative"
              style={{
                backgroundImage: 'url(\'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1350&q=80\')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/20"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                <div data-aos="fade-up" data-aos-delay="550">
                  <h3 className="text-2xl font-bold mb-3">Welcome to AYURSUTRA</h3>
                  <p className="text-white/90 mb-6">
                    Join thousands of users who are managing their Ayurvedic practice with our comprehensive platform.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm opacity-90">Clinics</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-sm opacity-90">Patients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;