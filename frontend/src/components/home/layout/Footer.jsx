import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Send, Leaf, Heart, Clock, Instagram, Facebook, Twitter, Youtube, Shield, Globe, Users } from "lucide-react";
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Message sent! We'll contact you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER WITH ANIMATION */}
        <div className="text-center mb-16" data-aos="fade-down">
        <h1 className="text-5xl font-bold text-green-800 mb-4 flex items-center justify-center gap-3">
          <Leaf className="w-10 h-10 text-green-600" />
          Connect with <span className="text-emerald-600">AyurSutra</span>
        </h1>
      </div>
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          
          {/* LEFT INFO CARDS WITH ANIMATIONS */}
          <div className="space-y-6">
            <div data-aos="fade-right" data-aos-delay="100">
              <Info 
                icon={<Phone className="w-6 h-6" />} 
                title="Call Us"
                text="+91 98765 43210"
                subtitle="Mon-Sat, 9AM-7PM"
                color="blue"
              />
            </div>
            
            <div data-aos="fade-right" data-aos-delay="200">
              <Info 
                icon={<Mail className="w-6 h-6" />} 
                title="Email Us"
                text="support@ayursutra.com"
                subtitle="Response within 24 hours"
                color="emerald"
              />
            </div>
            
            <div data-aos="fade-right" data-aos-delay="300">
              <Info 
                icon={<MapPin className="w-6 h-6" />} 
                title="Visit Us"
                text="Green Wellness Center, New Delhi"
                subtitle="Open for consultations"
                color="amber"
              />
            </div>

            {/* FEATURES SECTION */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8" data-aos="zoom-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Why Choose AyurSutra?
              </h3>
              <div className="space-y-3">
                <Feature icon={<Heart className="w-4 h-4" />} text="Certified Ayurvedic Practitioners" />
                <Feature icon={<Clock className="w-4 h-4" />} text="Personalized Treatment Plans" />
                <Feature icon={<Users className="w-4 h-4" />} text="10,000+ Happy Patients" />
                <Feature icon={<Globe className="w-4 h-4" />} text="Traditional & Modern Approaches" />
              </div>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="400">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Our Location</h3>
                <p className="text-gray-600 mb-4">Visit our wellness center for personalized consultations.</p>
              </div>
              <iframe
                className="w-full h-64"
                loading="lazy"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.987654321098!2d77.2090293!3d28.6139391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2a99b6f9fa7%3A0x83a25e55f0af1!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1629876543210!5m2!1sen!2sin"
                allowFullScreen
              />
              <div className="p-6 bg-green-50">
                <p className="text-sm text-gray-600">
                  <strong>Parking Available</strong> • Wheelchair Accessible • Metro Connectivity
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="lg:col-span-1" data-aos="fade-left" data-aos-delay="500">
            <form
              onSubmit={handleSubmit}
              className="bg-linear-to-br from-white to-emerald-50 p-8 rounded-2xl shadow-xl border border-green-100 space-y-6 h-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Send us a Message</h3>
              <p className="text-gray-600 mb-6">We'll respond within 24 hours</p>

              <Input
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <span>Your Message</span>
                  <span className="text-xs text-gray-400">(Required)</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about your wellness goals or ask a question..."
                  className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input type="checkbox" id="consent" required className="rounded" />
                <label htmlFor="consent">
                  I agree to receive Ayurvedic wellness updates from AyurSutra
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-xl flex justify-center items-center gap-3 font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* ATTRACTIVE HEALTHCARE-RELATED FOOTER */}
        <Footer />
        
      </div>
    </div>
  );
}

/* COMPONENTS */

const Info = ({ icon, title, text, subtitle, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-2xl shadow-lg transition-transform hover:scale-[1.02]`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].replace('50', '100')}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold opacity-80 mb-1">{title}</p>
          <p className="text-lg font-bold">{text}</p>
          <p className="text-sm opacity-75 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="text-green-500">{icon}</div>
    <span className="text-gray-700">{text}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 mb-2 block">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
    />
  </div>
);

const Footer = () => (
  <footer className="w-full bg-linear-to-br from-green-900 to-emerald-900 text-white rounded-3xl overflow-hidden shadow-2xl" data-aos="fade-up">
    
    {/* MAIN FOOTER CONTENT */}
    <div className="p-12">
      <div className="grid md:grid-cols-4 gap-10">
        
        {/* COMPANY INFO */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AyurSutra</h2>
              <p className="text-emerald-200 text-sm">Ancient Wisdom, Modern Wellness</p>
            </div>
          </div>
          <p className="text-emerald-100 mb-6">
            Promoting holistic health through authentic Ayurvedic practices since 2005.
          </p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="w-10 h-10 rounded-full bg-emerald-800 hover:bg-emerald-700 flex items-center justify-center transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-xl font-bold mb-6">Quick Links</h3>
          <ul className="space-y-3">
            {['Consultations', 'Treatments', 'Panchakarma', 'Yoga Therapy', 'Diet Planning'].map((item) => (
              <li key={item}>
                <a href="#" className="text-emerald-100 hover:text-white transition-colors flex items-center gap-2">
                  <Leaf className="w-3 h-3" />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* HEALTH RESOURCES */}
        <div>
          <h3 className="text-xl font-bold mb-6">Health Resources</h3>
          <ul className="space-y-3">
            {['Blog & Articles', 'Wellness Tips', 'Recipes', 'Meditation Guides', 'Research Papers'].map((item) => (
              <li key={item}>
                <a href="#" className="text-emerald-100 hover:text-white transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT & HOURS */}
        <div>
          <h3 className="text-xl font-bold mb-6">Clinic Hours</h3>
          <div className="space-y-2 text-emerald-100">
            <div className="flex justify-between">
              <span>Mon-Fri</span>
              <span>9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span>9:00 AM - 5:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span>Emergency Only</span>
            </div>
          </div>
          <div className="mt-8 p-4 bg-emerald-800 rounded-xl">
            <p className="font-semibold">Emergency Contact</p>
            <p className="text-2xl font-bold">+91 98765 43210</p>
          </div>
        </div>
      </div>

      {/* CERTIFICATION BADGES */}
      <div className="mt-12 pt-8 border-t border-emerald-700">
        <div className="flex flex-wrap gap-6 justify-center">
          {[
            { text: "AYUSH Certified", icon: Shield },
            { text: "ISO 9001:2015", icon: Shield },
            { text: "10+ Years Experience", icon: Clock },
            { text: "5000+ Patients", icon: Users }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-emerald-800 px-4 py-2 rounded-full">
              <badge.icon size={16} />
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* BOTTOM BAR */}
    <div className="bg-linear-to-r from-emerald-950 to-green-950 py-6 px-12">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-emerald-300 text-sm">
          © {new Date().getFullYear()} AyurSutra Wellness Center. All rights reserved.
        </p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="text-emerald-300 hover:text-white text-sm">Privacy Policy</a>
          <a href="#" className="text-emerald-300 hover:text-white text-sm">Terms of Service</a>
          <a href="#" className="text-emerald-300 hover:text-white text-sm">Disclaimer</a>
        </div>
      </div>
    </div>
  </footer>
);