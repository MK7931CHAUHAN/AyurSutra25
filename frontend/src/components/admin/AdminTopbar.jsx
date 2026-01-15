import React, { useState, useRef, useEffect } from "react";
import {
  FaUserCircle, FaBell, FaSignOutAlt, FaUser, FaSearch,
  FaEnvelope, FaExclamationCircle, FaCalendarAlt, FaUserMd, 
  FaStethoscope, FaBars, FaTimes
} from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

const AdminTopbar = ({ 
  sidebarCollapsed, 
  onToggleSidebar, 
  onToggleMobileMenu,
  isMobileMenuOpen 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Outside click handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const [notificationsRes, statsRes] = await Promise.all([
        api.get('/notifications?limit=10'),
        api.get('/notifications/stats')
      ]);

      setNotifications(notificationsRes.data.notifications);
      setUnreadCount(statsRes.data.stats.unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notifications on mount and every 30 seconds
 useEffect(() => {
  if (!user) return;
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, [user]); // 🔥 KEY FIX


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter something to search!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/search?q=${searchQuery}`);
      navigate("/admin/search-results", {
        state: { query: searchQuery, results: res.data.results },
      });
      setSuggestions([]);
    } catch (error) {
      console.log("Search error:", error);
      alert("Search failed! Check console.");
    } finally {
      setLoading(false);
    }
  };

  // Live Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) return setSuggestions([]);

    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        const all = [
          ...res.data.results.patients,
          ...res.data.results.doctors,
          ...res.data.results.appointments,
        ];
        setSuggestions(all.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Mark notification as read
  const markAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif._id === notificationId 
          ? {
              ...notif,
              recipients: notif.recipients.map(recipient => 
                recipient.user._id === user._id 
                  ? { ...recipient, read: true, readAt: new Date() }
                  : recipient
              )
            }
          : notif
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        recipients: notif.recipients.map(recipient => 
          recipient.user._id === user._id 
            ? { ...recipient, read: true, readAt: new Date() }
            : recipient
        )
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'patient_created': return <FaUser className="text-blue-500" />;
      case 'doctor_created': return <FaUserMd className="text-green-500" />;
      case 'therapy_created': return <FaStethoscope className="text-purple-500" />;
      case 'appointment_created': return <FaCalendarAlt className="text-yellow-500" />;
      case 'appointment_updated': return <FaCalendarAlt className="text-orange-500" />;
      case 'appointment_cancelled': return <FaExclamationCircle className="text-red-500" />;
      default: return <FaEnvelope className="text-gray-500" />;
    }
  };

  // Get time ago string
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id, { stopPropagation: () => {} });
    setNotificationsOpen(false);
    
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left side - Menu Toggle Button */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button (Always visible on mobile) */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-xl text-gray-700 dark:text-gray-300" />
          ) : (
            <FaBars className="text-xl text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Desktop Toggle Button (Hidden on mobile) */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars className="text-xl text-gray-700 dark:text-gray-300" />
        </button>

      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-4 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative w-full max-w-sm"
        >
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search patients, doctors, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
            focus:ring-2 focus:ring-green-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSuggestions([]);
              }}
              className="absolute right-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 top-1/2 -translate-y-1/2"
            >
              ×
            </button>
          )}
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin">⏳</span>
          )}
        </form>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="absolute bg-white dark:bg-gray-900 w-full mt-2 shadow-lg rounded-lg border dark:border-gray-800 z-50 max-w-sm">
            {suggestions.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setSearchQuery(item.fullName || item.user?.name || item.status);
                  handleSearch();
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <strong>
                  {item.fullName || item.user?.name || item.patientId}
                </strong>{" "}
                <span className="text-xs text-gray-500">
                  {item.department || item.status || ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <FaBell className="text-xl text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Notifications
                </h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/notifications')}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                  >
                    View all
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-500">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <FaBell className="mx-auto text-3xl mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notification => {
                    const recipient = notification.recipients.find(r => r.user._id === user._id);
                    const isUnread = recipient && !recipient.read;
                    
                    return (
                      <div
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                          isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-medium ${
                                isUnread 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                                {isUnread && (
                                  <button
                                    onClick={(e) => markAsRead(notification._id, e)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            {notification.triggeredBy && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                  {notification.triggeredBy.photo ? (
                                    <img 
                                      src={notification.triggeredBy.photo} 
                                      alt={notification.triggeredBy.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FaUserCircle className="w-full h-full text-gray-400" />
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  By {notification.triggeredBy.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/notifications');
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    See all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative cursor-pointer" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-green-500">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="w-full h-full text-gray-400" />
              )}
            </div>
            <p className="hidden md:block text-sm text-gray-800 dark:text-gray-200">
              {user?.name?.split(" ")[0] || "Admin"}
            </p>
            <IoChevronDown className={`hidden md:block transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 
                bg-white text-gray-700
                dark:bg-gray-900 dark:text-gray-200
                rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <p className="font-semibold">{user?.name || "Admin User"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || "admin@ayur.com"}
                </p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {user?.role?.toUpperCase() || "ADMIN"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/profile");
                }}
                className="w-full px-4 py-2 text-left cursor-pointer
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  flex gap-2 items-center"
              >
                <FaUser /> Profile
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="w-full px-4 py-2 text-left cursor-pointer
                  hover:bg-gray-100 dark:hover:bg-gray-700 
                  flex gap-2 items-center"
              >
                <FaBell /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left cursor-pointer 
                  flex gap-2 items-center
                  text-red-600 hover:bg-red-50 
                  dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;