import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Filter,
  Download,
  UserCheck,
  UserX,
  CalendarCheck,
  RefreshCw,
  Plus,
  FileText,
  Printer,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Search,
  CalendarDays
} from 'lucide-react';
import { doctorApi } from '../../../services/doctorApi';
import { appointmentApi } from '../../../services/appointmentApi';

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorData, setDoctorData] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    timeSlots: [],
    appointments: [],
    stats: {
      totalAppointments: 0,
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Appointment modal state
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointmentForm, setAppointmentForm] = useState({
    patient: '',
    time: '',
    type: 'consultation',
    purpose: '',
    notes: '',
    duration: 30,
    priority: 'medium'
  });

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setDoctorLoading(true);
      setError(null);
      
      const response = await doctorApi.getDoctors();
      console.log("Doctors API Response:", response);
      
      if (response.success) {
        const doctorsList = response.doctors || [];
        setDoctors(doctorsList);
        
        // Auto-select first doctor if none selected
        if (doctorsList.length > 0 && !selectedDoctor) {
          setSelectedDoctor(doctorsList[0].doctorMongoId || doctorsList[0]._id);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError(error.message || 'Failed to load doctors. Please try again.');
      setDoctors([]);
    } finally {
      setDoctorLoading(false);
    }
  };

  // Fetch doctor schedule
  const fetchDoctorSchedule = async () => {
    if (!selectedDoctor) {
      console.warn("No doctor selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching schedule for doctor:", selectedDoctor, "on date:", selectedDate);
      
      const response = await doctorApi.getDoctorSchedule(selectedDoctor, selectedDate);
      console.log("Schedule API Response:", response);
      
      if (response.success) {
        const { doctor, timeSlots = [], appointments = [], stats = {} } = response;
        
        setDoctorData({
          ...doctor,
          email: doctor.email || "No email provided",
          phone: doctor.phone || "N/A",
          department: doctor.department || "General",
          workingHours: doctor.workingHours || { start: "09:00", end: "17:00" },
          maxPatientsPerDay: doctor.maxPatientsPerDay || 20,
          availableDays: doctor.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        });

        setScheduleData({
          timeSlots: timeSlots.map(slot => ({
            ...slot,
            time: slot.time || "00:00",
            appointment: slot.appointment ? {
              ...slot.appointment,
              patient: slot.appointment.patient || { fullName: "Unknown Patient", patientId: "N/A", phone: "N/A" }
            } : null
          })),
          appointments,
          stats: {
            totalAppointments: stats.totalAppointments || 0,
            scheduled: stats.scheduled || 0,
            confirmed: stats.confirmed || 0,
            completed: stats.completed || 0,
            cancelled: stats.cancelled || 0,
            pending: stats.pending || 0
          }
        });
      } else {
        throw new Error(response.message || 'Failed to fetch schedule');
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError(error.message || "Failed to load schedule. Please try again.");
      
      // Generate default time slots for fallback
      setScheduleData({
        timeSlots: generateDefaultTimeSlots(),
        appointments: [],
        stats: { totalAppointments: 0, scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate default time slots
  const generateDefaultTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ time: timeString, appointment: null });
      }
    }
    return slots;
  };

  // Fetch patients for appointment form
  const fetchPatients = async () => {
    try {
      // You need to implement this API endpoint
      const response = await api.get('/patients');
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    }
  };

  // Handle appointment creation
  const handleCreateAppointment = async () => {
    try {
      if (!appointmentForm.patient || !appointmentForm.time) {
        setError("Please select a patient and time");
        return;
      }

      const appointmentData = {
        patient: appointmentForm.patient,
        doctor: selectedDoctor,
        date: selectedDate.toISOString().split('T')[0],
        time: appointmentForm.time,
        type: appointmentForm.type,
        purpose: appointmentForm.purpose,
        notes: appointmentForm.notes,
        duration: appointmentForm.duration,
        priority: appointmentForm.priority,
        status: 'scheduled'
      };

      await appointmentApi.createAppointment(appointmentData);
      
      // Close modal and refresh schedule
      setAppointmentModalOpen(false);
      setAppointmentForm({
        patient: '',
        time: '',
        type: 'consultation',
        purpose: '',
        notes: '',
        duration: 30,
        priority: 'medium'
      });
      
      fetchDoctorSchedule();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error.response?.data?.message || 'Failed to create appointment');
    }
  };

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      await appointmentApi.updateAppointmentStatus(appointmentId, newStatus);
      await fetchDoctorSchedule();
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setLoading(true);
        await appointmentApi.cancelAppointment(appointmentId, 'Cancelled by admin');
        await fetchDoctorSchedule();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        setError(error.response?.data?.message || 'Failed to cancel appointment');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle schedule export
  const handleExport = async () => {
    try {
      if (!selectedDoctor) {
        setError("Please select a doctor first");
        return;
      }

      const startDate = selectedDate.toISOString().split('T')[0];
      const endDate = startDate; // Export single day

      const response = await doctorApi.exportSchedule(selectedDoctor, startDate, endDate);
      
      // Create downloadable file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doctor-schedule-${startDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export Error:", error);
      setError(error.message || "Failed to export schedule");
    }
  };

  // Handle print schedule
  const handlePrint = () => {
    window.print();
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== "string") return "N/A";
    
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours)) return "N/A";
    
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'checked-in': 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-red-100 text-red-800',
      'no-show': 'bg-gray-100 text-gray-800',
      'pending': 'bg-orange-100 text-orange-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Navigate date
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchDoctors();
    if (selectedDoctor) {
      fetchDoctorSchedule();
    }
  };

  // Open appointment modal
  const openAppointmentModal = (timeSlot = null) => {
    if (!selectedDoctor) {
      setError("Please select a doctor first");
      return;
    }
    
    setSelectedTimeSlot(timeSlot);
    setAppointmentForm(prev => ({
      ...prev,
      time: timeSlot?.time || ''
    }));
    setAppointmentModalOpen(true);
    fetchPatients();
  };

  // Get current doctor
  const getCurrentDoctor = () => {
    return doctors.find(d => (d.doctorMongoId || d._id) === selectedDoctor);
  };

  // Effects
  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedule();
    }
  }, [selectedDoctor, selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Schedule Management</h1>
              <p className="text-gray-600">Manage and view doctor appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors"
              disabled={loading}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(selectedDate)}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : ''}
              </div>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-white transition-colors"
              disabled={loading}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              disabled={loading}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  handleRefresh();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Retry
              </button>
            </div>
            <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Doctor Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Doctor</h3>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh doctors"
              >
                <RefreshCw className={`h-4 w-4 ${doctorLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {doctorLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full p-4 rounded-xl border border-gray-200 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {doctors.map(doctor => {
                  const doctorUser = doctor.user || {};
                  const doctorId = doctor.doctorMongoId || doctor._id;
                  const isCurrent = selectedDoctor === doctorId;
                  
                  return (
                    <button
                      key={doctorId}
                      onClick={() => setSelectedDoctor(doctorId)}
                      className={`w-full p-4 rounded-xl border transition-all duration-300 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isCurrent ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                        }`}>
                          {doctorUser.photo ? (
                            <img
                              src={doctorUser.photo}
                              alt={doctorUser.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className={`font-bold ${isCurrent ? 'text-white' : 'text-blue-600'}`}>
                              {doctorUser.name?.charAt(0)?.toUpperCase() || 'D'}
                            </span>
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            Dr. {doctorUser.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {doctor.department || 'General'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {doctor.availableDays?.join(', ') || 'Mon-Fri'}
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          {doctor.isAvailable !== false ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-xs text-green-600 mt-1">Available</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span className="text-xs text-red-600 mt-1">Busy</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Doctor Info */}
            {doctorData && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">Doctor Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm truncate" title={doctorData.email}>
                      {doctorData.email}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">{doctorData.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">
                      {doctorData.workingHours.start} - {doctorData.workingHours.end}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CalendarCheck className="h-4 w-4 mr-2 flex shrink-0 text-gray-400" />
                    <span className="text-sm">
                      Max {doctorData.maxPatientsPerDay} patients/day
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Content */}
        <div className="lg:col-span-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.totalAppointments}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.confirmed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduleData.stats.cancelled}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {doctorData ? `Dr. ${doctorData.name}` : 'Select a doctor'} • {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    onClick={handleRefresh}
                    disabled={loading || !selectedDoctor}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    onClick={handleExport}
                    disabled={!selectedDoctor || loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    onClick={handlePrint}
                    disabled={!selectedDoctor}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    onClick={() => openAppointmentModal()}
                    disabled={!selectedDoctor}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </button>
                </div>
              </div>
            </div>

            {/* Schedule Body */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading schedule...</p>
              </div>
            ) : !selectedDoctor ? (
              <div className="p-12 text-center">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
                <p className="text-gray-500">Please select a doctor from the left panel to view their schedule</p>
              </div>
            ) : scheduleData.timeSlots.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {scheduleData.timeSlots.map((slot, index) => (
                  <div
                    key={slot.time || index}
                    className="p-6 hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-6 flex-1">
                        {/* Time Slot */}
                        <div className="w-28 lg:w-32 flex shrink-0 flex-col">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatTime(slot.time)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {slot.time}
                          </div>
                          {!slot.appointment && (
                            <button
                              onClick={() => openAppointmentModal(slot)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Book
                            </button>
                          )}
                        </div>

                        {/* Appointment Details */}
                        {slot.appointment ? (
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {slot.appointment.patient?.fullName || 'Unknown Patient'}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                      ID: {slot.appointment.patient?.patientId || 'N/A'} • 
                                      Phone: {slot.appointment.patient?.phone || 'N/A'}
                                    </div>
                                    {slot.appointment.purpose && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        Purpose: {slot.appointment.purpose}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <select
                                  value={slot.appointment.status}
                                  onChange={(e) => handleStatusUpdate(slot.appointment._id, e.target.value)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusColor(slot.appointment.status)}`}
                                  disabled={loading}
                                >
                                  <option value="scheduled">Scheduled</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="checked-in">Checked In</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="no-show">No Show</option>
                                </select>
                                <div className="flex gap-1">
                                  <button 
                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                    onClick={() => window.open(`/appointments/${slot.appointment._id}`, '_blank')}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button 
                                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                                    onClick={() => window.open(`/appointments/${slot.appointment._id}/edit`, '_blank')}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button 
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                    onClick={() => handleCancelAppointment(slot.appointment._id)}
                                    title="Cancel"
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {slot.appointment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Notes:</span> {slot.appointment.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center">
                            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                              <span className="text-gray-500 text-sm">Available time slot</span>
                              <button
                                onClick={() => openAppointmentModal(slot)}
                                className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Scheduled</h3>
                <p className="text-gray-500 mb-4">
                  {doctorData 
                    ? `No appointments are scheduled for Dr. ${doctorData.name} on ${formatDate(selectedDate)}`
                    : 'Select a doctor to view schedule'
                  }
                </p>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  onClick={() => openAppointmentModal()}
                >
                  <CalendarCheck className="h-4 w-4" />
                  Schedule New Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {appointmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Appointment</h2>
                <p className="text-gray-500">
                  {selectedTimeSlot ? `Time: ${formatTime(selectedTimeSlot.time)}` : 'Select time slot'}
                </p>
              </div>
              <button
                onClick={() => setAppointmentModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Doctor Info */}
                {doctorData && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      {doctorData.photo ? (
                        <img
                          src={doctorData.photo}
                          alt={doctorData.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">Dr. {doctorData.name}</h4>
                        <p className="text-sm text-gray-600">{doctorData.department}</p>
                        <p className="text-sm text-gray-500">
                          Date: {selectedDate.toLocaleDateString()} • 
                          Time: {appointmentForm.time ? formatTime(appointmentForm.time) : 'Select time'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentForm.patient}
                      onChange={(e) => setAppointmentForm({...appointmentForm, patient: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Patient</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.fullName} ({patient.patientId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Time</option>
                      {scheduleData.timeSlots
                        .filter(slot => !slot.appointment)
                        .map(slot => (
                          <option key={slot.time} value={slot.time}>
                            {formatTime(slot.time)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type
                    </label>
                    <select
                      value={appointmentForm.type}
                      onChange={(e) => setAppointmentForm({...appointmentForm, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="consultation">Consultation</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="therapy">Therapy</option>
                      <option value="emergency">Emergency</option>
                      <option value="check-up">Check-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={appointmentForm.priority}
                      onChange={(e) => setAppointmentForm({...appointmentForm, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purpose
                    </label>
                    <input
                      type="text"
                      value={appointmentForm.purpose}
                      onChange={(e) => setAppointmentForm({...appointmentForm, purpose: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of the appointment purpose"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes or instructions"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleCreateAppointment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                    Creating...
                  </>
                ) : (
                  'Create Appointment'
                )}
              </button>
              <button
                onClick={() => setAppointmentModalOpen(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;