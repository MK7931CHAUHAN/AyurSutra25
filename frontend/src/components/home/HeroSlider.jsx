import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Hero() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });
  }, []);

  return (
    <section 
      className="relative bg-linear-to-br from-emerald-50 via-white to-amber-50 px-6 md:px-10 py-24 md:py-32 overflow-hidden"
      style={{
        boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.15)",
        backgroundImage: "radial-linear(at 40% 20%, rgba(167, 243, 208, 0.3) 0px, transparent 50%), radial-linear(at 80% 0%, rgba(187, 247, 208, 0.2) 0px, transparent 50%), radial-linear(at 0% 50%, rgba(217, 249, 157, 0.2) 0px, transparent 50%)"
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* LEFT CONTENT - Enhanced with animations */}
          <div className="flex flex-col gap-6 md:gap-8">

            {/* Main Heading with Gradient */}
            <h1 
              data-aos="fade-right"
              data-aos-delay="200"
              className="text-5xl md:text-7xl font-black leading-tight"
            >
              <span className="bg-linear-to-r from-emerald-900 via-green-700 to-emerald-800 bg-clip-text text-transparent">
                AyurSutra
              </span>
            </h1>
            {/* Description */}
            <p 
              data-aos="fade-right"
              data-aos-delay="400"
              className="text-gray-600 text-lg max-w-xl leading-relaxed"
            >
              Connect with certified Ayurvedic doctors, get personalized wellness plans,
              and experience holistic healing powered by AI. Your journey to balanced
              health starts here.
            </p>

            {/* Stats Cards */}
            <div 
              data-aos="fade-up"
              data-aos-delay="500"
              className="grid grid-cols-3 gap-4 mt-4"
            >
              {[
                { value: "24/7", label: "Consultation" },
                { value: "500+", label: "Experts" },
                { value: "98%", label: "Satisfaction" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="text-2xl font-bold text-emerald-700">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* BUTTONS with hover effects */}
            <div 
              data-aos="fade-up"
              data-aos-delay="600"
              className="flex flex-wrap gap-4 mt-6"
            >
              <button
                onClick={() => navigate("/consult")}
                className="group relative bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-white font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
              >
                <span className="relative z-10">Consult Now</span>
                <span className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </button>

              <button
                onClick={() => navigate("/paranaai")}
                className="group relative bg-white hover:bg-emerald-50 transition-all duration-300 border-2 border-emerald-500 text-emerald-700 font-semibold px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3"
              >
                <span className="text-xl">🧠</span>
                <span>PranaAI</span>
                <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">↗</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div 
              data-aos="fade-up"
              data-aos-delay="700"
              className="flex items-center gap-6 border-t border-emerald-100"
            >
              {["Certified Doctors", "Secure Payments", "Privacy First"].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE - Enhanced with 3D effect */}
          <div 
            data-aos="zoom-in"
            data-aos-delay="300"
            className="relative"
          >

            {/* Main Image Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-200/20 to-amber-200/20 rounded-[4rem] blur-3xl"></div>
              <img
                src="https://www.lemniska.com/Themes/WebTheme/Content/figure/lem_imghero.svg"
                alt="Ayurvedic AI Healthcare"
                className="relative w-full max-w-2xl mx-auto drop-shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 rounded-[3rem]"
                data-aos="zoom-in"
                data-aos-delay="400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation keyframes */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
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
      `}</style>
    </section>
  );
}