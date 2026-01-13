import React from 'react';
import { Activity, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-linear-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-linear-to-r from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AyurSutra</h2>
                  <p className="text-gray-400">AI-Powered Panchakarma Management</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-8">
                Transforming traditional Ayurvedic therapies with cutting-edge artificial intelligence and machine learning for optimal patient care and management.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">123 Ayurveda Street, Wellness City, India</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">info@ayursutra.com</span>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div>
              <h3 className="text-xl font-bold mb-6">Find Our Centers</h3>
              <div className="bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-8">
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-green-400/30 to-emerald-600/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-white" />
                      </div>
                      <p className="font-bold text-lg">AyurSutra Headquarters</p>
                      <p className="text-gray-300">Panchakarma Therapy Centers Nationwide</p>
                    </div>
                    
                    {/* Map Markers */}
                    <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute bottom-1/4 left-1/3 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute bottom-1/3 right-1/4 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={scrollToContact}
                    className="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                  >
                    View All Centers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 AyurSutra. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button 
                onClick={() => window.open('/privacy', '_blank')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.open('/terms', '_blank')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => window.open('/ai-ethics', '_blank')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                AI Ethics
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;