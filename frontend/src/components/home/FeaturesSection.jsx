import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Features() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status (you can replace this with your actual auth check)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleFeatureClick = (path) => {
    if (!isLoggedIn) {
      // Redirect to login if not authenticated
      navigate("/login", { 
        state: { 
          redirectTo: path,
          message: "Please login to access this feature" 
        }
      });
    } else {
      // Navigate to feature if logged in
      navigate(path);
    }
  };

  const handleDashboardAccess = () => {
    if (!isLoggedIn) {
      navigate("/login", { 
        state: { 
          redirectTo: "/dashboard",
          message: "Login required to access dashboard" 
        }
      });
    } else {
      navigate("/dashboard");
    }
  };

  // Feature data with icons
  const coreFeatures = [
    {
      title: "Patient Management",
      desc: "Digital patient records, Prakriti analysis, history & reports.",
      path: "/features/patient-management",
      icon: "👤",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Therapy Scheduling",
      desc: "Auto scheduling for Panchakarma therapies with calendar view.",
      path: "/features/therapy-scheduling",
      icon: "📅",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Doctor Dashboard",
      desc: "Diagnosis, treatment plans, follow-ups & reports.",
      path: "/features/doctor-dashboard",
      icon: "🩺",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Therapist Dashboard",
      desc: "Session timer, SOP checklist & daily assigned therapies.",
      path: "/features/therapist-dashboard",
      icon: "💆‍♀️",
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Billing & Payments",
      desc: "Therapy-wise billing, GST invoices & payment tracking.",
      path: "/features/billing",
      icon: "💰",
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Inventory Management",
      desc: "Medicine stock, expiry alerts & supplier records.",
      path: "/features/inventory",
      icon: "📦",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50"
    }
  ];


  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50">

      {/* 1️⃣ HERO */}
      <section className="relative py-20 text-center overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-green-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AyurSutra
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-800">Features</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete Panchakarma Patient Management & Therapy Scheduling Software
            with AI-Powered Insights
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleDashboardAccess}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Access Dashboard</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            
            <button
              onClick={() => navigate("/book-demo")}
              className="group bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg hover:shadow-xl border-2 border-emerald-200 transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>📅 Book Free Demo</span>
              <span className="group-hover:translate-x-1 transition-transform">↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2️⃣ CORE FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Core Features
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to run a modern Panchakarma clinic efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              onClick={() => handleFeatureClick(feature.path)}
              className={`
                group relative ${feature.bgColor} p-8 rounded-2xl shadow-lg 
                border border-gray-100 cursor-pointer
                hover:shadow-2xl hover:-translate-y-2 
                transition-all duration-500 overflow-hidden
              `}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${feature.color.replace('from-', 'from-').replace('to-', 'to-')}"></div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                <span className="text-3xl">{feature.icon}</span>
              </div>
              
              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.desc}
              </p>
              
              {/* Access indicator */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {!isLoggedIn ? "🔒 Login to Access" : "✅ Click to Access"}
                </span>
                <span className="w-10 h-10 rounded-full bg-white group-hover:bg-gray-100 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                  <span className="text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}