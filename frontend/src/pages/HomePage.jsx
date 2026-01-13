import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/home/layout/Navbar';
import HeroSlider from '../components/home/HeroSlider';
import StatsSection from '../components/home/StatsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import AIMLSection from '../components/home/Abouts';
import DoctorsSection from '../components/home/DoctorsSection';
import Footer from '../components/home/layout/Footer';
import ChatBot from '../components/patients/chatbot/Chatbot';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  
  // Refs for scrolling
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const aiMlRef = useRef(null);
  const doctorsRef = useRef(null);
  const pricingRef = useRef(null);
  const contactRef = useRef(null);

  // Check login status from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
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
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white relative">
      <Navbar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        scrollToSection={scrollToSection}
      />
      
      {/* Add id attributes to sections */}
      <div id="home" ref={homeRef}>
        <HeroSlider />
      </div>
      
      <StatsSection />
      
      <div id="features" ref={featuresRef}>
        <FeaturesSection />
      </div>
      
      <div id="ai-ml" ref={aiMlRef}>
        <AIMLSection />
      </div>
      
      <div id="doctors" ref={doctorsRef}>
        <DoctorsSection />
      </div>
      
      {/* Pricing Section */}
      <div id="pricing" ref={pricingRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Flexible Pricing Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your clinic or hospital
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Basic"
              price="₹4,999"
              description="For small clinics"
              features={["Up to 50 patients", "Basic scheduling", "Email support", "Mobile app access"]}
            />
            <PricingCard 
              title="Professional"
              price="₹9,999"
              description="For medium hospitals"
              features={["Up to 500 patients", "Advanced AI features", "Priority support", "Therapy management"]}
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="₹24,999"
              description="For large hospitals"
              features={["Unlimited patients", "Full AI/ML suite", "24/7 phone support", "Custom integrations"]}
            />
          </div>
        </div>
      </div>
      
      <div id="contact" ref={contactRef}>
        <Footer />
      </div>

      {/* ChatBot Floating Button */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-40 group"
        aria-label="Open ChatBot"
      >
        {showChatBot ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}
      </button>

      {/* ChatBot Window */}
      {showChatBot && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
          <ChatBot onClose={() => setShowChatBot(false)} />
        </div>
      )}

      {/* ChatBot Tooltip */}
      {!showChatBot && (
        <div className="fixed bottom-20 right-6 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg z-40 animate-bounce hidden lg:block">
          <p className="text-sm font-medium">Need help? Chat with AI Assistant</p>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// Updated PricingCard component with click handler
const PricingCard = ({ title, price, description, features, highlighted = false }) => {
  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${highlighted ? 'border-green-500 transform scale-105' : 'border-gray-100'}`}>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="mb-8">
        <span className="text-5xl font-bold text-gray-800">{price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={handleGetStarted}
        className={`w-full py-3 rounded-lg font-semibold ${highlighted ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
      >
        Get Started
      </button>
    </div>
  );
};

// Add custom animation for ChatBot
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default HomePage;