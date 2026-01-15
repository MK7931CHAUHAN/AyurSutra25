import React, { useEffect } from 'react';
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
  Globe,
  Leaf,
  Brain,
  ShieldCheck,
  TargetIcon
} from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AboutUsPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
      offset: 100
    });
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Patient First",
      description: "Every decision is made with patient well-being as the top priority",
      linear: "from-pink-500 to-rose-500",
      bg: "bg-linear-to-br from-pink-50 to-rose-50"
    },
    {
      icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Highest standards of data privacy and treatment safety",
      linear: "from-blue-500 to-cyan-500",
      bg: "bg-linear-to-br from-blue-50 to-cyan-50"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously advancing Ayurveda with modern technology",
      linear: "from-purple-500 to-violet-500",
      bg: "bg-linear-to-br from-purple-50 to-violet-50"
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making traditional therapies available to everyone",
      linear: "from-emerald-500 to-green-500",
      bg: "bg-linear-to-br from-emerald-50 to-green-50"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served", icon: Users },
    { number: "98.5%", label: "Satisfaction Rate", icon: Star },
    { number: "500+", label: "Expert Doctors", icon: TargetIcon },
    { number: "24/7", label: "Support Available", icon: Clock }
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "Started our journey to revolutionize Ayurvedic care" },
    { year: "2021", title: "AI Integration", description: "Launched first AI-powered diagnostic tool" },
    { year: "2022", title: "National Recognition", description: "Expanded to 50+ cities across India" },
    { year: "2023", title: "Global Launch", description: "Started serving patients in 10+ countries" }
  ];

  return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h3 
              data-aos="fade-up"
              className="text-5xl md:text-7xl font-black mb-6 bg-linear-to-r from-emerald-900 via-green-800 to-emerald-900 bg-clip-text text-transparent"
            >
              About AyurSutra
            </h3>
            
            <p 
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              We're bridging the gap between 5000-year-old Ayurvedic wisdom and cutting-edge 
              artificial intelligence to deliver personalized, effective healthcare.
            </p>
          </div>

          {/* Stats Cards */}
          <div 
            data-aos="fade-up"
            data-aos-delay="300"
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                data-aos="zoom-in"
                data-aos-delay={400 + index * 100}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-linear-to-br ${index === 0 ? 'from-pink-100 to-rose-100' : index === 1 ? 'from-amber-100 to-yellow-100' : index === 2 ? 'from-emerald-100 to-green-100' : 'from-blue-100 to-cyan-100'}`}>
                    <stat.icon className={`h-6 w-6 ${index === 0 ? 'text-pink-600' : index === 1 ? 'text-amber-600' : index === 2 ? 'text-emerald-600' : 'text-blue-600'}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div 
              data-aos="fade-right"
              className="relative group"
            >
              <div className="absolute -inset-4 bg-linear-to-r from-emerald-500 to-green-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                  <Target className="h-4 w-4" />
                  Our Mission
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                  Healing the World, <span className="text-emerald-600">One Patient at a Time</span>
                </h2>
                <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                  To democratize access to authentic Panchakarma therapies through intelligent 
                  technology solutions that enhance traditional Ayurvedic practices while maintaining 
                  their core principles.
                </p>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We believe in the symbiotic relationship between ancient wisdom and modern 
                  innovation to create healthcare solutions that are holistic, effective, and 
                  scalable across the globe.
                </p>
                
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-linear-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold">
                        DR
                      </div>
                    ))}
                  </div>
                  <div className="text-gray-600">
                    <div className="font-semibold">200+ Certified Practitioners</div>
                    <div className="text-sm">Working with us globally</div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              data-aos="fade-left"
              className="relative group"
            >
              <div className="absolute -inset-4 bg-linear-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
                <div className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-yellow-500 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                  <Brain className="h-4 w-4" />
                  Our Vision
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
                  Redefining Healthcare with <span className="text-amber-600">AI-Powered Ayurveda</span>
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To establish AyurSutra as the global benchmark in AI-integrated Ayurvedic healthcare, 
                  setting new standards in personalized therapy management and measurable patient outcomes 
                  across all demographics.
                </p>
                
                <div 
                  data-aos="zoom-in"
                  data-aos-delay="300"
                  className="mt-8 p-6 bg-linear-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200"
                >
                  <div className="flex items-start gap-4">
                    <Award className="h-12 w-12 text-amber-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Industry Recognition</h3>
                      <p className="text-gray-600">
                        Winner of "Most Innovative HealthTech Startup 2023" at Global Healthcare Excellence Awards
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 text-amber-500 fill-current" />
                        ))}
                        <span className="text-sm text-gray-500">(4.9/5 Rating)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 
              data-aos="fade-up"
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
            >
              Our <span className="bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Core Values</span>
            </h2>
            <p 
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-xl text-gray-600"
            >
              The principles that guide every decision, every innovation, and every patient interaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                data-aos="flip-up"
                data-aos-delay={index * 200}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg h-full">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${value.bg}`}>
                    <div className={`p-3 rounded-xl bg-linear-to-br ${value.linear}`}>
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Learn more
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-emerald-50/50 to-white">
        <div className="container mx-auto px-4 relative z-10">
          <h2 
            data-aos="fade-up"
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800"
          >
            Our <span className="text-emerald-600">Journey</span>
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-linear-to-b from-emerald-400 to-green-400 hidden lg:block"></div>
            
            <div className="space-y-12 lg:space-y-0">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                  data-aos-delay={index * 200}
                  className={`relative lg:flex ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}
                >
                  {/* Content */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className={`inline-flex items-center gap-2 ${index % 2 === 0 ? 'lg:ml-auto' : ''} bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-4`}>
                        {milestone.year}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2">
                    <div className="w-8 h-8 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;