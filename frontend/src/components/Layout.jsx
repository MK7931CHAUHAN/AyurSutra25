import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/** 🔥 IMPORT All Sidebars & Topbars */
import AyurSutraSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";

import DoctorSidebar from "../components/doctors/DoctorSidebar";
import DoctorTopbar from "../components/doctors/DoctorsTopbar";

import PatientSidebar from "../components/patients/PatientsSidebar";
import PatientTopbar from "../components/patients/PatientsTopbar";

import TherapySidebar from "../components/therapy/TherapySidebar";
import TherapyTopbar from "../components/therapy/TherapyTopbar";

const RoleLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* 🔥 Detect screen size */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 🔥 Toggle handlers */
  const toggleMobileSidebar = () => setSidebarOpen((prev) => !prev);

  const toggleDesktopSidebar = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const handleToggleSidebar = () => {
    isMobile ? toggleMobileSidebar() : toggleDesktopSidebar();
  };

  const closeMobileSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const handleToggleCollapse = () => {
    isMobile ? closeMobileSidebar() : setSidebarCollapsed((p) => !p);
  };

  /* 🔥 Role-based Sidebar */
  const renderSidebar = () => {
    const props = {
      isCollapsed: sidebarCollapsed,
      onToggleCollapse: handleToggleCollapse,
      mobileMenuOpen: sidebarOpen,
      onCloseMobileMenu: closeMobileSidebar,
    };

    switch (user?.role) {
      case "admin":
        return <AyurSutraSidebar {...props} />;
      case "doctor":
        return <DoctorSidebar {...props} />;
      case "patient":
        return <PatientSidebar {...props} />;
      case "therapist":
        return <TherapySidebar {...props} />;
      default:
        return null;
    }
  };

  /* 🔥 Role-based Topbar */
  const renderTopbar = () => {
    const props = {
      sidebarCollapsed,
      onToggleSidebar: handleToggleSidebar,
      onToggleMobileMenu: toggleMobileSidebar,
      isMobileMenuOpen: sidebarOpen,
      isMobile,
    };

    switch (user?.role) {
      case "admin":
        return <AdminTopbar {...props} />;
      case "doctor":
        return <DoctorTopbar {...props} />;
      case "patient":
        return <PatientTopbar {...props} />;
      case "therapist":
        return <TherapyTopbar {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ✅ SIDEBAR */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          bg-white transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `w-64 transform ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : sidebarOpen
              ? sidebarCollapsed
                ? "w-20"
                : "w-64"
              : "w-0"
          }
          h-full overflow-hidden
        `}
      >
        {renderSidebar()}
      </div>

      {/* ✅ MAIN CONTENT */}
      <div
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${
            isMobile
              ? "ml-0"
              : sidebarOpen
              ? sidebarCollapsed
                ? "lg:ml-0"
                : "lg:ml-0"
              : "lg:ml-0"
          }
          min-w-0
        `}
      >
        {renderTopbar()}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* ✅ MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  );
};

export default RoleLayout;
