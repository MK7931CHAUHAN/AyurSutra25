import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, UserPlus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, 
  Calendar, Phone, Mail, Download, Upload, RefreshCw, AlertCircle,
  User, Shield, Activity, Heart, Pill, FileText, Grid, List,
  CheckCircle, XCircle, Star, TrendingUp, Users, CalendarDays,
  MapPin, Clock, ShieldAlert, MoreVertical, Printer, FileSpreadsheet
} from 'lucide-react';
import api from '../../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PatientViewModal from "../../../components/admin/Patients/PatientViewModal";
import PatientEditModal from "../../../components/admin/Patients/PatientEditModal";
import MedicalRecordModal from "../../../components/admin/Patients/MedicalRecordModal";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    critical: 0
  });

  const handleView = (patient) => {
    if (!patient || !patient._id) {
      toast.error('Invalid patient data');
      return;
    }
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  const handleEdit = (patient) => {
    if (!patient || !patient._id) {
      toast.error('Invalid patient data');
      return;
    }
    setSelectedPatient(patient);
    setEditModalOpen(true);
  };

  const handleMedicalRecords = (patient) => {
    if (!patient || !patient._id) {
      toast.error('Invalid patient data');
      return;
    }
    setSelectedPatient(patient);
    setRecordModalOpen(true);
  };

  const handleEditSave = (updatedPatient) => {
    setPatients(prev =>
      prev.map(p => p._id === updatedPatient._id ? updatedPatient : p)
    );
    toast.success('Patient updated successfully');
  };

  // Fetch Patients - FIXED VERSION
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(genderFilter && { gender: genderFilter })
      };

      const response = await api.get('/patients', { params });

      if (response.data.success && response.data.patients) {
        // Format patients data with safe defaults
        const formattedPatients = response.data.patients.map(patient => ({
          _id: patient._id || `temp_${Date.now()}_${Math.random()}`,
          patientId: patient.patientCode || patient.patientId || 'N/A',
          patientCode: patient.patientCode || 'N/A',
          fullName: patient.name || patient.fullName || 'Unknown Patient',
          name: patient.name || 'Unknown Patient',
          email: patient.email || '',
          phone: patient.phone || 'N/A',
          photo: patient.photo || 
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              patient.name || 'Patient'
            )}&background=667eea&color=fff`,
          gender: patient.gender || '',
          bloodGroup: patient.bloodGroup || 'Not Specified',
          status: patient.status || 'active',
          age: patient.age || 0,
          dateOfBirth: patient.dateOfBirth,
          createdAt: patient.createdAt,
          allergies: patient.allergies || [],
          medicalHistory: patient.medicalHistory || [],
          currentMedications: patient.currentMedications || [],
          address: patient.address || {},
          medicalRecords: patient.medicalRecords || []
        }));

        setPatients(formattedPatients);

        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1,
          page: response.data.currentPage || 1
        }));
      } else {
        toast.error('Failed to load patients data');
        setPatients([]);
      }

    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, genderFilter]);

  // Add this useEffect for pagination changes
  useEffect(() => {
    fetchPatients();
  }, [pagination.page, fetchPatients]);

  // Update handleDelete function
  const handleDelete = async (patientId, fullName) => {
    if (!patientId || patientId.startsWith('temp_')) {
      toast.error('Invalid patient ID');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete patient: ${fullName}?\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/patients/${patientId}`);
      
      if (response.data.success) {
        toast.success('Patient deleted successfully');
        
        // Refresh data
        fetchPatients();
        fetchStats();
        
        // Clear selection if deleted patient was selected
        setSelectedPatients(prev => prev.filter(id => id !== patientId));
      } else {
        toast.error(response.data.message || 'Delete failed');
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  // Update bulk action handler
  const handleBulkAction = async () => {
    if (!bulkAction || selectedPatients.length === 0) {
      toast.warning('Please select an action and at least one patient');
      return;
    }

    // Filter out any temporary IDs
    const validPatientIds = selectedPatients.filter(id => !id.startsWith('temp_'));
    
    if (validPatientIds.length === 0) {
      toast.error('No valid patients selected');
      return;
    }

    if (bulkAction === 'export') {
      // Handle export separately
      handleExport();
      setBulkAction('');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${bulkAction} ${validPatientIds.length} patient(s)?`)) {
      return;
    }

    try {
      const response = await api.put('/patients/bulk-update', {
        patientIds: validPatientIds,
        action: bulkAction
      });
      
      toast.success(response.data.message);
      fetchPatients();
      fetchStats();
      setBulkAction('');
      setSelectedPatients([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    }
  };

  // Fetch Patient Stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/patients/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '' || statusFilter !== '' || genderFilter !== '') {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchPatients();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, genderFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPatients();
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map(p => p._id).filter(id => id));
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(genderFilter && { gender: genderFilter })
      });

      const response = await api.get(`/patients/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patients_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const calculateAgeFromDOB = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateAge = (patient) => {
    return patient.age || calculateAgeFromDOB(patient.dateOfBirth) || 0;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 border border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border border-gray-200',
      'deceased': 'bg-red-100 text-red-800 border border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'critical': 'bg-red-100 text-red-800 border border-red-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getGenderColor = (gender) => {
    const colors = {
      'male': 'bg-blue-100 text-blue-800',
      'female': 'bg-pink-100 text-pink-800',
      'other': 'bg-purple-100 text-purple-800'
    };
    return colors[gender?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getBloodGroupColor = (bloodGroup) => {
    if (!bloodGroup || bloodGroup === 'Not Specified') return 'bg-gray-100 text-gray-800';
    
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-50 text-red-700',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-50 text-blue-700',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-50 text-green-700',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-50 text-purple-700'
    };
    return colors[bloodGroup] || 'bg-gray-100 text-gray-800';
  };

  const hasAllergies = (patient) => {
    return patient.allergies && patient.allergies.length > 0;
  };

  const hasMedicalHistory = (patient) => {
    return patient.medicalHistory && patient.medicalHistory.length > 0;
  };

  // Safe render functions
  const renderPatientName = (patient) => {
    return patient?.fullName || patient?.name || 'Unknown Patient';
  };

  const renderPatientId = (patient) => {
    return patient?.patientCode || patient?.patientId || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Management</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Export CSV
            </button>
            <Link
              to="/admin/patients/import"
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Upload size={18} />
              Import
            </Link>
            <Link
              to="/admin/patients/add"
              className="hidden items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
            >
              <UserPlus size={18} />
              Add New Patient
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total || pagination.total}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.newThisMonth || 0} new this month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Users className="text-blue-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active || 0}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>All systems normal</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <Activity className="text-green-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Follow-up</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.critical || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <ShieldAlert className="text-yellow-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Age</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {patients.length > 0 
                    ? Math.round(patients.reduce((sum, p) => sum + (calculateAge(p) || 0), 0) / patients.length)
                    : 0
                  } yrs
                </p>
                <p className="text-xs text-gray-500 mt-1">Current patient base</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <CalendarDays className="text-purple-600" size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid size={16} />
                  <span className="text-sm">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List size={16} />
                  <span className="text-sm">List</span>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, ID, phone, email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="critical">Critical</option>
              </select>
              
              <select
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <Filter size={18} />
                Search
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setGenderFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                  fetchPatients();
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={18} />
                Reset
              </button>
            </div>
          </form>

          {/* Bulk Actions */}
          {selectedPatients.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={16} />
                  {selectedPatients.length} patient(s) selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate Selected</option>
                    <option value="deactivate">Deactivate Selected</option>
                    <option value="markCritical">Mark as Critical</option>
                    <option value="export">Export Selected</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply Action
                  </button>
                  <button
                    onClick={() => setSelectedPatients([])}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Loading patients...</p>
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <User size={64} className="mb-4 text-gray-300" />
              <p className="text-xl font-medium">No patients found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter || genderFilter 
                  ? 'Try adjusting your search criteria'
                  : 'Add your first patient to get started'}
              </p>
              <Link
                to="/admin/patients/add"
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <UserPlus size={18} />
                Add New Patient
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {patients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
                {/* Patient Header */}
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-100"></div>
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <img
                        src={patient.photo}
                        alt={renderPatientName(patient)}
                        className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(renderPatientName(patient))}&background=667eea&color=fff&size=200`;
                        }}
                      />
                      <span className={`absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status?.charAt(0).toUpperCase() + patient.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="pt-12 pb-6 px-6">
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{renderPatientName(patient)}</h3>
                    <p className="text-sm text-gray-600">ID: {renderPatientId(patient)}</p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(patient.gender)}`}>
                        {patient.gender || 'Unknown'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                        {patient.bloodGroup || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{patient.phone || 'N/A'}</p>
                      </div>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium truncate">{patient.email}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium">{calculateAge(patient)} years</p>
                      </div>
                    </div>
                  </div>

                  {/* Medical Indicators */}
                  <div className="flex justify-between mb-6">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {patient.allergies?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Allergies</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {patient.medicalHistory?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Med History</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {patient.currentMedications?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Medications</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleView(patient)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(patient)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleMedicalRecords(patient)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <FileText size={14} />
                      Records
                    </button>
                    <button
                      onClick={() => handleDelete(patient._id, renderPatientName(patient))}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedPatients.length === patients.length && patients.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                      {/* Selection */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(patient._id)}
                          onChange={() => handleSelectPatient(patient._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Patient Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200">
                            <img
                              src={patient.photo}
                              alt={renderPatientName(patient)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(renderPatientName(patient))}&background=667eea&color=fff`;
                              }}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">
                              {renderPatientName(patient)}
                              {hasAllergies(patient) && (
                                <AlertCircle className="inline-block ml-2 text-red-500" size={16} />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">ID: {renderPatientId(patient)}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span>{calculateAge(patient)} yrs</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.5 rounded ${getGenderColor(patient.gender)}`}>
                                {patient.gender || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-900">{patient.phone || 'N/A'}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-900 truncate max-w-[180px]">{patient.email}</span>
                            </div>
                          )}
                          {patient.address?.city && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500 truncate max-w-[180px]">
                                {patient.address.city}, {patient.address.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Medical Info */}
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Heart size={14} className="text-red-400" />
                            <span className="text-sm">
                              <span className="text-gray-500">Blood: </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getBloodGroupColor(patient.bloodGroup)}`}>
                                {patient.bloodGroup || 'N/A'}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Pill size={14} className="text-purple-400 mt-0.5" />
                            <span className="text-sm">
                              <span className="text-gray-500">Allergies: </span>
                              <span className="font-medium">
                                {hasAllergies(patient) ? `${patient.allergies.length} listed` : 'None'}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FileText size={14} className="text-blue-400 mt-0.5" />
                            <span className="text-sm">
                              <span className="text-gray-500">History: </span>
                              <span className="font-medium">
                                {hasMedicalHistory(patient) ? `${patient.medicalHistory.length} records` : 'None'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}
                          >
                            {patient.status
                              ? patient.status.charAt(0).toUpperCase() + patient.status.slice(1)
                              : 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            Since {formatDate(patient.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(patient)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleMedicalRecords(patient)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Medical Records"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(patient._id, renderPatientName(patient))}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && patients.length > 0 && pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
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
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`min-w-[40px] h-10 rounded-lg font-medium text-sm ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewModalOpen && (
        <PatientViewModal
          patient={selectedPatient}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      )}

      {editModalOpen && (
        <PatientEditModal
          patient={selectedPatient}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}

      {recordModalOpen && (
        <MedicalRecordModal
          patient={selectedPatient}
          isOpen={recordModalOpen}
          onClose={() => setRecordModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PatientList;