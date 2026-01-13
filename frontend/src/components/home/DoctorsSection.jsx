import React from 'react';
import { Clock, Star, ArrowRight } from 'lucide-react';

const DoctorsSection = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Anjali Sharma",
      specialization: "Panchakarma Specialist",
      experience: "15+ years",
      rating: 4.9,
      availability: "Available Today",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Dr. Rajesh Patel",
      specialization: "Ayurvedic Diagnosis",
      experience: "12+ years",
      rating: 4.8,
      availability: "Tomorrow",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Dr. Priya Desai",
      specialization: "Therapy Planning",
      experience: "10+ years",
      rating: 4.7,
      availability: "Available Now",
      image: "https://images.unsplash.com/photo-1594824434340-7e7dfc37cabb?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const handleBookConsultation = (doctorName) => {
    // Store doctor info in localStorage or session
    sessionStorage.setItem('selectedDoctor', doctorName);
    window.location.href = '/login';
  };

  const handleViewAllDoctors = () => {
    window.location.href = '/login';
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Book Expert Doctors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with certified Panchakarma specialists and Ayurvedic doctors for personalized consultations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor} 
              onBookConsultation={handleBookConsultation}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={handleViewAllDoctors}
            className="text-green-600 font-semibold hover:text-green-700 flex items-center justify-center mx-auto"
          >
            View All Doctors
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

const DoctorCard = ({ doctor, onBookConsultation }) => (
  <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
    <div className="relative h-48 overflow-hidden">
      <img 
        src={doctor.image} 
        alt={doctor.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-green-600 font-medium">{doctor.availability}</span>
      </div>
    </div>
    
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
      <p className="text-gray-600 mb-4">{doctor.specialization}</p>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700">{doctor.experience}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span className="font-bold">{doctor.rating}</span>
          <span className="text-gray-500">/5</span>
        </div>
      </div>
      
      <button 
        onClick={() => onBookConsultation(doctor.name)}
        className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        Book Consultation
      </button>
    </div>
  </div>
);

export default DoctorsSection;