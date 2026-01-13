import React from 'react';
import { 
  Heart, 
  Users, 
  Target, 
  Award, 
  Clock,
  Star,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

const AboutUsPage = () => {
  const teamMembers = [
    {
      name: "Dr. Anjali Sharma",
      role: "Founder & CEO",
      bio: "Ayurveda Specialist with 15+ years experience in Panchakarma therapies",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Rajesh Kumar",
      role: "CTO",
      bio: "AI/ML Expert with focus on healthcare technology solutions",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Dr. Meera Patel",
      role: "Medical Director",
      bio: "Integrative Medicine Specialist, bridging traditional and modern healthcare",
      image: "https://images.unsplash.com/photo-1594824434340-7e7dfc37c99b?w-400&h=400&fit=crop&crop=face"
    },
    {
      name: "Amit Joshi",
      role: "Head of AI Research",
      bio: "PhD in Machine Learning with healthcare applications focus",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Patient First",
      description: "Every decision is made with patient well-being as the top priority"
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Highest standards of data privacy and treatment safety"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously advancing Ayurveda with modern technology"
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making traditional therapies available to everyone"
    }
  ];

  const milestones = [
    { year: "2018", title: "Company Founded", description: "Started with vision to modernize Panchakarma" },
    { year: "2019", title: "First Clinic Partner", description: "Onboarded first Ayurveda clinic" },
    { year: "2020", title: "AI Integration", description: "Launched first ML models for therapy optimization" },
    { year: "2021", title: "1000+ Patients", description: "Successfully managed over 1000 patients" },
    { year: "2022", title: "National Recognition", description: "Awarded Best HealthTech Startup" },
    { year: "2023", title: "International Expansion", description: "Partnered with clinics in 5 countries" }
  ];

  const achievements = [
    { icon: Users, value: "10,000+", label: "Patients Helped" },
    { icon: Target, value: "95%", label: "Success Rate" },
    { icon: Clock, value: "50%", label: "Faster Recovery" },
    { icon: Star, value: "4.9/5", label: "Patient Rating" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-900 to-teal-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl text-gray-200 mb-8">
              We're revolutionizing Panchakarma therapy through artificial intelligence and modern technology, 
              while staying true to ancient Ayurvedic wisdom.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center">
                Meet Our Team <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Our Mission
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                To make Panchakarma therapies more accessible, effective, and personalized through intelligent 
                technology solutions that enhance traditional Ayurvedic practices.
              </p>
              <p className="text-gray-600">
                We believe in the power of ancient wisdom combined with modern innovation to create 
                healthcare solutions that are holistic, effective, and scalable.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Vision</h2>
              <p className="text-gray-600">
                To become the global leader in AI-powered Ayurvedic healthcare, setting new standards 
                in personalized therapy management and patient outcomes.
              </p>
              <div className="mt-8 p-6 bg-emerald-50 rounded-xl">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-emerald-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">Industry Recognition</h3>
                </div>
                <p className="text-gray-600">
                  Recognized as "Most Innovative HealthTech Startup 2023" by Healthcare Excellence Awards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                    <achievement.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{achievement.value}</div>
                  <div className="text-gray-600">{achievement.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Meet Our Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A diverse team of medical experts, technologists, and Ayurveda specialists 
              dedicated to transforming healthcare.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-800">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                  <value.icon className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-emerald-200"></div>
            
            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2 mb-4 md:mb-0 md:px-8">
                    <div className={`bg-white p-6 rounded-xl shadow-lg ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                      <div className="text-emerald-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 flex justify-center md:justify-center">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold relative z-10">
                      {index + 1}
                    </div>
                  </div>
                  <div className="md:w-1/2 md:px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 to-teal-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Us in Transforming Healthcare</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Whether you're a patient, practitioner, or partner, discover how our AI-powered platform 
            can enhance your Panchakarma experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Book a Demo
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;