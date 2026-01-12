// components/admin/MedicineForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiGlobe, FiAlertCircle, FiInfo, FiArrowRight } from 'react-icons/fi';

const MedicineForm = ({ medicine, onSuccess, onCancel }) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, trigger, getValues } = useForm({
    mode: 'onChange', // Validate on change
    reValidateMode: 'onChange',
  });
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [availableForms] = useState([
    'tablet', 'capsule', 'syrup', 'injection', 'ointment', 'cream'
  ]);
  const [selectedForms, setSelectedForms] = useState(medicine?.availableForms || []);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [autoFillEnabled, setAutoFillEnabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  // Refs for all fields
  const fieldRefs = useRef({});
  
  // Initialize all refs
  const fieldNames = [
    'name', 'genericName', 'brandName', 'category', 'activeIngredient',
    'description.english', 'description.hindi', 'description.punjabi',
    'dosage.english', 'dosage.hindi', 'dosage.punjabi',
    'priceMin', 'priceMax', 'storageInstructions',
    'sideEffects', 'precautions', 'contraindications', 'interactions'
  ];

  const registerWithRef = (name, options = {}) => {
  const reg = register(name, options);
  return {
    ...reg,
    ref: (el) => {
      reg.ref(el);               // ✅ React Hook Form ref
      fieldRefs.current[name] = el; // ✅ Your focus ref
    },
  };
};

  fieldNames.forEach(name => {
    if (!fieldRefs.current[name]) {
      fieldRefs.current[name] = React.createRef();
    }
  });

  useEffect(() => {
    if (medicine) {
      reset(medicine);
      setSelectedForms(medicine.availableForms || []);
    }
    fetchCategories();
    
    // Focus on first field after a short delay
    setTimeout(() => {
      if (fieldRefs.current.name?.current) {
        fieldRefs.current.name.current.focus();
      }
    }, 100);
  }, [medicine, reset]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/chatbot/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleFormToggle = (form) => {
    const newForms = selectedForms.includes(form)
      ? selectedForms.filter(f => f !== form)
      : [...selectedForms, form];
    setSelectedForms(newForms);
  };

  // Translation dictionary
  const translationDict = {
    hindi: {
      fever: 'बुखार',
      headache: 'सिरदर्द',
      pain: 'दर्द',
      relief: 'राहत',
      medication: 'दवा',
      '500mg': '500 मिलीग्राम',
      'every 6 hours': 'हर 6 घंटे में',
      tablet: 'गोली',
      capsule: 'कैप्सूल',
      syrup: 'सिरप',
      store: 'संग्रहित',
      'room temperature': 'कमरे का तापमान',
      'take with food': 'भोजन के साथ लें',
      'avoid alcohol': 'शराब से बचें',
      'store at': 'संग्रहित करें',
      'consult doctor': 'डॉक्टर से परामर्श करें'
    },
    punjabi: {
      fever: 'ਬੁਖਾਰ',
      headache: 'ਸਿਰਦਰਦ',
      pain: 'ਦਰਦ',
      relief: 'ਰਾਹਤ',
      medication: 'ਦਵਾਈ',
      '500mg': '500 ਮਿਲੀਗ੍ਰਾਮ',
      'every 6 hours': 'ਹਰ 6 ਘੰਟਿਆਂ ਬਾਅਦ',
      tablet: 'ਗੋਲੀ',
      capsule: 'ਕੈਪਸੂਲ',
      syrup: 'ਸ਼ਰਬਤ',
      store: 'ਸੰਭਾਲੋ',
      'room temperature': 'ਕਮਰੇ ਦਾ ਤਾਪਮਾਨ',
      'take with food': 'ਖਾਣੇ ਨਾਲ ਲਓ',
      'avoid alcohol': 'ਸ਼ਰਾਬ ਤੋਂ ਬਚੋ',
      'store at': 'ਸੰਭਾਲੋ',
      'consult doctor': 'ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ'
    }
  };

  // Auto-translate text
  const autoTranslate = (text, targetLanguage) => {
    if (!text.trim() || !autoFillEnabled) return '';
    
    let translatedText = text;
    const dict = translationDict[targetLanguage];
    
    // Translate common medical terms
    Object.keys(dict).forEach(key => {
      const regex = new RegExp(key, 'gi');
      translatedText = translatedText.replace(regex, dict[key]);
    });

    // Add language prefix
    const prefixes = {
      hindi: 'हिंदी में: ',
      punjabi: 'ਪੰਜਾਬੀ ਵਿੱਚ: '
    };

    const result = prefixes[targetLanguage] + translatedText;
    
    // Show toast notification for translation
    toast.success(`${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)} translation applied`, {
      icon: '🌐',
      duration: 2000,
    });
    
    return result;
  };

  // Enhanced keyboard navigation with validation
  const handleKeyDown = async (e, fieldName, nextFieldName) => {
    const currentRef = fieldRefs.current[fieldName]?.current;
    const nextRef = fieldRefs.current[nextFieldName]?.current;
    
    // Handle Tab or Enter
    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      
      // Validate current field
      const isValid = await trigger(fieldName);
      
      if (!isValid) {
        // Show error message
        const errorMessage = errors[fieldName]?.message || 'Please fill this field correctly';
        toast.error(errorMessage, { duration: 3000 });
        
        // Highlight field
        if (currentRef) {
          currentRef.classList.add('border-red-500', 'ring-2', 'ring-red-200');
          setTimeout(() => {
            currentRef.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
          }, 3000);
        }
        return;
      }
      
      // Handle auto-translation for description and dosage
      if (autoFillEnabled) {
        if (fieldName === 'description.english' && currentRef?.value?.trim()) {
          const hindiTranslated = autoTranslate(currentRef.value, 'hindi');
          const punjabiTranslated = autoTranslate(currentRef.value, 'punjabi');
          
          setValue('description.hindi', hindiTranslated, { shouldValidate: true });
          setValue('description.punjabi', punjabiTranslated, { shouldValidate: true });
          
          // Move to Hindi field
          if (fieldRefs.current['description.hindi']?.current) {
            setTimeout(() => {
              fieldRefs.current['description.hindi'].current.focus();
            }, 100);
            return;
          }
        }
        
        if (fieldName === 'dosage.english' && currentRef?.value?.trim()) {
          const hindiTranslated = autoTranslate(currentRef.value, 'hindi');
          const punjabiTranslated = autoTranslate(currentRef.value, 'punjabi');
          
          setValue('dosage.hindi', hindiTranslated, { shouldValidate: true });
          setValue('dosage.punjabi', punjabiTranslated, { shouldValidate: true });
          
          // Move to Hindi field
          if (fieldRefs.current['dosage.hindi']?.current) {
            setTimeout(() => {
              fieldRefs.current['dosage.hindi'].current.focus();
            }, 100);
            return;
          }
        }
      }
      
      // Move to next field
      if (nextRef) {
        setTimeout(() => {
          nextRef.focus();
        }, 100);
      } else if (e.key === 'Enter') {
        // If Enter pressed on last field, submit form
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn && !loading) {
          submitBtn.click();
        }
      }
    }
  };

  // Handle field blur for validation
  const handleBlur = async (fieldName) => {
    await trigger(fieldName);
  };

 const onSubmit = async (data) => {
  setLoading(true);

  const isValid = await trigger();
  if (!isValid) {
    toast.error('Please fill all required fields correctly', {
      duration: 3000,
      icon: '❌',
    });
    setLoading(false);
    return;
  }

  const formData = {
    // ❌ priceMin & priceMax backend me nahi bhejne
    name: data.name,
    genericName: data.genericName,
    brandName: data.brandName,
    activeIngredient: data.activeIngredient,
    category: data.category,
    requiresPrescription: data.requiresPrescription,
    status: data.status,

    description: data.description,
    dosage: data.dosage,

    // ✅ Available forms
    availableForms: selectedForms,

    // ✅ PRICE RANGE (FINAL FIX)
    priceRange: {
        min: Number(data.priceMin) || 0,
        max: Number(data.priceMax) || 0,
        currency: 'INR'
    },

    // ✅ ARRAY FIELDS
    sideEffects: data.sideEffects
      ? data.sideEffects.split(',').map(s => s.trim()).filter(Boolean)
      : [],

    precautions: data.precautions
      ? data.precautions.split(',').map(p => p.trim()).filter(Boolean)
      : [],

    contraindications: data.contraindications
      ? data.contraindications.split(',').map(c => c.trim()).filter(Boolean)
      : [],

    interactions: data.interactions
      ? data.interactions.split(',').map(i => i.trim()).filter(Boolean)
      : [],
  };

  try {
    let result;

    if (medicine?._id) {
      result = await api.put(
        `/chatbot/medicines/${medicine._id}`,
        formData
      );
      toast.success('Medicine updated successfully! ✅');
    } else {
      result = await api.post('/chatbot/medicines', formData);
      toast.success('Medicine added successfully! ✅');
    }

    setSuccessData({
      title: medicine ? 'Medicine Updated!' : 'Medicine Added!',
      message: medicine
        ? `${data.name} updated successfully.`
        : `${data.name} added successfully.`,
      medicine: result.data.medicine,
    });

    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
      onSuccess?.(result.data.medicine);
      reset();
      setSelectedForms([]);
    }, 2000);

  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Failed to save medicine ❌'
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (!medicine) return;

  reset({
    name: medicine.name || '',
    genericName: medicine.genericName || '',
    brandName: medicine.brandName || '',

    // ✅ nested text fields
    description: {
      english: medicine.description?.english || '',
      hindi: medicine.description?.hindi || '',
      punjabi: medicine.description?.punjabi || '',
    },

    dosage: {
      english: medicine.dosage?.english || '',
      hindi: medicine.dosage?.hindi || '',
      punjabi: medicine.dosage?.punjabi || '',
    },

    activeIngredient: medicine.activeIngredient || '',
    category: medicine.category || '',
    storageInstructions: medicine.storageInstructions || '',
    requiresPrescription: medicine.requiresPrescription || false,
    status: medicine.status || 'active',

    // ✅ priceRange → flat fields
    priceMin: medicine.priceRange?.min ?? '',
    priceMax: medicine.priceRange?.max ?? '',

    // ✅ comma-separated fields
    sideEffects: medicine.sideEffects?.join(', ') || '',
    precautions: medicine.precautions?.join(', ') || '',
    contraindications: medicine.contraindications?.join(', ') || '',
    interactions: medicine.interactions?.join(', ') || '',
  });

  setSelectedForms(medicine.availableForms || []);

}, [medicine, reset]);


  // Success Popup Component
  const SuccessPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <FiCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {successData?.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {successData?.message}
            </p>
            
            {/* Medicine Details Card */}
            {successData?.medicine && (
              <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <FiInfo className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-green-800">Medicine Details</h4>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex">
                    <span className="w-1/3 text-sm font-medium text-gray-700">Name:</span>
                    <span className="w-2/3 text-sm text-gray-900">{successData.medicine.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/3 text-sm font-medium text-gray-700">Category:</span>
                    <span className="w-2/3 text-sm text-gray-900 capitalize">{successData.medicine.category}</span>
                  </div>
                  <div className="flex">
                    <span className="w-1/3 text-sm font-medium text-gray-700">Active Ingredient:</span>
                    <span className="w-2/3 text-sm text-gray-900">{successData.medicine.activeIngredient}</span>
                  </div>
                  {successData.medicine.status && (
                    <div className="flex">
                      <span className="w-1/3 text-sm font-medium text-gray-700">Status:</span>
                      <span className={`w-2/3 text-sm px-2 py-1 rounded-full inline-block ${
                        successData.medicine.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : successData.medicine.status === 'discontinued'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {successData.medicine.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="w-full pt-4 border-t">
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 font-medium"
              >
                Continue
                <FiArrowRight className="inline ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Required field indicator
  const RequiredLabel = ({ children, required = true }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  // Field with icon component
  const FieldWithIcon = ({ icon: Icon, children, className = '' }) => (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      {children}
    </div>
  );

  // Get error for nested field
  const getNestedError = (path) => {
    const parts = path.split('.');
    let current = errors;
    for (const part of parts) {
      if (current && current[part]) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  };

  return (
    <>
      {showSuccessPopup && <SuccessPopup />}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-3 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {medicine ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setAutoFillEnabled(!autoFillEnabled)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${autoFillEnabled ? 'bg-green-500' : 'bg-gray-300'} mr-2`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${autoFillEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-xs text-gray-600">
                    Auto-translate: {autoFillEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Press <strong>Tab</strong> from English fields to auto-translate
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiXCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="text-sm font-medium text-red-800">
                  Please fix the following {Object.keys(errors).length} error(s):
                </h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.name && <li>• Medicine Name: {errors.name.message}</li>}
                {errors.category && <li>• Category: {errors.category.message}</li>}
                {errors.activeIngredient && <li>• Active Ingredient: {errors.activeIngredient.message}</li>}
                {errors.description?.english && <li>• English Description: {errors.description.english.message}</li>}
                {errors.dosage?.english && <li>• English Dosage: {errors.dosage.english.message}</li>}
              </ul>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4 mb-8">
            <h4 className="text-md font-medium text-gray-700 flex items-center">
              <FiInfo className="h-4 w-4 mr-2" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <RequiredLabel>Medicine Name</RequiredLabel>
                <FieldWithIcon>
                 <input
                    {...registerWithRef('name', {
                        required: 'Medicine name is required',
                        minLength: { value: 2, message: 'Medicine name must be at least 2 characters' }
                    })}
                    onKeyDown={(e) => handleKeyDown(e, 'name', 'genericName')}
                    onBlur={() => handleBlur('name')}
                    className={`w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-2`}
                    placeholder="e.g., Paracetamol"
                    />
                </FieldWithIcon>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generic Name
                </label>
                <input
                  {...register('genericName')}
                  placeholder="e.g., Acetaminophen"
                  onKeyDown={(e) => handleKeyDown(e, 'genericName', 'brandName')}
                  onBlur={() => handleBlur('genericName')}
                  ref={fieldRefs.current.genericName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name
                </label>
                <input
                  {...register('brandName')}
                  placeholder="e.g., Crocin"
                  onKeyDown={(e) => handleKeyDown(e, 'brandName', 'category')}
                  onBlur={() => handleBlur('brandName')}
                  ref={fieldRefs.current.brandName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category & Active Ingredient */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <RequiredLabel>Category</RequiredLabel>
                <select
                    {...registerWithRef('category', { required: 'Category is required' })}
                    onKeyDown={(e) => handleKeyDown(e, 'category', 'activeIngredient')}
                    onBlur={() => handleBlur('category')}
                    className={`w-full px-3 py-2 border ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-2`}
                    >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <RequiredLabel>Active Ingredient</RequiredLabel>
                <input
                    type="text"
                    placeholder="e.g., Paracetamol, Caffeine"
                    {...registerWithRef('activeIngredient', {
                        required: 'Active ingredient is required',
                        minLength: {
                        value: 2,
                        message: 'Active ingredient must be at least 2 characters'
                        }
                    })}
                    onKeyDown={(e) =>
                        handleKeyDown(e, 'activeIngredient', 'description.english')
                    }
                    onBlur={() => handleBlur('activeIngredient')}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 ${
                        errors.activeIngredient ? 'border-red-500' : 'border-gray-300'
                    }`}
                    />

                {errors.activeIngredient && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.activeIngredient.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Descriptions - Auto-translate on Tab */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <FiGlobe className="h-4 w-4 mr-2" />
                Descriptions
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Press Tab from English to auto-translate
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <RequiredLabel>English Description</RequiredLabel>
               <textarea
                    {...registerWithRef('description.english', {
                        required: 'English description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' }
                    })}
                    rows={3}
                    placeholder="Description in English (Press Tab)"
                    onKeyDown={(e) =>
                        handleKeyDown(e, 'description.english', 'description.hindi')
                    }
                    onBlur={() => handleBlur('description.english')}
                    className={`w-full px-3 py-2 border ${
                        errors.description?.english ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-2`}
                    />

                {errors.description?.english && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.description.english.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hindi Description
                </label>
                <FieldWithIcon icon={FiGlobe}>
                 <textarea
                    {...registerWithRef('description.hindi')}
                    rows={3}
                    placeholder="विवरण हिंदी में (Auto-filled on Tab)"
                    onKeyDown={(e) =>
                        handleKeyDown(e, 'description.hindi', 'description.punjabi')
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2"
                    />

                </FieldWithIcon>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punjabi Description
                </label>
                <FieldWithIcon icon={FiGlobe}>
                  <textarea
                    {...register('description.punjabi')}
                    placeholder="ਵੇਰਵਾ ਪੰਜਾਬੀ ਵਿੱਚ (Auto-filled on Tab)"
                    rows="3"
                    onKeyDown={(e) => handleKeyDown(e, 'description.punjabi', 'dosage.english')}
                    onBlur={() => handleBlur('description.punjabi')}
                    ref={fieldRefs.current['description.punjabi']}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FieldWithIcon>
              </div>
            </div>
          </div>

          {/* Dosage Information - Auto-translate on Tab */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-700 flex items-center">
                <FiGlobe className="h-4 w-4 mr-2" />
                Dosage Information
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Press Tab from English to auto-translate
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <RequiredLabel>English Dosage</RequiredLabel>
                <input
                {...registerWithRef('dosage.english', { 
                    required: 'English dosage is required',
                    minLength: {
                    value: 5,
                    message: 'Dosage must be at least 5 characters'
                    }
                })}
                placeholder="e.g., 500mg every 6 hours (Press Tab to translate)"
                onKeyDown={(e) =>
                    handleKeyDown(e, 'dosage.english', 'dosage.hindi')
                }
                onBlur={() => handleBlur('dosage.english')}
                className={`w-full px-3 py-2 border ${
                    errors.dosage?.english
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                } rounded-md focus:ring-2 focus:border-transparent`}
                />

                {errors.dosage?.english && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <FiAlertCircle className="h-4 w-4 mr-1" />
                    {errors.dosage.english.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hindi Dosage
                </label>
                <FieldWithIcon icon={FiGlobe}>
                  <input
                    {...register('dosage.hindi')}
                    placeholder="जैसे, 500mg हर 6 घंटे में (Auto-filled on Tab)"
                    onKeyDown={(e) => handleKeyDown(e, 'dosage.hindi', 'dosage.punjabi')}
                    onBlur={() => handleBlur('dosage.hindi')}
                    ref={fieldRefs.current['dosage.hindi']}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FieldWithIcon>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Punjabi Dosage
                </label>
                <FieldWithIcon icon={FiGlobe}>
                  <input
                    {...register('dosage.punjabi')}
                    placeholder="ਜਿਵੇਂ, 500mg ਹਰ 6 ਘੰਟਿਆਂ ਬਾਅਦ (Auto-filled on Tab)"
                    onKeyDown={(e) => handleKeyDown(e, 'dosage.punjabi', 'priceMin')}
                    onBlur={() => handleBlur('dosage.punjabi')}
                    ref={fieldRefs.current['dosage.punjabi']}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FieldWithIcon>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4 mb-8">
            <h4 className="text-md font-medium text-gray-700">Price Range (INR)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Price
                </label>
                <input
                  type="number"
                  {...register('priceMin', {
                    min: {
                      value: 0,
                      message: 'Price cannot be negative'
                    }
                  })}
                  placeholder="e.g., 10"
                  onKeyDown={(e) => handleKeyDown(e, 'priceMin', 'priceMax')}
                  onBlur={() => handleBlur('priceMin')}
                  ref={fieldRefs.current.priceMin}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.priceMin && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceMin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Price
                </label>
                <input
                  type="number"
                  {...register('priceMax', {
                    min: {
                      value: 0,
                      message: 'Price cannot be negative'
                    },
                    validate: (value, { priceMin }) => {
                      if (parseFloat(value) < parseFloat(priceMin || 0)) {
                        return 'Maximum price must be greater than minimum price';
                      }
                      return true;
                    }
                  })}
                  placeholder="e.g., 100"
                  onKeyDown={(e) => handleKeyDown(e, 'priceMax', 'storageInstructions')}
                  onBlur={() => handleBlur('priceMax')}
                  ref={fieldRefs.current.priceMax}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.priceMax && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceMax.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Forms */}
          <div className="space-y-4 mb-8">
            <h4 className="text-md font-medium text-gray-700">Available Forms</h4>
            <div className="flex flex-wrap gap-2">
              {availableForms.map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => handleFormToggle(form)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center ${
                    selectedForms.includes(form)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {form.charAt(0).toUpperCase() + form.slice(1)}
                  {selectedForms.includes(form) && (
                    <FiCheckCircle className="ml-2 h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('availableForms')} value={selectedForms} />
          </div>

          {/* Medical Information */}
          <div className="space-y-4 mb-8">
            <h4 className="text-md font-medium text-gray-700">Medical Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Side Effects (comma separated)
                </label>
                <textarea
                  {...register('sideEffects')}
                  placeholder="e.g., nausea, dizziness, headache"
                  rows="2"
                  onKeyDown={(e) => handleKeyDown(e, 'sideEffects', 'precautions')}
                  onBlur={() => handleBlur('sideEffects')}
                  ref={fieldRefs.current.sideEffects}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precautions (comma separated)
                </label>
                <textarea
                  {...register('precautions')}
                  placeholder="e.g., take with food, avoid alcohol"
                  rows="2"
                  onKeyDown={(e) => handleKeyDown(e, 'precautions', 'contraindications')}
                  onBlur={() => handleBlur('precautions')}
                  ref={fieldRefs.current.precautions}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Instructions
                </label>
                <input
                  {...register('storageInstructions')}
                  placeholder="e.g., Store at room temperature"
                  onKeyDown={(e) => handleKeyDown(e, 'storageInstructions', 'interactions')}
                  onBlur={() => handleBlur('storageInstructions')}
                  ref={fieldRefs.current.storageInstructions}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraindications (comma separated)
                </label>
                <textarea
                  {...register('contraindications')}
                  placeholder="e.g., liver disease, pregnancy"
                  rows="2"
                  onKeyDown={(e) => handleKeyDown(e, 'contraindications', 'requiresPrescription')}
                  onBlur={() => handleBlur('contraindications')}
                  ref={fieldRefs.current.contraindications}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Interactions (comma separated)
                </label>
                <textarea
                  {...register('interactions')}
                  placeholder="e.g., alcohol, anticoagulants"
                  rows="2"
                  onKeyDown={(e) => handleKeyDown(e, 'interactions', 'status')}
                  onBlur={() => handleBlur('interactions')}
                  ref={fieldRefs.current.interactions}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Prescription & Status */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  {...register('requiresPrescription')}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="requiresPrescription" className="text-sm font-medium text-gray-700">
                  Requires Prescription
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  onKeyDown={(e) => handleKeyDown(e, 'status', null)}
                  ref={fieldRefs.current.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md
                            hover:from-blue-700 hover:to-teal-600 disabled:opacity-50
                            disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center"
                >
                {loading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Saving...
                    </>
                ) : (
                    <>
                    {medicine ? 'Update Medicine' : 'Add Medicine'}
                    <FiArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
                </button>

          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Keyboard Shortcuts:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mr-2">Tab</kbd>
                  <span>Next field / Auto-translate</span>
                </div>
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mr-2">Shift+Tab</kbd>
                  <span>Previous field</span>
                </div>
                <div className="flex items-center">
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mr-2">Enter</kbd>
                  <span>Submit form (last field)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default MedicineForm;