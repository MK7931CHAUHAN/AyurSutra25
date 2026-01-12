import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Star,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  BadgeCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  MessageCircle,
  Video,
  GraduationCap,
  Briefcase,
  Award,
  Clock
} from 'lucide-react';
import api from '../../services/api';

const DoctorList = ({ onDoctorUpdated, onDoctorDeleted }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    availability: '',
    experience: '',
    feeRange: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 0
  });
  
  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    department: '',
    consultationFee: '',
    experience: '',
    specialization: '',
    education: '',
    bio: '',
    location: '',
    licenseNumber: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    avgRating: 0,
    avgFee: 0
  });

  // Departments
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchStats();
    fetchDepartments();
  }, [pagination.page, filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.availability && { available: filters.availability }),
        ...(filters.experience && { minExperience: filters.experience }),
        ...(filters.feeRange && { maxFee: filters.feeRange })
      };

      const response = await api.get('/doctors', { params });
      
      setDoctors(response.data?.doctors || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 0
      }));
      
      // Update stats from API response
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctors/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/doctors/meta');
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    }
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setViewModalOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      name: doctor?.user?.name || '',
      email: doctor?.user?.email || '',
      phone: doctor?.user?.phone || '',
      photo: doctor?.user?.photo || '',
      department: doctor?.department || '',
      consultationFee: doctor?.consultationFee || '',
      experience: doctor?.experience || '',
      specialization: Array.isArray(doctor?.specialization) 
        ? doctor.specialization[0] 
        : doctor?.specialization || '',
      education: doctor?.education || '',
      bio: doctor?.user?.bio || '',
      location: doctor?.location || '',
      licenseNumber: doctor?.licenseNumber || ''
    });
    setEditModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setSelectedFileName(file.name);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await api.post("/doctors/upload-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = res.data.photo || res.data.cloudinaryUrl;

      // Update edit form
      setEditForm(prev => ({
        ...prev,
        photo: imageUrl
      }));

      // Update doctors list if editing
      if (selectedDoctor) {
        setDoctors(prev => prev.map(doc => 
          doc._id === selectedDoctor._id 
            ? { 
                ...doc, 
                user: { 
                  ...doc.user, 
                  photo: imageUrl 
                } 
              }
            : doc
        ));
      }

      alert("Image uploaded successfully!");
      e.target.value = "";
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingPhoto(false);
      setSelectedFileName('');
    }
  };

  const handleUpdateDoctor = async () => {
    try {
      const response = await api.put(`/doctors/${selectedDoctor._id}`, editForm);
      
      if (response.data.success) {
        // Update local doctors list
        setDoctors(prev => prev.map(doc => 
          doc._id === selectedDoctor._id 
            ? { 
                ...response.data.doctor,
                user: response.data.doctor.user
              }
            : doc
        ));
        
        alert("Doctor updated successfully!");
        setEditModalOpen(false);
        onDoctorUpdated?.();
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert(error.response?.data?.message || "Failed to update doctor");
    }
  };

  const handleDeleteDoctor = async () => {
    try {
      const response = await api.delete(`/doctors/${selectedDoctor._id}`);
      
      if (response.data.success) {
        setDoctors(prev => prev.filter(doc => doc._id !== selectedDoctor._id));
        setDeleteModalOpen(false);
        onDoctorDeleted?.();
        alert("Doctor deleted successfully!");
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  const handleAvailabilityToggle = async (doctorId, currentStatus) => {
    try {
      const response = await api.put(`/doctors/${doctorId}/availability`, {
        isAvailable: !currentStatus
      });
      
      if (response.data.success) {
        // Update local doctors list
        setDoctors(prev => prev.map(doc => 
          doc._id === doctorId 
            ? { ...doc, isAvailable: !currentStatus }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert("Failed to update availability");
    }
  };

  const experienceRanges = [
    { label: '0-5 years', value: '5' },
    { label: '5-10 years', value: '10' },
    { label: '10-15 years', value: '15' },
    { label: '15+ years', value: '20' }
  ];

  const feeRanges = [
    { label: 'Under $50', value: '50' },
    { label: '$50-$100', value: '100' },
    { label: '$100-$200', value: '200' },
    { label: '$200+', value: '500' }
  ];

  const getDoctorImage = (doctor) => {
    // First priority: doctor.user.photo (from user profile)
    if (doctor?.user?.photo) {
      return doctor.user.photo;
    }
    
    // Second priority: avatar (backward compatibility)
    if (doctor?.user?.avatar) {
      return doctor.user.avatar;
    }
    
    // Fallback: generate avatar from name
    const name = doctor?.user?.name || 'Doctor';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff&size=512`;
  };

  const getDepartmentColor = (department) => {
    const departmentColors = {
      'general': 'bg-blue-100 text-blue-800',
      'panchakarma': 'bg-purple-100 text-purple-800',
      'kayachikitsa': 'bg-green-100 text-green-800',
      'shalya': 'bg-red-100 text-red-800',
      'shalakya': 'bg-yellow-100 text-yellow-800',
      'prasuti': 'bg-pink-100 text-pink-800',
      'kaumarabhritya': 'bg-indigo-100 text-indigo-800',
      'swasthavritta': 'bg-teal-100 text-teal-800',
    };
    
    return departmentColors[department?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDepartmentName = (department) => {
    if (!department) return 'General';
    
    return department
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSpecialization = (specialization) => {
    if (!specialization) return 'General Practitioner';
    
    if (Array.isArray(specialization)) {
      return specialization.join(', ');
    }
    
    return specialization;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Search & Filter Section - Modern Card */}
      <div className="relative mb-8">
        <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Doctors
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, email, specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">All Departments</option>
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="">Any Experience</option>
                {experienceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={fetchDoctors}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Apply
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ department: '', availability: '', experience: '', feeRange: '' });
                  fetchDoctors();
                }}
                className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid - Modern Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
              <div className="flex flex-col items-center text-center">
                <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2 w-full">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map(doctor => (
            <div
              key={doctor._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-300"
            >
              {/* Top Ribbon */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all ${
                    doctor?.isAvailable
                      ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
                  }`}
                >
                  {doctor?.isAvailable ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Available
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Busy
                    </>
                  )}
                </button>
              </div>

              {/* Doctor Card Content */}
              <div className="p-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <img
                      src={getDoctorImage(doctor)}
                      alt={doctor?.user?.name || 'Doctor'}
                      className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor?.user?.name || 'Doctor')}&background=3B82F6&color=fff&size=256`;
                      }}
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(doctor.department)}`}>
                        {formatDepartmentName(doctor.department)}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    Dr. {doctor?.user?.name}
                    {doctor?.verified && (
                      <BadgeCheck className="h-5 w-5 text-blue-500 inline-block ml-1" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-3">
                    {formatSpecialization(doctor.specialization)}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900">{(doctor?.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({doctor?.totalRatings || 0} reviews)</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">${doctor?.consultationFee || 0}</div>
                    <div className="text-xs text-gray-500">Fee</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{doctor?.experience || 0}y</div>
                    <div className="text-xs text-gray-500">Exp</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-900">{doctor?.maxPatientsPerDay || 20}</div>
                    <div className="text-xs text-gray-500">Max/Day</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDoctor(doctor)}
                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditDoctor(doctor)}
                    className="hidden px-4 py-2.5 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300  items-center gap-2 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setDeleteModalOpen(true);
                    }}
                    className="hidden px-4 py-2.5 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 items-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Try adjusting your search criteria or add a new doctor to get started.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({ department: '', availability: '', experience: '', feeRange: '' });
              fetchDoctors();
            }}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Reset Filters & Refresh
          </button>
        </div>
      )}

      {/* Pagination - Modern */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> doctors
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page === 1}
                className="px-4 py-2.5 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination(prev => ({...prev, page: pageNum}))}
                    className={`min-w-[40px] h-10 rounded-xl border transition-all text-sm font-medium ${
                      pagination.page === pageNum
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2.5 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal - Enhanced */}
      {viewModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Doctor Profile
                  </span>
                  <Shield className="h-6 w-6 text-blue-500" />
                </h2>
                <p className="text-gray-500">Complete details of Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Profile & Quick Actions */}
                <div className="lg:w-1/3 space-y-6">
                  {/* Profile Card */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
                    <div className="relative mb-6">
                      <div className="relative h-48 w-48 mx-auto rounded-2xl overflow-hidden shadow-2xl">
                        <img
                          src={getDoctorImage(selectedDoctor)}
                          alt={selectedDoctor.user?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.user?.name || 'Doctor')}&background=3B82F6&color=fff&size=256`;
                          }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Dr. {selectedDoctor.user?.name}</h3>
                      <p className="text-gray-600 mb-3">{formatSpecialization(selectedDoctor.specialization)}</p>
                      <div className="inline-flex items-center gap-1 px-4 py-2 bg-white rounded-full shadow">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold">{(selectedDoctor.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-500">({selectedDoctor.totalRatings || 0} reviews)</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">${selectedDoctor.consultationFee || 0}</div>
                        <div className="text-sm text-gray-500">Consultation</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedDoctor.experience || 0}y</div>
                        <div className="text-sm text-gray-500">Experience</div>
                      </div>
                    </div>

                    {/* Doctor ID */}
                    <div className="bg-white p-4 rounded-xl mb-6">
                      <p className="text-sm text-gray-500 mb-1">Doctor ID</p>
                      <p className="font-bold text-gray-900 text-lg">{selectedDoctor.doctorId || 'N/A'}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
                        <Video className="h-5 w-5" />
                        Schedule Video Call
                      </button>
                      <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 font-medium">
                        <MessageCircle className="h-5 w-5" />
                        Send Message
                      </button>
                    </div>
                  </div>

                  {/* Availability Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      Availability
                    </h4>
                    <div className="space-y-3">
                      {selectedDoctor.availableDays?.length > 0 ? (
                        selectedDoctor.availableDays.map((day, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium">
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </span>
                            <span className="text-green-600 font-medium">
                              {selectedDoctor.workingHours?.start || '9:00'} - {selectedDoctor.workingHours?.end || '17:00'}
                            </span>
                          </div>
                        ))
                      ) : (
                        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium">{day}</span>
                            <span className="text-green-600 font-medium">9:00 AM - 5:00 PM</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:w-2/3 space-y-6">
                  {/* Contact Info Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedDoctor.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedDoctor.user?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedDoctor.location || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Activity className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDoctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {selectedDoctor.isAvailable ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Professional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Department</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDepartmentColor(selectedDoctor.department)}`}>
                            {formatDepartmentName(selectedDoctor.department)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Experience</p>
                          <p className="font-medium">{selectedDoctor.experience || 0} years</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Specialization</p>
                          <p className="font-medium">{formatSpecialization(selectedDoctor.specialization)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">License Number</p>
                          <p className="font-medium">{selectedDoctor.licenseNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Card */}
                  {selectedDoctor.user?.bio && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-500" />
                        About
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{selectedDoctor.user.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Education Card */}
                  {selectedDoctor.education && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                        Education & Qualifications
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{selectedDoctor.education}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="hidden flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Edit className="h-5 w-5" />
                Edit Profile
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal - With Photo Upload */}
      {editModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Edit Doctor Profile
                  </span>
                  <Edit className="h-6 w-6 text-emerald-600" />
                </h2>
                <p className="text-gray-500">Update details for Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Photo Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={editForm.photo || getDoctorImage(selectedDoctor)}
                      alt="Profile"
                      className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.name || 'Doctor')}&background=3B82F6&color=fff&size=256`;
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    {selectedFileName && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl">
                        <p className="text-green-700 text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Selected: {selectedFileName}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a new profile photo. Supported formats: JPG, PNG, WebP. Max size: 5MB.
                    </p>
                    {uploadingPhoto && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Personal Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Professional Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                      <select
                        value={editForm.department}
                        onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept, idx) => (
                          <option key={idx} value={dept.value}>{dept.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter specialization"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($) *</label>
                        <input
                          type="number"
                          value={editForm.consultationFee}
                          onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter fee"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          value={editForm.experience}
                          onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter years"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter a brief bio"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education & Qualifications</label>
                  <textarea
                    value={editForm.education}
                    onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter education details and qualifications"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleUpdateDoctor}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delete Doctor</h3>
              <p className="text-gray-600 mb-2">
                Are you sure you want to permanently delete Dr. {selectedDoctor.user?.name}?
              </p>
              <p className="text-red-500 text-sm mb-8">
                This will remove all doctor data including appointments, ratings, and history.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDoctor}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;