import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  HandHeart, 
  CreditCard, 
  Package,
  Shield,
  Zap,
  BarChart,
  FileText,
  Bell,
  Globe,
  Lock,
  Unlock
} from "lucide-react";

export default function Features() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });
    
    // Check login status
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleFeatureClick = (path) => {
    if (!isLoggedIn) {
      navigate("/login", { 
        state: { 
          redirectTo: path,
          message: "Please login to access this feature" 
        }
      });
    } else {
      navigate(path);
    }
  };

  const coreFeatures = [
    {
      title: "Patient Management",
      desc: "Digital patient records, Prakriti analysis, comprehensive history & real-time reports.",
      path: "/features/patient-management",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
      stats: "5,000+ Active Patients"
    },
    {
      title: "Therapy Scheduling",
      desc: "Intelligent auto-scheduling for Panchakarma therapies with interactive calendar view.",
      path: "/features/therapy-scheduling",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
      stats: "98% Schedule Accuracy"
    },
    {
      title: "Doctor Dashboard",
      desc: "AI-assisted diagnosis, personalized treatment plans, automated follow-ups & detailed reports.",
      path: "/features/doctor-dashboard",
      icon: Stethoscope,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
      stats: "200+ Doctors Online"
    },
    {
      title: "Therapist Dashboard",
      desc: "Smart session timer, digital SOP checklist & daily assigned therapies with progress tracking.",
      path: "/features/therapist-dashboard",
      icon: HandHeart,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-500",
      stats: "500+ Therapists"
    },
    {
      title: "Billing & Payments",
      desc: "Automated therapy-wise billing, GST-compliant invoices & real-time payment tracking.",
      path: "/features/billing",
      icon: CreditCard,
      color: "from-rose-500 to-red-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-red-50",
      gradient: "bg-gradient-to-br from-rose-500 to-red-500",
      stats: "₹2Cr+ Processed"
    },
    {
      title: "Inventory Management",
      desc: "Smart medicine stock tracking, expiry alerts & comprehensive supplier records.",
      path: "/features/inventory",
      icon: Package,
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-indigo-50 to-violet-50",
      gradient: "bg-gradient-to-br from-indigo-500 to-violet-500",
      stats: "10,000+ Items"
    }
  ];
  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      {/* Core Features */}
      <section className="relative py-16 auto-cols-auto md:py-35 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div 
            data-aos="fade-up"
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
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
                data-aos="fade-up"
                data-aos-delay={index * 100}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => handleFeatureClick(feature.path)}
                className={`
                  group relative ${feature.bgColor} p-8 rounded-3xl shadow-xl 
                  border border-gray-100 cursor-pointer
                  hover:shadow-2xl hover:-translate-y-2 
                  transition-all duration-500 overflow-hidden
                  ${hoveredFeature === index ? 'ring-2 ring-offset-2 ring-emerald-300' : ''}
                `}
              >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-2 h-2 bg-current rounded-full opacity-0 group-hover:opacity-30"
                      style={{
                        top: `${20 + i * 30}%`,
                        left: `${10 + i * 40}%`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    ></div>
                  ))}
                </div>

                {/* Icon with Animation */}
                <div 
                  className={`w-20 h-20 rounded-2xl ${feature.gradient} flex items-center justify-center mb-8 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                
                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.desc}
                </p>
                
                {/* Stats Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {feature.stats}
                  </span>
                </div>
                
                {/* Access Indicator */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                      <>
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">
                          Ready to Access
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                          Login Required
                        </span>
                      </>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white group-hover:bg-gray-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                    <div className={`w-8 h-8 rounded-full ${feature.gradient} flex items-center justify-center transform group-hover:translate-x-1 transition-transform`}>
                      <span className="text-white font-bold">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}