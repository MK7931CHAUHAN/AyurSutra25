import React from 'react';
import { Activity, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { FaLeaf } from 'react-icons/fa';

const Navbar = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  isLoggedIn, 
  setIsLoggedIn,
  scrollToSection 
}) => {
  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
   
    { name: 'Doctors', id: 'doctors' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (scrollToSection) {
      scrollToSection(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="relative">
              <div className="inline-flex items-center justify-center p-3 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg mr-3">
                  <FaLeaf className="h-8 w-8 text-white" />
                </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-green-700 to-emerald-800 bg-clip-text text-transparent">
                AyurSutra
              </h1>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleNavClick(link.id, e)}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ))}
            
            {/* Login/Dashboard Button */}
            {isLoggedIn ? (
              <button
                onClick={() => window.location.href = '/admin'}
                className="flex items-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Activity className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleNavClick(link.id, e)}
                className="block w-full text-left text-gray-700 hover:text-green-600 font-medium"
              >
                {link.name}
              </button>
            ))}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  window.location.href = '/admin';
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <Activity className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  handleLogin();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;