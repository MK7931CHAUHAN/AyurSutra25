// import React, { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// /** 🔥 IMPORT All Sidebars & Topbars */
// import AyurSutraSidebar from "../components/admin/AdminSidebar";
// import AdminTopbar from "../components/admin/AdminTopbar";

// import DoctorSidebar from "../components/doctors/DoctorSidebar";
// import DoctorTopbar from "../components/doctors/DoctorsTopbar";

// import PatientSidebar from "../components/patients/PatientsSidebar";
// import PatientTopbar from "../components/patients/PatientsTopbar";

// import TherapySidebar from "../components/therapy/TherapySidebar";
// import TherapyTopbar from "../components/therapy/TherapyTopbar";

// const RoleLayout = () => {
//   const { user } = useAuth();
//   const [collapsed, setCollapsed] = useState(false);

//   // 🔥 Role Based Rendering (Core Logic)
//   const renderSidebar = () => {
//     switch (user?.role) {
//       case "admin": return <AyurSutraSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
//       case "doctor": return <DoctorSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
//       case "patient": return <PatientSidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
//       case "therapist": return <TherapySidebar isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />;
//       default: return null;
//     }
//   };

//   const renderTopbar = () => {
//     switch (user?.role) {
//       case "admin": return <AdminTopbar sidebarCollapsed={collapsed} />;
//       case "doctor": return <DoctorTopbar sidebarCollapsed={collapsed} />;
//       case "patient": return <PatientTopbar sidebarCollapsed={collapsed} />;
//       case "therapist": return <TherapyTopbar sidebarCollapsed={collapsed} />;
//       default: return null;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 overflow-hidden">
//       {/* Sidebar */}
//       {renderSidebar()}

//       {/* Main Area */}
//       <div className="flex flex-col flex-1">
//         {renderTopbar()}
//         <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
//           <Outlet /> {/* 👈 This loads selected page content */}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RoleLayout;

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
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Mobile पर sidebar closed रखें
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Desktop पर sidebar open रखें (expanded state)
        setSidebarOpen(true);
        setSidebarCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile के लिए toggle function
  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Desktop के लिए toggle function
  const toggleDesktopSidebar = () => {
    if (!sidebarOpen) {
      // If sidebar is closed, open it in expanded state
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    } else {
      // If sidebar is open, toggle between expanded/collapsed
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Combined toggle function for topbar button
  const handleToggleSidebar = () => {
    if (isMobile) {
      toggleMobileSidebar();
    } else {
      toggleDesktopSidebar();
    }
  };

  // Mobile पर sidebar close करने के लिए
  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Desktop पर collapse/expand करने के लिए (sidebar के अंदर के button से)
  const handleToggleCollapse = () => {
    if (isMobile) {
      closeMobileSidebar();
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // 🔥 Role Based Rendering (Core Logic)
  const renderSidebar = () => {
    const sidebarProps = {
      isCollapsed: sidebarCollapsed,
      onToggleCollapse: handleToggleCollapse,
      mobileMenuOpen: sidebarOpen,
      onCloseMobileMenu: closeMobileSidebar,
    };

    switch (user?.role) {
      case "admin": return <AyurSutraSidebar {...sidebarProps} />;
      case "doctor": return <DoctorSidebar {...sidebarProps} />;
      case "patient": return <PatientSidebar {...sidebarProps} />;
      case "therapist": return <TherapySidebar {...sidebarProps} />;
      default: return null;
    }
  };

  const renderTopbar = () => {
  const topbarProps = {
    sidebarCollapsed,
    onToggleSidebar: handleToggleSidebar,     // Desktop collapse
    onToggleMobileMenu: toggleMobileSidebar, // ✅ Mobile open/close
    isMobileMenuOpen: sidebarOpen,            // ✅ Mobile state
    isMobile,
  };

  switch (user?.role) {
    case "admin": return <AdminTopbar {...topbarProps} />;
    case "doctor": return <DoctorTopbar {...topbarProps} />;
    case "patient": return <PatientTopbar {...topbarProps} />;
    case "therapist": return <TherapyTopbar {...topbarProps} />;
    default: return null;
  }
};


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : ` ${
              sidebarOpen 
                ? sidebarCollapsed 
                  ? 'w-0'  // Collapsed width (icons only)
                  : 'w-0'  // Expanded width (icons + text)
                : 'w-0'     // Hidden
            }`
        }
        h-full flex shrink-0
      `}>
        {renderSidebar()}
      </div>

      {/* Main Content Area */}
      <div className={`
        flex flex-col flex-1
        transition-all duration-300
        ${isMobile 
          ? 'w-full' 
          : sidebarOpen 
            ? sidebarCollapsed 
              ? 'lg:ml-20'  // Collapsed margin
              : 'lg:ml-64'  // Expanded margin
            : 'lg:ml-0'     // No margin when sidebar hidden
        }
        w-full min-w-0
      `}>
        {renderTopbar()}
        
        {/* Main Content - Directly below topbar */}
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  );
};

export default RoleLayout;