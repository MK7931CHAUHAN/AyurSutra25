import React from 'react';
import { Brain, Activity, TrendingUp, Users, ArrowRight } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="h-12 w-12" />,
      title: "AI-Powered Diagnostics",
      description: "Machine learning algorithms analyze patient data for accurate Ayurvedic diagnosis",
      linear: "from-purple-500 to-pink-500"
    },
    {
      icon: <Activity className="h-12 w-12" />,
      title: "Smart Therapy Scheduling",
      description: "Intelligent scheduling system optimizes therapy sessions based on multiple parameters",
      linear: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Predictive Analytics",
      description: "Forecast patient recovery patterns and optimize treatment plans",
      linear: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: "Patient Management",
      description: "Comprehensive patient profiles with treatment history and progress tracking",
      linear: "from-amber-500 to-orange-500"
    }
  ];

  const handleLearnMore = () => {
    window.location.href = '/login';
  };

  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Key Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive Panchakarma management powered by artificial intelligence and machine learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} onLearnMore={handleLearnMore} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, onLearnMore }) => (
  <div className="group">
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <div className={`h-16 w-16 bg-linear-to-r ${feature.linear} rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
      <p className="text-gray-600 mb-6">{feature.description}</p>
      <button 
        onClick={onLearnMore}
        className="text-green-600 font-medium flex items-center group-hover:text-green-700"
      >
        Learn more
        <ArrowRight className="h-4 w-4 ml-2" />
      </button>
    </div>
  </div>
);

export default FeaturesSection;