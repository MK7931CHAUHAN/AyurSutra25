import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaSpa,
  FaTachometerAlt,
  FaUserInjured,
  FaUserMd,
  FaHandHoldingMedical,
  FaCalendarCheck,
  FaPrescriptionBottleAlt,
  FaChartLine,
  FaBoxes,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaBars,
  FaChevronDown,
  FaCircle,
  FaTimes,
   
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";
const AyurSutraSidebar = ({ 
  isCollapsed,
  onCloseMobileMenu 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    AOS.init({ duration: 500, easing: "ease-in-out", once: true });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavClick = () => {
    // Mobile पर sidebar close करें
    if (window.innerWidth < 1024) {
      onCloseMobileMenu();
    }
  };

  const navItems = [
    { to: "/admin/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    {
      label: "Patients",
      icon: FaUserInjured,
      children: [
        { to: "/admin/patients/add", label: "Add Patient" },
        { to: "/admin/patients/list", label: "Patient List" },
      ],
    },
    {
      label: "Doctors & Therapists",
      icon: FaUserMd,
      children: [
        { to: "/admin/doctors/add", label: "Add Doctor" },
        { to: "/admin/doctors/list", label: "Doctor List" },
        { to: "/admin/doctors/schedule", label: "Schedule" },
        { to: "/admin/doctors/medicine-view", label: "Medicine View" },
      ],
    },
    { to: "/admin/appointments", icon: FaCalendarCheck, label: "Appointments" },
    { to: "/admin/therapy", icon: FaHandHoldingMedical, label: "Therapy Scheduling" },
    { to: "/admin/treatments", icon: FaPrescriptionBottleAlt, label: "Treatments" },
    { to: "/admin/inventory", icon: FaBoxes, label: "Inventory" },
    { to: "/admin/billing", icon: FaFileInvoiceDollar, label: "Billing" },
    { to: "/admin/reports", icon: FaChartLine, label: "Reports" },
  ];

  return (
    <div className={`h-full bg-green-900 ${isCollapsed ? 'w-10' : 'w-64'}`}>
      <aside className={`bg-green-900 text-white h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Header */}
        <div className="items-center justify-between p-4 border-b border-green-700 flex shrink-0">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaSpa /> AyurSutra
              </h1>
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex justify-center w-full">
              <FaSpa className="text-2xl" />
            </div>
          )}
        

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobileMenu}
            className="lg:hidden p-2 rounded-full hover:bg-green-800 transition-colors"
            aria-label="Close menu"
          >
            <FaTimes className="text-white" />
          </button>
        </div>

        {/* Navigation - NO SCROLLBAR */}
        <div className="flex-1 px-2 py-3 overflow-hidden hover:overflow-y-auto">
          {navItems.map((item, idx) =>
            item.children ? (
              <div key={idx}>
                {/* Parent Menu - Collapsed State */}
                {isCollapsed ? (
                  <div className="relative group">
                    <div
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center justify-center gap-3 px-3 py-2 mt-1 rounded-md cursor-pointer hover:bg-green-700 transition-colors font-medium ${
                        openDropdowns[item.label] ? "bg-green-700" : ""
                      }`}
                    >
                      <item.icon className="text-xl" />
                    </div>
                    
                    {/* Tooltip for collapsed state */}
                    <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      {item.label}
                      <div className="absolute -left-1 top-3 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-gray-900 border-transparent border-r-gray-900"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center justify-between gap-3 px-3 py-2 mt-1 rounded-md cursor-pointer hover:bg-green-700 transition-colors font-medium ${
                        openDropdowns[item.label] ? "bg-green-700" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon />
                        <span>{item.label}</span>
                      </div>
                      <FaChevronDown
                        className={`transition-transform duration-300 ${
                          openDropdowns[item.label] ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Child Links */}
                    <div
                      className={`ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300`}
                      style={{
                        maxHeight: openDropdowns[item.label] ? "500px" : "0",
                      }}
                    >
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-1 rounded-md text-base ${
                              isActive ? "bg-green-600" : "hover:bg-green-700"
                            }`
                          }
                        >
                          <FaCircle className="text-[6px]" /> 
                          {!isCollapsed && child.label}
                        </NavLink>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-lg transition ${
                      isActive ? "bg-green-700" : "hover:bg-green-700"
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                >
                  <item.icon className={isCollapsed ? "text-xl" : ""} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                    {item.label}
                    <div className="absolute -left-1 top-3 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-gray-900 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        {/* Logout button */}
        <div className="p-2 border-t border-green-700 flex shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full gap-3 px-3 py-2 rounded-md hover:bg-green-700 text-lg ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignOutAlt />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AyurSutraSidebar;