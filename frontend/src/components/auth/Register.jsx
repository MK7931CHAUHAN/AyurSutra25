import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { 
  FaUser, FaLock, FaEnvelope, FaPhone, FaSpinner, 
  FaGraduationCap, FaCheck, FaExclamationCircle, 
  FaStethoscope, FaUserMd, FaIdCard, FaShieldAlt 
} from 'react-icons/fa';
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
    formState: { errors, isSubmitting, isValid, isDirty, isSubmitted },
    watch,
    reset,
    setError,
    trigger,
    formState
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      medicalRegistrationNumber: '',
      doctorLicenseId: ''
    }
  });

  const password = watch('password');
  const selectedRole = watch('role');
  const medicalRegistrationNumber = watch('medicalRegistrationNumber');
  const doctorLicenseId = watch('doctorLicenseId');

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    });
  }, []);

  // Trigger validation when role changes
  useEffect(() => {
    if (selectedRole === 'doctor') {
      trigger(['medicalRegistrationNumber', 'doctorLicenseId']);
    }
  }, [selectedRole, trigger]);

  const onSubmit = async (data) => {
    try {
      // Prepare registration payload
      const registerData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || "",
        password: data.password,
        role: data.role,
      };

      // Add doctor-specific fields if role is doctor
      if (data.role === 'doctor') {
        registerData.medicalRegistrationNumber = data.medicalRegistrationNumber.trim().toUpperCase();
        registerData.doctorLicenseId = data.doctorLicenseId.trim().toUpperCase();
      }

      // Call your registration API
      await registerAuth(registerData);

      // Success toast with role-specific message
      const successMessage = data.role === 'doctor' 
        ? 'Doctor registration successful! Please login to continue.' 
        : 'Registration successful! Please login to continue.';

      toast.success(successMessage, {
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

      // ✅ Redirect to login page
      navigate('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';

      // Set form-level error
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
    },
    medicalRegistrationNumber: {
      pattern: "Must be 6-20 characters: UPPERCASE letters, numbers, hyphens only",
      required: "Medical Registration Number is required for doctors"
    },
    doctorLicenseId: {
      pattern: "Must be 6-12 characters: UPPERCASE letters, numbers, hyphens only",
      required: "License ID is required for doctors"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50 font-['Inter',sans-serif] overflow-hidden px-4">
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
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <FaGraduationCap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl uppercase font-bold text-gray-900 mb-2 text-center lg:text-center">
                AYURSUTRA HealthCare
              </h3>
              <p className="text-gray-600">Register as a patient or doctor</p>
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
                    <p className="font-medium mb-1">
                      {selectedRole === 'doctor' 
                        ? 'All doctor details look good! 🩺' 
                        : 'All fields look good! ✨'}
                    </p>
                    <p className="text-sm opacity-90">You're ready to create your account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Role Selection */}
              <div data-aos="fade-up" data-aos-delay="200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Register as <span className="text-red-500">*</span>
                </label>
                 <div className="grid grid-cols-2 gap-3">
                    {/* Patient */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="patient"
                        className="sr-only"
                        {...registerForm("role")}
                      />

                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                          ${
                            selectedRole === "patient"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <FaUser
                          className={`text-sm ${
                            selectedRole === "patient" ? "text-blue-600" : "text-gray-500"
                          }`}
                        />

                        <div>
                          <p
                            className={`text-sm font-medium ${
                              selectedRole === "patient" ? "text-blue-700" : "text-gray-700"
                            }`}
                          >
                            Patient
                          </p>
                          <p className="text-xs text-gray-500">
                            Appointments & consultations
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Doctor */}
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        value="doctor"
                        className="sr-only"
                        {...registerForm("role")}
                      />

                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                          ${
                            selectedRole === "doctor"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        <FaUserMd
                          className={`text-sm ${
                            selectedRole === "doctor" ? "text-green-600" : "text-gray-500"
                          }`}
                        />

                        <div>
                          <p
                            className={`text-sm font-medium ${
                              selectedRole === "doctor" ? "text-green-700" : "text-gray-700"
                            }`}
                          >
                            Doctor
                          </p>
                          <p className="text-xs text-gray-500">
                            Medical practitioners
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
              </div>

              {/* Doctor Registration Fields - Only shown when doctor is selected */}
              {selectedRole === 'doctor' && (
                  <div className="space-y-6" data-aos="fade-up" data-aos-delay="220">
                  {/* Medical Registration Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Registration Number <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(6-20 characters, UPPERCASE, numbers, hyphen)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaIdCard className={`h-5 w-5 transition-colors ${
                          errors.medicalRegistrationNumber ? 'text-red-400' : 
                          medicalRegistrationNumber ? 'text-emerald-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        id="medicalRegistrationNumber"
                        type="text"
                        placeholder="MedRegNo"
                        className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                          errors.medicalRegistrationNumber
                            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            : medicalRegistrationNumber
                            ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                            : "border-gray-200 bg-gray-50 focus:border-green-300 focus:ring-2 focus:ring-green-200"
                        } transition-all duration-300 outline-none uppercase`}
                        
                        // Auto-convert to uppercase
                        onInput={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          // Trigger validation on input
                          trigger("medicalRegistrationNumber");
                        }}
                        
                        // Block invalid characters
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
                          
                          // Allow: A-Z, 0-9, hyphen, and allowed keys
                          if (
                            !/^[A-Z0-9-]$/.test(e.key) &&
                            !allowedKeys.includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        
                        // Clean pasted content and trigger validation
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          // Remove all non-allowed characters
                          const cleaned = pastedText.replace(/[^A-Z0-9-]/gi, '').toUpperCase();
                          e.target.value = cleaned;
                          setTimeout(() => trigger("medicalRegistrationNumber"), 0);
                        }}

                        // Trigger validation on blur
                        onBlur={() => trigger("medicalRegistrationNumber")}

                        {...registerForm("medicalRegistrationNumber", {
                          required: selectedRole === 'doctor' ? validationMessages.medicalRegistrationNumber.required : false,
                          pattern: {
                            value: /^[A-Z0-9-]{6,20}$/,
                            message: validationMessages.medicalRegistrationNumber.pattern
                          }
                        })}
                      />
                      
                      {medicalRegistrationNumber && !errors.medicalRegistrationNumber && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FaCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Show error only when field has been touched or submitted */}
                    {errors.medicalRegistrationNumber && (medicalRegistrationNumber || formState.isSubmitted) && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                        <FaExclamationCircle className="w-3 h-3" />
                        {errors.medicalRegistrationNumber.message}
                      </p>
                    )}
                    
                    {/* Show success message only when field is valid and has content */}
                    {medicalRegistrationNumber && !errors.medicalRegistrationNumber && medicalRegistrationNumber.length >= 6 && (
                      <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
                        <FaCheck className="w-3 h-3" />
                        Valid format ✓
                      </p>
                    )}
                  </div>

                  {/* License ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License ID <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">(6-12 characters, UPPERCASE, alphanumeric, hyphen)</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaShieldAlt className={`h-5 w-5 transition-colors ${
                          errors.doctorLicenseId ? 'text-red-400' : 
                          doctorLicenseId ? 'text-emerald-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        id="doctorLicenseId"
                        type="text"
                        placeholder="DoctLicID"
                        className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                          errors.doctorLicenseId
                            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            : doctorLicenseId
                            ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                            : "border-gray-200 bg-gray-50 focus:border-green-300 focus:ring-2 focus:ring-green-200"
                        } transition-all duration-300 outline-none uppercase`}
                        
                        // Auto-convert to uppercase
                        onInput={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          trigger("doctorLicenseId");
                        }}
                        
                        // Block invalid characters
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
                          
                          // Allow: A-Z, 0-9, hyphen, and allowed keys
                          if (
                            !/^[A-Z0-9-]$/.test(e.key) &&
                            !allowedKeys.includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        
                        // Clean pasted content and trigger validation
                        onPaste={(e) => {
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          // Remove all non-allowed characters
                          const cleaned = pastedText.replace(/[^A-Z0-9-]/gi, '').toUpperCase();
                          e.target.value = cleaned;
                          setTimeout(() => trigger("doctorLicenseId"), 0);
                        }}

                        // Trigger validation on blur
                        onBlur={() => trigger("doctorLicenseId")}

                        {...registerForm("doctorLicenseId", {
                          required: selectedRole === 'doctor' ? validationMessages.doctorLicenseId.required : false,
                          pattern: {
                            value: /^[A-Z0-9-]{6,12}$/,
                            message: validationMessages.doctorLicenseId.pattern
                          }
                        })}
                      />
                      
                      {doctorLicenseId && !errors.doctorLicenseId && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <FaCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Show error only when field has content or form submitted */}
                    {errors.doctorLicenseId && (doctorLicenseId || formState.isSubmitted) && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                        <FaExclamationCircle className="w-3 h-3" />
                        {errors.doctorLicenseId.message}
                      </p>
                    )}
                    
                    {/* Show success message only when field is valid and has content */}
                    {doctorLicenseId && !errors.doctorLicenseId && doctorLicenseId.length >= 6 && (
                      <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
                        <FaCheck className="w-3 h-3" />
                        Valid format ✓
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FaStethoscope className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">Doctor Verification</p>
                        <p className="text-xs text-green-700">
                          Your registration will be verified with the medical council within 24-48 hours.
                          Please ensure all details are accurate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              )}

              {/* Common Registration Fields */}
              <div className="space-y-6">
                {/* Name Input */}
                <div data-aos="fade-up" data-aos-delay="250">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
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

                      onInput={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^A-Za-z\s]/g, "");
                        value = value.replace(/\s+/g, " ");
                        value = value.replace(/^\s/, "");
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
                <div data-aos="fade-up" data-aos-delay="260">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
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
                      placeholder="Enter Gmail address"
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
                          value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                          message: "Only Gmail addresses (@gmail.com) are allowed"
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
                <div data-aos="fade-up" data-aos-delay="270">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
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
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Phone number (10 digits)"
                      maxLength={10}
                      className={`pl-12 block w-full px-4 py-3 rounded-xl border ${
                        errors.phone
                          ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                          : watch("phone")
                          ? "border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                          : "border-gray-200 bg-gray-50 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                      } transition-all duration-300 outline-none`}

                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                        ];

                        if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                          e.preventDefault();
                        }
                      }}

                      onInput={(e) => {
                        let value = e.target.value;
                        value = value.replace(/\D/g, "");
                        value = value.slice(0, 10);
                        e.target.value = value;
                      }}

                      {...registerForm("phone", {
                        required: validationMessages.required,
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Phone number must start with 6, 7, 8, or 9",
                        },
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
                <div data-aos="fade-up" data-aos-delay="280">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
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
                <div data-aos="fade-up" data-aos-delay="290">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
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

              {/* Terms and Conditions */}
              <div 
                className="text-sm text-gray-600"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className={`mt-1 rounded border ${
                      errors.terms 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-300"
                    } text-blue-600 focus:ring-blue-500 transition-colors duration-200`}
                    // Use React Hook Form's register
                    {...registerForm("terms", {
                      required: "You must agree to the terms and conditions to register"
                    })}
                  />
                  <label htmlFor="terms" className="leading-tight cursor-pointer">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium underline underline-offset-2">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium underline underline-offset-2">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                
                {/* Show error only when form is submitted or field is dirty */}
                {errors.terms && (formState.isSubmitted || formState.dirtyFields.terms) && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
                    <FaExclamationCircle className="w-3 h-3 flex shrink-0" />
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div data-aos="fade-up" data-aos-delay="310">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full py-4 px-4 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    selectedRole === 'doctor' 
                      ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        {selectedRole === 'doctor' ? 'Register as Doctor' : 'Register as Patient'}
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
                data-aos-delay="320"
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
              className="h-full w-full relative"
              style={{
                backgroundImage: selectedRole === 'doctor' 
                  ? 'url(\'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1350&q=80\')'
                  : 'url(\'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1350&q=80\')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/30"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                <div data-aos="fade-up" data-aos-delay="330">
                  <h3 className="text-2xl font-bold mb-3">
                    {selectedRole === 'doctor' ? 'Join Our Medical Community' : 'Welcome to AYURSUTRA'}
                  </h3>
                  <p className="text-white/90 mb-6">
                    {selectedRole === 'doctor' 
                      ? 'Connect with patients, manage your practice, and provide holistic Ayurvedic care.'
                      : 'Join thousands of users who are managing their Ayurvedic wellness journey with our platform.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-2xl font-bold">
                        {selectedRole === 'doctor' ? '200+' : '500+'}
                      </div>
                      <div className="text-sm opacity-90">
                        {selectedRole === 'doctor' ? 'Doctors' : 'Clinics'}
                      </div>
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
    </div>
  );
};

export default Register;
