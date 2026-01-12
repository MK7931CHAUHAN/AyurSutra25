import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Calendar, Phone, Mail, MapPin, User, Heart, Pill, 
  AlertCircle, Plus, Trash2, Upload, Camera, Briefcase, Home
} from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const PatientEditModal = ({ patient, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    photo: '',
    bloodGroup: '',
    status: 'active',
    occupation: '',
    maritalStatus: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    allergies: [],
    chronicConditions: [],
    weight: '',
    height: '',
    bloodPressure: '',
    notes: ''
  });

  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'mild' });
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Map address.pincode to address.zipCode
  const formatAddress = (address) => ({
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.pincode || address?.zipCode || '',
    country: address?.country || 'India'
  });
  
  useEffect(() => {
  if (!patient || !isOpen) return;

  setFormData({
    fullName: patient.user?.name || patient.fullName || '',
    dateOfBirth: patient.dateOfBirth
      ? patient.dateOfBirth.split('T')[0]
      : '',
    gender: patient.gender || '',
    phone: patient.phone || patient.user?.phone || '',
    email: patient.email || patient.user?.email || '',
    photo: patient.photo || patient.user?.photo || '',
    bloodGroup: patient.bloodGroup || '',
    status: patient.status || 'active',
    occupation: patient.occupation || '',
    maritalStatus: patient.maritalStatus || '',
    address: {
      street: patient.address?.street || '',
      city: patient.address?.city || '',
      state: patient.address?.state || '',
      zipCode:
        patient.address?.zipCode ||
        patient.address?.pincode ||
        '',
      country: patient.address?.country || 'India'
    },
    emergencyContact: {
      name: patient.emergencyContact?.name || '',
      relationship: patient.emergencyContact?.relationship || '',
      phone: patient.emergencyContact?.phone || '',
      email: patient.emergencyContact?.email || ''
    },
    allergies: patient.allergies || [],
    chronicConditions: patient.medicalHistory || [],
    weight: patient.weight || '',
    height: patient.height || '',
    bloodPressure: patient.bloodPressure || '',
    notes: patient.notes || ''
  });

  setPhotoPreview(patient.photo || patient.user?.photo || null);
  setPhotoFile(null);
}, [patient, isOpen]);


  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.emergencyContact.name && !formData.emergencyContact.phone) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setPhotoFile(file);

    // Clean up old blob URL
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      toast.error("Please select a photo first");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("photo", photoFile);

      const res = await api.post(
        `/patients/${patient._id}/upload-photo`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Update form data and preview with Cloudinary URL
      setFormData(prev => ({
        ...prev,
        photo: res.data.photo
      }));
      setPhotoPreview(res.data.photo);
      
      // Clear file
      setPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success("Photo uploaded successfully");
      
      // Update parent component
      onSave({ ...patient, photo: res.data.photo });
      
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error(error.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
  };

  // On form submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error('Please fix errors');
    return;
  }

  setLoading(true);

  try {
    const dataToSubmit = {
      fullName: formData.fullName?.trim(),
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender || 'other',
      dateOfBirth: formData.dateOfBirth || null,
      medicalHistory: formData.chronicConditions || [],
      notes: formData.notes || '',
      photo:
        formData.photo && !formData.photo.startsWith('blob:')
          ? formData.photo
          : ''
    };

    // ✅ ID FIX (admin + register + temp)
    const idToUse =
      patient?.userId ||
      patient?.user?._id ||
      patient?._id ||
      patient?.tempId;

    if (!idToUse) {
      toast.error('Invalid patient ID');
      setLoading(false);
      return;
    }

    const response = await api.put(
      `/patients/${idToUse}`,
      dataToSubmit
    );

    toast.success('Patient updated successfully');

    onSave(response.data.patient || response.data.user);
    onClose();
  } catch (error) {
    console.error('Update error:', error);
    toast.error(
      error.response?.data?.message || 'Failed to update patient'
    );
  } finally {
    setLoading(false);
  }
};

// Helper function to get display image
  const getDisplayImage = () => {
    if (photoPreview) return photoPreview;
    if (formData.photo) return formData.photo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName || '')}+${encodeURIComponent(formData.lastName || '')}&background=3B82F6&color=fff&bold=true`;
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not Specified'];
  const genders = ['male', 'female', 'other'];
  const statusOptions = ['active', 'inactive', 'pending', 'critical', 'deceased'];
  const maritalStatusOptions = ['single', 'married', 'divorced', 'widowed', ''];

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img 
                    src={getDisplayImage()} 
                    alt={`${formData.firstName} ${formData.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName || '')}+${encodeURIComponent(formData.lastName || '')}&background=3B82F6&color=fff&bold=true`;
                    }}
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                {getDisplayImage() && !getDisplayImage().includes('ui-avatars.com') && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -bottom-1 -left-1 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Patient</h2>
                <p className="text-gray-600 mt-1">Update patient information</p>
                {photoFile && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.fullName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label><div className="relative">
                          <Calendar
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />

                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth || ''}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]} // ✅ future DOB block
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
                                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Gender</option>
                        {genders.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone size={20} />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Occupation
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home size={20} />
                    Address
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP/Pincode
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Medical Information */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart size={20} />
                    Medical Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Allergies
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Allergy name"
                          value={newAllergy.name}
                          onChange={(e) => setNewAllergy(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select
                          value={newAllergy.severity}
                          onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (newAllergy.name.trim()) {
                              setFormData(prev => ({
                                ...prev,
                                allergies: [...prev.allergies, { ...newAllergy }]
                              }));
                              setNewAllergy({ name: '', severity: 'mild' });
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      {formData.allergies.length > 0 && (
                        <div className="space-y-2">
                          {formData.allergies.map((allergy, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center gap-3">
                                <Pill size={16} className="text-purple-500" />
                                <span className="font-medium">{allergy.name}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  allergy.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                  allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {allergy.severity}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    allergies: prev.allergies.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chronic Conditions
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Condition name"
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newCondition.trim()) {
                              setFormData(prev => ({
                                ...prev,
                                chronicConditions: [...prev.chronicConditions, newCondition.trim()]
                              }));
                              setNewCondition('');
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      {formData.chronicConditions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.chronicConditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full">
                              <span className="text-sm">{condition}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    chronicConditions: prev.chronicConditions.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="p-0.5 hover:bg-orange-200 rounded-full"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status and Marital Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status} className="capitalize">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marital Status
                        </label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select</option>
                          {maritalStatusOptions.map(status => (
                            <option key={status} value={status} className="capitalize">
                              {status || 'Not Specified'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-500" />
                        Emergency Contact
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={formData.emergencyContact.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              name="emergencyContact.relationship"
                              value={formData.emergencyContact.relationship}
                              onChange={handleChange}
                              placeholder="Relationship"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              name="emergencyContact.phone"
                              value={formData.emergencyContact.phone}
                              onChange={handleChange}
                              placeholder="Phone *"
                              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.emergencyContactPhone ? 'border-red-300' : 'border-gray-300'
                              }`}
                            />
                            {errors.emergencyContactPhone && (
                              <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <input
                            type="email"
                            name="emergencyContact.email"
                            value={formData.emergencyContact.email}
                            onChange={handleChange}
                            placeholder="Email (Optional)"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={loading || uploadingPhoto}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingPhoto}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientEditModal;