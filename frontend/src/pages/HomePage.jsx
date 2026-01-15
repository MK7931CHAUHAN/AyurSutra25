import React, { useState, useRef, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/home/layout/Navbar';
import HeroSlider from '../components/home/HeroSlider';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import AIMLSection from '../components/home/Abouts';
import DoctorsSection from '../components/home/DoctorsSection';
import Footer from '../components/home/layout/Footer';
import ChatBot from '../components/patients/chatbot/Chatbot';
import { 
  CheckCircle, 
  Star, 
  Shield, 
  Zap, 
  Award,
  MessageCircle,
  X,
  ChevronRight,
  Globe,
  Users,
  Clock
} from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Refs for scrolling
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const aiMlRef = useRef(null);
  const doctorsRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });

    // Check login status
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

    // Scroll handler for navbar background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const refs = {
      'home': homeRef,
      'features': featuresRef,
      'about': aiMlRef,
      'doctors': doctorsRef,
      'pricing': pricingRef,
      'contact': contactRef
    };

    if (refs[sectionId]?.current) {
      refs[sectionId].current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-emerald-50/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        scrollToSection={scrollToSection}
        isScrolled={isScrolled}
      />
      
      {/* Hero Section */}
      <div id="home" ref={homeRef}>
        <HeroSlider />
      </div>
      
      {/* Animated Stats Section */}
      <div data-aos="fade-up" data-aos-delay="200">
        <StatsSection />
      </div>
      
      {/* Features Section */}
      <div id="features" ref={featuresRef}>
        <FeaturesSection />
      </div>
      
      {/* AI/ML Section */}
      <div id="ai-ml" ref={aiMlRef}>
        <AIMLSection />
      </div>
      
      {/* Doctors Section */}
      <div id="doctors" ref={doctorsRef}>
        <DoctorsSection />
      </div>
      
      {/* Pricing Section */}
      <div id="pricing" ref={pricingRef} className="relative py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div 
              data-aos="fade-up"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4"
            >
              <Award className="h-4 w-4" />
              Most Popular Choice
            </div>
            
            <h2 
              data-aos="fade-up"
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            >
              Flexible <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Pricing Plans</span>
            </h2>
            <p 
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-gray-600 max-w-2xl mx-auto text-lg"
            >
              Choose the perfect plan for your clinic or hospital. All plans include 14-day free trial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              title="Basic"
              price="₹4,999"
              description="Perfect for individual practitioners"
              features={["Up to 50 patients", "Basic scheduling", "Email support", "Mobile app access", "1 user account"]}
              data-aos="zoom-in"
              data-aos-delay="200"
            />
            <PricingCard 
              title="Professional"
              price="₹9,999"
              description="Ideal for medium hospitals"
              features={["Up to 500 patients", "Advanced AI features", "Priority support", "Therapy management", "5 user accounts", "Custom reports"]}
              highlighted={true}
              data-aos="zoom-in"
              data-aos-delay="300"
            />
            <PricingCard 
              title="Enterprise"
              price="₹24,999"
              description="For large hospital chains"
              features={["Unlimited patients", "Full AI/ML suite", "24/7 phone support", "Custom integrations", "Unlimited users", "API access", "Dedicated manager"]}
              data-aos="zoom-in"
              data-aos-delay="400"
            />
          </div>

          {/* Trust Badges */}
          <div 
            data-aos="fade-up"
            data-aos-delay="500"
            className="flex flex-wrap justify-center gap-8 mt-16 pt-16 border-t border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="font-bold text-gray-800">100% Secure</div>
                <div className="text-sm text-gray-600">HIPAA Compliant</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="font-bold text-gray-800">99.9% Uptime</div>
                <div className="text-sm text-gray-600">Reliable Service</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="font-bold text-gray-800">500+ Clinics</div>
                <div className="text-sm text-gray-600">Trust Us</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact/Footer Section */}
      <div id="contact" ref={contactRef}>
        <Footer />
      </div>

      {/* ChatBot Floating Button */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-40 group"
        aria-label="Open ChatBot"
        data-aos="fade-left"
        data-aos-delay="1000"
      >
        <div className="relative">
          {showChatBot ? (
            <X className="w-7 h-7" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7" />
              {/* Pulsing Animation */}
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></span>
              {/* Notification Badge */}
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                1
              </span>
            </>
          )}
        </div>
      </button>

      {/* ChatBot Tooltip */}
      {!showChatBot && (
        <div 
          className="fixed bottom-24 right-8 bg-white text-gray-800 px-4 py-3 rounded-xl shadow-2xl z-40 animate-bounce hidden lg:block border border-emerald-100"
          data-aos="fade-left"
          data-aos-delay="1200"
        >
          <p className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600" />
            Need help? Chat with AI Assistant
          </p>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-emerald-100"></div>
        </div>
      )}

      {/* ChatBot Window */}
      {showChatBot && (
        <div 
          className="fixed bottom-28 right-8 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          <ChatBot onClose={() => setShowChatBot(false)} />
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 left-8 bg-white text-emerald-600 p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 z-40 border border-emerald-100 hidden md:block"
        aria-label="Scroll to top"
      >
        <ChevronRight className="w-6 h-6 transform -rotate-90" />
      </button>
    </div>
  );
};

// Enhanced PricingCard with auto-count animation
const PricingCard = ({ title, price, description, features, highlighted = false, ...aosProps }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <div 
      ref={cardRef}
      {...aosProps}
      className={`relative bg-white rounded-3xl shadow-xl p-8 border-2 hover:-translate-y-2 transition-all duration-500 ${
        highlighted 
          ? 'border-emerald-500 shadow-2xl scale-105' 
          : 'border-gray-100 hover:border-emerald-200'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
          Most Popular
        </div>
      )}
      
      <h3 className="text-3xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="mb-8">
        <span className="text-5xl font-bold text-gray-800">{price}</span>
        <span className="text-gray-600">/month</span>
        <p className="text-sm text-gray-500 mt-2">Billed annually</p>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={handleGetStarted}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
          highlighted 
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 hover:shadow-lg' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 hover:from-gray-100 hover:to-gray-200 hover:shadow-md'
        }`}
      >
        Start Free Trial
      </button>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        14-day free trial • No credit card required
      </p>
    </div>
  );
};

export default HomePage;