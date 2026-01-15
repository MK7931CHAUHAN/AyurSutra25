import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { 
  FaUserMd, FaCheck, FaTimes, FaEye, 
  FaTrash, FaEdit, FaSearch, FaFilter,
  FaStar, FaPhone, FaEnvelope, FaIdCard,
  FaShieldAlt, FaCalendarCheck, FaSync,
  FaUserCheck, FaUserTimes, FaUserClock,
  FaClipboardList, FaDownload, FaBan,
  FaKey, FaUserSlash
} from "react-icons/fa";

const AdminDoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/admin/all");
      
      if (response.data.success) {
        // Ensure passwords are removed client-side too
        const safeDoctors = response.data.doctors.map(doctor => ({
          ...doctor,
          password: undefined
        }));
        
        setDoctors(safeDoctors);
        toast.success(`Loaded ${safeDoctors.length} doctors`);
      }
    } catch (error) {
      console.error("Fetch doctors error:", error);
      
      // Handle 403 Forbidden (admin not logged in)
      if (error.response?.status === 403) {
        toast.error("Access denied. Please login as admin.");
        // Redirect to login or show login modal
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to load doctors");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending doctors only
  const fetchPendingDoctors = async () => {
    try {
      const response = await api.get("/auth/admin/pending");
      if (response.data.success) {
        return response.data.doctors;
      }
    } catch (error) {
      console.error("Fetch pending error:", error);
      toast.error("Failed to load pending doctors");
    }
    return [];
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search and tab
  useEffect(() => {
    let result = doctors.filter(doctor => {
      const matchesSearch = 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone?.includes(searchTerm) ||
        doctor.medicalRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.doctorLicenseId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab = activeTab === "all" 
        ? true 
        : doctor.status === activeTab;
      
      return matchesSearch && matchesTab && !doctor.isDeleted;
    });

    // Sort by status priority and date
    result.sort((a, b) => {
      const statusOrder = { pending: 1, active: 2, rejected: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredDoctors(result);
  }, [doctors, searchTerm, activeTab]);

  // Status badge configuration
  const statusConfig = {
    pending: { 
      text: "Pending Review", 
      color: "bg-amber-100 text-amber-800 border border-amber-200",
      icon: FaUserClock,
      iconColor: "text-amber-500",
      badge: "Pending"
    },
    active: { 
      text: "Active & Verified", 
      color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      icon: FaUserCheck,
      iconColor: "text-emerald-500",
      badge: "Active"
    },
    rejected: { 
      text: "Rejected", 
      color: "bg-rose-100 text-rose-800 border border-rose-200",
      icon: FaUserTimes,
      iconColor: "text-rose-500",
      badge: "Rejected"
    }
  };

  // Tab configuration
  const tabs = [
    { key: "all", label: "All Doctors", count: doctors.length, icon: FaClipboardList },
    { key: "pending", label: "Pending", count: doctors.filter(d => d.status === "pending").length, icon: FaUserClock },
    { key: "active", label: "Active", count: doctors.filter(d => d.status === "active").length, icon: FaUserCheck },
    { key: "rejected", label: "Rejected", count: doctors.filter(d => d.status === "rejected").length, icon: FaUserTimes }
  ];

  // Handle approve doctor
  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this doctor?\nAn approval email will be sent automatically.")) return;
    
    try {
      setIsProcessing(true);
      const response = await api.put(`/auth/admin/doctors/approve/${id}`);
      
      if (response.data.success) {
        toast.success("✅ Doctor approved successfully!");
        
        // Update local state
        setDoctors(prev => prev.map(doctor => 
          doctor._id === id 
            ? { 
                ...doctor, 
                status: "active", 
                isApprovedByAdmin: true,
                isEmailVerified: true,
                approvedAt: new Date().toISOString()
              } 
            : doctor
        ));
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.message || "Failed to approve doctor");
    } finally {
      setIsProcessing(false);
    }
  };


  // Handle reject doctor
const handleReject = async (id, reason) => {
  try {
    setIsProcessing(true);

    const res = await api.put(
      `/auth/admin/doctors/reject/${id}`,
      {
        rejectionReason: reason || "Application did not meet requirements",
      }
    );

    if (res.data.success) {
      toast.success("❌ Doctor rejected & email sent");

      // ✅ Update UI state
      setDoctors(prev =>
        prev.map(d =>
          d._id === id
            ? {
                ...d,
                status: "rejected",
                isApprovedByAdmin: false,
                isActive: false,
                rejectionReason: reason,
              }
            : d
        )
      );

      // ✅ Close modal automatically
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedDoctor(null);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Reject failed");
  } finally {
    setIsProcessing(false);
  }
};


  // Handle delete doctor
const handleDelete = async (id) => {
  try {
    setIsProcessing(true);

    const res = await api.delete(`/auth/admin/doctors/${id}`);

    if (res.data.success) {
      toast.success("🗑️ Doctor deleted successfully");

      // ✅ Remove from UI
      setDoctors(prev => prev.filter(d => d._id !== id));
    }
  } catch (error) {
    console.error("DELETE ERROR:", error);
    toast.error(error.response?.data?.message || "Failed to delete doctor");
  } finally {
    setIsProcessing(false);
  }
};


  // View doctor details
  const viewDoctorDetails = (doctor) => {
    // Ensure password is not included
    const { password, ...safeDoctor } = doctor;
    setSelectedDoctor(safeDoctor);
    setShowModal(true);
  };

  // Export doctors data (CSV format)
  const exportDoctors = () => {
    // Remove sensitive data
    const safeDoctors = doctors.map(({ 
      password, 
      passwordResetToken, 
      passwordResetExpires, 
      ...rest 
    }) => rest);
    
    // Convert to CSV
    const headers = ["Name", "Email", "Phone", "Status", "Registration Number", "License ID", "Created At"];
    const csvRows = [
      headers.join(','),
      ...safeDoctors.map(d => [
        `"${d.name || ''}"`,
        `"${d.email || ''}"`,
        `"${d.phone || ''}"`,
        `"${d.status || ''}"`,
        `"${d.medicalRegistrationNumber || ''}"`,
        `"${d.doctorLicenseId || ''}"`,
        `"${d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctors_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("📥 Doctors exported as CSV!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <FaUserMd className="text-emerald-600" />
              Doctor Management
            </h1>
            <p className="text-gray-600 mt-2">Manage doctor registrations and approvals</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => fetchPendingDoctors().then(pending => {
                setDoctors(prev => [...prev.filter(d => d.status !== 'pending'), ...pending]);
                setActiveTab('pending');
              })}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
            >
              <FaSync />
              Refresh Pending
            </button>
            
            <button
              onClick={exportDoctors}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {tabs.map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <div 
                key={tabItem.key}
                className={`bg-white rounded-xl p-4 shadow-sm border ${activeTab === tabItem.key ? 'border-emerald-300 shadow-md' : 'border-gray-200'} hover:shadow-md transition-all cursor-pointer`}
                onClick={() => setActiveTab(tabItem.key)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{tabItem.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{tabItem.count}</p>
                  </div>
                  <Icon className={`text-2xl ${activeTab === tabItem.key ? 'text-emerald-500' : 'text-gray-400'}`} />
                </div>
                {tabItem.count > 0 && (
                  <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${activeTab === tabItem.key ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name, email, phone, registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-3 rounded-xl transition-all ${activeTab === 'all' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending
            </button>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={fetchDoctors}
            disabled={loading || isProcessing}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <FaSync className={loading || isProcessing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tabItem => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.key}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tabItem.key
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={() => setActiveTab(tabItem.key)}
            >
              <Icon />
              <span>{tabItem.label}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                activeTab === tabItem.key 
                  ? "bg-emerald-700" 
                  : "bg-gray-100 text-gray-700"
              }`}>
                {tabItem.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content - Doctors Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-16">
            <FaUserMd className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No doctors found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "No doctors match your search criteria" 
                : `No ${activeTab === "all" ? "" : activeTab} doctors available`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700">Doctor</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Credentials</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Registration Date</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.map((doctor) => {
                  const StatusIcon = statusConfig[doctor.status]?.icon || FaUserClock;
                  const statusColor = statusConfig[doctor.status]?.color || "bg-gray-100 text-gray-800";
                  
                  return (
                    <tr key={doctor._id} className="hover:bg-gray-50 transition-colors">
                      {/* Doctor Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                            <FaUserMd className="text-emerald-600 text-xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{doctor.name}</p>
                            <p className="text-sm text-gray-600">Doctor ID: {doctor._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400 text-sm" />
                            <span className="text-sm">{doctor.email}</span>
                          </div>
                          {doctor.phone && (
                            <div className="flex items-center gap-2">
                              <FaPhone className="text-gray-400 text-sm" />
                              <span className="text-sm">{doctor.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="p-4">
                        <div className="space-y-2">
                          {doctor.medicalRegistrationNumber && (
                            <div className="flex items-center gap-2">
                              <FaIdCard className="text-blue-500" />
                              <span className="text-xs font-mono bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                {doctor.medicalRegistrationNumber}
                              </span>
                            </div>
                          )}
                          {doctor.doctorLicenseId && (
                            <div className="flex items-center gap-2">
                              <FaShieldAlt className="text-purple-500" />
                              <span className="text-xs font-mono bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                {doctor.doctorLicenseId}
                              </span>
                            </div>
                          )}
                          {!doctor.medicalRegistrationNumber && !doctor.doctorLicenseId && (
                            <span className="text-xs text-gray-400 italic">No credentials</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusColor}`}>
                          <StatusIcon className={statusConfig[doctor.status]?.iconColor} />
                          <span className="font-medium text-sm">
                            {statusConfig[doctor.status]?.badge}
                          </span>
                        </div>
                        {doctor.rejectionReason && doctor.status === 'rejected' && (
                          <p className="text-xs text-rose-600 mt-1 max-w-xs truncate" title={doctor.rejectionReason}>
                            {doctor.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('en-IN') : "N/A"}
                        </div>
                        {doctor.approvedAt && (
                          <div className="text-xs text-emerald-600">
                            Approved: {new Date(doctor.approvedAt).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {/* View Button */}
                          <button
                            onClick={() => viewDoctorDetails(doctor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>

                          {/* Pending Actions */}
                          {doctor.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(doctor._id)}
                                disabled={isProcessing}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve Doctor"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDoctor(doctor);
                                  setShowRejectModal(true);
                                }}
                                disabled={isProcessing}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject Doctor"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}

                          {/* Active Actions */}
                          {doctor.status === "active" && (
                            <>
                              <button
                                onClick={() => resetDoctorPassword(doctor._id, doctor.name)}
                                disabled={isProcessing}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reset Password"
                              >
                                <FaKey />
                              </button>
                            </>
                          )}

                          {/* Delete Button (for all except active doctors) */}
                          {doctor.status !== "active" && (
                            <button
                                onClick={() => handleDelete(doctor._id)}
                                disabled={isProcessing}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Doctor"
                            >
                              <FaTrash />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Doctor"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredDoctors.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white rounded-xl shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <span className="px-3 py-1">Page 1</span>
            <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Doctor Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {/* Doctor Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg">{selectedDoctor.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      <FaUserMd />
                      <span className="font-medium">{selectedDoctor.role}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig[selectedDoctor.status]?.color}`}>
                      {(() => {
                        const IconComponent = statusConfig[selectedDoctor.status]?.icon;
                        return IconComponent ? <IconComponent className={statusConfig[selectedDoctor.status]?.iconColor} /> : null;
                      })()}
                      <span className="font-medium">
                        {statusConfig[selectedDoctor.status]?.text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registration Date</label>
                    <p className="text-lg">
                      {selectedDoctor.createdAt ? new Date(selectedDoctor.createdAt).toLocaleString('en-IN') : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              {(selectedDoctor.medicalRegistrationNumber || selectedDoctor.doctorLicenseId) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold mb-4">Professional Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDoctor.medicalRegistrationNumber && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FaIdCard className="text-blue-600" />
                          <span className="font-medium">Medical Registration Number</span>
                        </div>
                        <p className="font-mono text-lg bg-white p-2 rounded border">
                          {selectedDoctor.medicalRegistrationNumber}
                        </p>
                      </div>
                    )}
                    {selectedDoctor.doctorLicenseId && (
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FaShieldAlt className="text-purple-600" />
                          <span className="font-medium">License ID</span>
                        </div>
                        <p className="font-mono text-lg bg-white p-2 rounded border">
                          {selectedDoctor.doctorLicenseId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status History */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-semibold mb-4">Status History</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Account Created</span>
                    <span className="font-medium">
                      {selectedDoctor.createdAt ? new Date(selectedDoctor.createdAt).toLocaleString('en-IN') : "N/A"}
                    </span>
                  </div>
                  {selectedDoctor.approvedAt && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Approved On</span>
                      <span className="font-medium text-emerald-600">
                        {new Date(selectedDoctor.approvedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedDoctor.rejectedAt && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Rejected On</span>
                      <span className="font-medium text-rose-600">
                        {new Date(selectedDoctor.rejectedAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedDoctor.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedDoctor._id);
                        setShowModal(false);
                      }}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedDoctor.status === "active" && (
                  <button
                    onClick={() => handleReject(selectedDoctor._id, selectedDoctor.name)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50"
                  >
                    Reset Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Reject Doctor Application</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting Dr. {selectedDoctor?.name}'s application:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Incomplete documentation, credentials not verified, etc."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none h-32"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {rejectionReason.length}/500 characters
                </p>
              </div>

              <div className="flex justify-end gap-3">
               <button
                  onClick={() =>
                    handleReject(
                      selectedDoctor._id,
                      rejectionReason || "Application did not meet requirements"
                    )
                  }
                  disabled={isProcessing}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorPage;