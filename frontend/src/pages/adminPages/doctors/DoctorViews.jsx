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
  Clock,
  Grid,
  List
} from 'lucide-react';
import api from '../../../services/api';

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
    limit: 8,
    total: 0,
    totalPages: 0
  });
  
  // View mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');
  
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
    licenseNumber: '',
    maxPatientsPerDay: '',
    isAvailable: true
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

      console.log("Fetching doctors with params:", params);
      const response = await api.get('/doctors', { params });
      
      console.log("API Response:", response.data);
      
      // Directly use the doctors from API - don't modify structure
      const doctorsData = response.data?.doctors || [];
      console.log("Raw doctors data:", doctorsData);
      
      setDoctors(doctorsData);
      
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: response.data?.totalPages || 0
      }));
      
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
    const res = await api.get('/doctors/meta'); // ✅ CORRECT

    console.log('Departments:', res.data.departments);

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
  console.log("Doctor object:", doctor); // 🔥 सबसे पहले देख लो

  if (!doctor || !doctor._id) {
    alert("Doctor ID missing. Refresh the page and try again.");
    return;
  }

  setSelectedDoctor(doctor);

  setEditForm({
    name: doctor.user?.name || '',
    email: doctor.user?.email || '',
    phone: doctor.user?.phone || '',
    photo: doctor.user?.photo || '',
    department: doctor.department || 'general',
    consultationFee: doctor.consultationFee ?? 0,
    experience: doctor.experience ?? 0,
    specialization: Array.isArray(doctor.specialization)
      ? doctor.specialization.join(', ')
      : '',
    education: doctor.education || '',
    bio: doctor.user?.bio || '',
    location: doctor.location || '',
    licenseNumber: doctor.licenseNumber || '',
    maxPatientsPerDay: doctor.maxPatientsPerDay ?? 20,
    isAvailable: doctor.isAvailable ?? true
  });

  setEditModalOpen(true); // ✅ boolean
};


const handleUpdateDoctor = async () => {
  try {
    const doctorId = selectedDoctor?._id;

    if (!doctorId) {
      alert("Doctor ID missing! Page refresh karke try karein.");
      return;
    }

    const updateData = {
      name: editForm.name,
      phone: editForm.phone || '',
      bio: editForm.bio || '',
      specialization: editForm.specialization
        ? editForm.specialization.split(',').map(s => s.trim())
        : [],
      department: editForm.department,
      consultationFee: Number(editForm.consultationFee) || 0,
      experience: Number(editForm.experience) || 0,
      education: editForm.education || '',
      licenseNumber: editForm.licenseNumber || '',
      maxPatientsPerDay: Number(editForm.maxPatientsPerDay) || 20,
      location: editForm.location || '',
      isAvailable: editForm.isAvailable ?? true
    };

    // ✅ SAME route as backend
    await api.put(`/doctors/${doctorId}`, updateData);

    alert("Doctor updated successfully ✅");

    setEditModalOpen(false);
    setSelectedDoctor(null);
    fetchDoctors();

  } catch (error) {
    console.error("Update error:", error);
    alert(error.response?.data?.message || "Doctor update failed");
  }
};


const handleDeleteDoctor = async () => {
  try {
    const doctorId = selectedDoctor?._id;

    if (!doctorId) {
      alert("Doctor ID missing!");
      return;
    }

    await api.delete(`/doctors/${selectedDoctor._id}`);

    alert("Doctor deleted successfully!");

    setDeleteModalOpen(false);
    setSelectedDoctor(null);

    // 🔥 दुबारा पूरी list लाओ
    await fetchDoctors();

  } catch (error) {
    console.error("Delete error:", error);
    alert(error.response?.data?.message || "Delete failed");
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


  //
  const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

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

    // Backend: send doctorId to identify which doctor's user document to update
    const res = await api.post(
      `/doctors/upload-image/${selectedDoctor._id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const imageUrl = res.data.photo || res.data.cloudinaryUrl;

    // Update edit form only for this doctor
    setEditForm(prev => ({
      ...prev,
      photo: imageUrl
    }));

    // Also update selectedDoctor so UI updates immediately
    setSelectedDoctor(prev => ({
      ...prev,
      user: {
        ...prev.user,
        photo: imageUrl
      }
    }));

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
    if (doctor?.user?.photo) {
      return doctor.user.photo;
    }
    
    if (doctor?.user?.avatar) {
      return doctor.user.avatar;
    }
    
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

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoctors();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({ department: '', availability: '', experience: '', feeRange: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-gray-600">Manage all doctors in your healthcare system</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Total Doctors</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-xl font-bold text-gray-900">{stats.available}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                  <p className="text-xl font-bold text-gray-900">{stats.avgRating?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-500">Avg Fee</p>
                  <p className="text-xl font-bold text-gray-900">${stats.avgFee || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
              >
                <option value="">All Departments</option>

                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                onClick={handleSearch}
                className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <Filter className="h-5 w-5" />
                Apply
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Doctors</h2>
          <p className="text-gray-600">{pagination.total} doctors found</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span className="text-sm">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
              <span className="text-sm">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Display */}
      {loading ? (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {[...Array(8)].map((_, i) => (
            viewMode === 'grid' ? (
              <div key={i} className="bg-white rounded-2xl shadow p-5 animate-pulse">
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
            ) : (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {doctors.map(doctor => (
                <div key={doctor._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                  <div className="p-6">
                    {/* Availability Badge */}
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                          doctor?.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
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

                    {/* Doctor Info */}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={getDoctorImage(doctor)}
                        alt={doctor?.user?.name}
                        className="w-24 h-24 rounded-full border-4 border-white shadow mb-4"
                      />
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Dr. {doctor?.user?.name}
                      </h3>
                      
                      <div className="mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(doctor.department)}`}>
                          {formatDepartmentName(doctor.department)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 truncate w-full">
                        {formatSpecialization(doctor.specialization)}
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center justify-center gap-1 mb-4">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-900">{(doctor?.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({doctor?.totalRatings || 0})</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-bold text-gray-900">${doctor?.consultationFee || 0}</div>
                        <div className="text-xs text-gray-500">Fee</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-bold text-gray-900">{doctor?.experience || 0}y</div>
                        <div className="text-xs text-gray-500">Exp</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="font-bold text-gray-900">{doctor?.maxPatientsPerDay || 20}</div>
                        <div className="text-xs text-gray-500">Max/Day</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditDoctor(doctor)}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setDeleteModalOpen(true);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="space-y-4">
              {doctors.map(doctor => (
                <div key={doctor._id} className="bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={getDoctorImage(doctor)}
                          alt={doctor?.user?.name}
                          className="w-16 h-16 rounded-xl border-2 border-white shadow"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(doctor.department)}`}>
                            {formatDepartmentName(doctor.department)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">
                            Dr. {doctor?.user?.name}
                          </h3>
                          {doctor?.verified && (
                            <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {formatSpecialization(doctor.specialization)}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{(doctor?.rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({doctor?.totalRatings || 0})</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{doctor?.experience || 0}y exp</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">${doctor?.consultationFee || 0}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate max-w-[120px]">
                              {doctor?.location || 'Not specified'}
                            </span>
                          </div>
                          
                          <div className={`flex items-center gap-1 ${doctor?.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            {doctor?.isAvailable ? (
                              <CheckCircle className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            <span className="text-sm font-medium">
                              {doctor?.isAvailable ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleAvailabilityToggle(doctor._id, doctor.isAvailable)}
                          className={`p-2 rounded-lg transition-colors ${
                            doctor?.isAvailable
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Toggle Availability"
                        >
                          {doctor?.isAvailable ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Try adjusting your search criteria or add a new doctor to get started.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-8 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
          >
            Reset Filters & Refresh
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-900">{pagination.total}</span> doctors
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page === 1}
                className="px-4 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
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
                    className={`min-w-[40px] h-10 rounded-lg border transition-all text-sm font-medium ${
                      pagination.page === pageNum
                        ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white border-transparent'
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
                className="px-4 py-2.5 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {viewModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Doctor Profile</h2>
                <p className="text-gray-500">Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column */}
                <div className="lg:w-1/3 space-y-6">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl p-6">
                    <div className="mb-6">
                      <img
                        src={getDoctorImage(selectedDoctor)}
                        alt={selectedDoctor.user?.name}
                        className="w-48 h-48 rounded-2xl mx-auto object-cover border-4 border-white shadow-xl"
                      />
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

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">${selectedDoctor.consultationFee || 0}</div>
                        <div className="text-sm text-gray-500">Fee</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedDoctor.experience || 0}y</div>
                        <div className="text-sm text-gray-500">Exp</div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl mb-6">
                      <p className="text-sm text-gray-500 mb-1">Doctor ID</p>
                      <p className="font-bold text-gray-900 text-lg">{selectedDoctor.doctorId || 'N/A'}</p>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium">
                        Schedule Video Call
                      </button>
                      <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium">
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:w-2/3 space-y-6">
                  {/* Contact Info */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h4 className="font-bold text-lg mb-4">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedDoctor.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{selectedDoctor.user?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{selectedDoctor.location || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-purple-600" />
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

                  {/* Professional Details */}
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

                  {/* Bio */}
                  {selectedDoctor.user?.bio && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-lg mb-4">About</h4>
                      <p className="text-gray-700">{selectedDoctor.user.bio}</p>
                    </div>
                  )}

                  {/* Education */}
                  {selectedDoctor.education && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-lg mb-4">Education & Qualifications</h4>
                      <p className="text-gray-700">{selectedDoctor.education}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-medium"
              >
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

      {/* Edit Doctor Modal */}
      {editModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Doctor Profile</h2>
                <p className="text-gray-500">Dr. {selectedDoctor.user?.name}</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Photo Upload */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={editForm.photo || getDoctorImage(selectedDoctor)}
                      alt="Profile"
                      className="h-32 w-32 rounded-2xl object-cover border-4 border-white shadow"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow hover:shadow-lg"
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
                      <p className="text-green-600 text-sm mb-2">Selected: {selectedFileName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Upload a new profile photo. JPG, PNG, WebP. Max 5MB.
                    </p>
                    {uploadingPhoto && (
                      <p className="text-blue-600 text-sm mt-2">Uploading...</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900">Professional Information</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                      <select
                          value={filters.department}
                          onChange={(e) =>
                            setFilters({ ...filters, department: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                        >
                          <option value="">All Departments</option>

                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept.toUpperCase()}
                            </option>
                          ))}
                        </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        value={editForm.specialization}
                        onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($) *</label>
                        <input
                          type="number"
                          value={editForm.consultationFee}
                          onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                        <input
                          type="number"
                          value={editForm.experience}
                          onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education & Qualifications</label>
                  <textarea
                    value={editForm.education}
                    onChange={(e) => setEditForm({...editForm, education: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleUpdateDoctor}
                className="flex-1 px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-medium"
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
                Are you sure you want to delete Dr. {selectedDoctor.user?.name}?
              </p>
              <p className="text-red-500 text-sm mb-8">
                This action cannot be undone.
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
                  className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-medium"
                >
                  Delete
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