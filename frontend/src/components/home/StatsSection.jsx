import React from 'react';
import { Users, TrendingUp, Shield, Brain } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    { value: "5000+", label: "Patients Treated", icon: <Users className="h-6 w-6" /> },
    { value: "98%", label: "Success Rate", icon: <TrendingUp className="h-6 w-6" /> },
    { value: "50+", label: "Expert Doctors", icon: <Shield className="h-6 w-6" /> },
    { value: "24/7", label: "AI Support", icon: <Brain className="h-6 w-6" /> }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="flex items-center justify-center h-12 w-12 bg-linear-to-r from-green-100 to-emerald-100 rounded-lg mb-4 mx-auto">
      <div className="text-green-600">
        {stat.icon}
      </div>
    </div>
    <p className="text-3xl font-bold text-center text-gray-800 mb-2">{stat.value}</p>
    <p className="text-center text-gray-600">{stat.label}</p>
  </div>
);

export default StatsSection;