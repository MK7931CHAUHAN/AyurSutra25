import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Brain } from 'lucide-react';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 1,
      title: "AI-Powered Panchakarma Therapy Management",
      description: "Revolutionary Ayurvedic patient care with intelligent scheduling and predictive analytics",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-green-600 to-emerald-800",
      buttonText: "Explore AI Features",
      buttonColor: "bg-white text-green-700 hover:bg-gray-100"
    },
    {
      id: 2,
      title: "Intelligent Therapy Scheduling with ML",
      description: "Optimize treatment plans using machine learning algorithms for maximum patient recovery",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-amber-600 to-orange-800",
      buttonText: "View Scheduling Demo",
      buttonColor: "bg-white text-amber-700 hover:bg-gray-100"
    },
    {
      id: 3,
      title: "Comprehensive Patient Management System",
      description: "End-to-end patient tracking from consultation to post-therapy follow-up",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
      linear: "from-blue-600 to-indigo-800",
      buttonText: "Start Free Trial",
      buttonColor: "bg-white text-blue-700 hover:bg-gray-100"
    }
  ];

  // Auto slide rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleButtonClick = (action) => {
    switch(action) {
      case 'explore':
        window.location.href = '/login';
        break;
      case 'demo':
        // Open demo video or page
        window.open('https://www.youtube.com/watch?v=demo', '_blank');
        break;
      case 'trial':
        window.location.href = '/register';
        break;
      default:
        window.location.href = '/login';
    }
  };

  return (
    <section className="pt-20">
      <div className="relative overflow-hidden">
        {/* Slide Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <Slide key={slide.id} slide={slide} onButtonClick={handleButtonClick} />
          ))}
        </div>

        {/* Slide Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-8 rounded-full transition-all ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const Slide = ({ slide, onButtonClick }) => {
  const getActionType = (buttonText) => {
    if (buttonText.includes('Explore')) return 'explore';
    if (buttonText.includes('Demo')) return 'demo';
    if (buttonText.includes('Trial')) return 'trial';
    return 'explore';
  };

  return (
    <div className="w-full flex-shrink-0 relative">
      <div className={`bg-linear-to-r ${slide.linear}`}>
        <div className="container mx-auto px-4">
          <div className="min-h-[600px] flex flex-col lg:flex-row items-center">
            {/* Content */}
            <div className="lg:w-1/2 text-white py-12 lg:py-0">
              <div className="max-w-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    AI-Powered Platform
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg mb-8 text-white/90">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => onButtonClick(getActionType(slide.buttonText))}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${slide.buttonColor}`}
                  >
                    {slide.buttonText}
                  </button>
                  <button 
                    onClick={() => onButtonClick('demo')}
                    className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                  >
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="lg:w-1/2 relative">
              <div className="relative lg:absolute lg:right-0 lg:top-1/2 lg:transform lg:-translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent rounded-2xl"></div>
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-[300px] lg:h-[400px] object-cover rounded-2xl shadow-2xl"
                  />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 left-6 bg-white rounded-xl shadow-2xl p-4 max-w-xs">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">AI Accuracy</p>
                      <p className="text-xl font-bold text-gray-800">94.7%</p>
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

export default HeroSlider;