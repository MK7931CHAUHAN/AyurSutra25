// components/admin/MedicineDetails.jsx
import React from 'react';
import { 
  FiX, FiEdit, FiTrash2, FiPackage, FiGlobe, 
  FiDroplet, FiAlertCircle, FiCheckCircle, 
  FiDollarSign, FiBox, FiInfo, FiFileText 
} from 'react-icons/fi';

const MedicineDetails = ({ medicine, onClose, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      discontinued: { color: 'bg-red-100 text-red-800', icon: FiX },
      out_of_stock: { color: 'bg-yellow-100 text-yellow-800', icon: FiAlertCircle }
    };
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <FiPackage className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Medicine Details</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <FiEdit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiInfo className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  {getStatusBadge(medicine.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Medicine Name</p>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Generic Name</p>
                    <p className="font-medium text-gray-900">{medicine.genericName || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Brand Name</p>
                    <p className="font-medium text-gray-900">{medicine.brandName || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-medium text-gray-900 capitalize">{medicine.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Active Ingredient</p>
                    <p className="font-medium text-gray-900">{medicine.activeIngredient}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Prescription Required</p>
                    <p className="font-medium text-gray-900">
                      {medicine.requiresPrescription ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Multilingual Descriptions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <FiGlobe className="h-5 w-5 mr-2 text-green-600" />
                  Descriptions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">English</span>
                    </div>
                    <p className="text-gray-800">
                      {medicine.description?.english || 'No description'}
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Hindi</span>
                    </div>
                    <p className="text-gray-800">
                      {medicine.description?.hindi || 'No description'}
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Punjabi</span>
                    </div>
                    <p className="text-gray-800">
                      {medicine.description?.punjabi || 'No description'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dosage Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <FiDroplet className="h-5 w-5 mr-2 text-purple-600" />
                  Dosage Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">English Dosage</p>
                    <p className="font-medium text-gray-900">{medicine.dosage?.english || 'Not specified'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Hindi Dosage</p>
                    <p className="font-medium text-gray-900">{medicine.dosage?.hindi || 'Not specified'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Punjabi Dosage</p>
                    <p className="font-medium text-gray-900">{medicine.dosage?.punjabi || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Price & Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <FiDollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Price Information
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    {medicine.priceRange ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Minimum Price</span>
                          <span className="text-lg font-bold text-green-700">
                            ₹{medicine.priceRange.min}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Maximum Price</span>
                          <span className="text-lg font-bold text-green-700">
                            ₹{medicine.priceRange.max}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Currency</span>
                          <span className="text-sm font-medium text-gray-900">
                            {medicine.priceRange.currency}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600">No price information available</p>
                    )}
                  </div>
                </div>

                {/* Available Forms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <FiBox className="h-5 w-5 mr-2 text-blue-600" />
                    Available Forms
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    {medicine.availableForms && medicine.availableForms.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {medicine.availableForms.map((form, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-200"
                          >
                            {form}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No forms specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <FiFileText className="h-5 w-5 mr-2 text-red-600" />
                  Medical Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicine.sideEffects && medicine.sideEffects.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Side Effects</p>
                      <div className="flex flex-wrap gap-1">
                        {medicine.sideEffects.map((effect, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-gray-700 rounded text-sm">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicine.precautions && medicine.precautions.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Precautions</p>
                      <div className="flex flex-wrap gap-1">
                        {medicine.precautions.map((precaution, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-gray-700 rounded text-sm">
                            {precaution}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicine.contraindications && medicine.contraindications.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Contraindications</p>
                      <div className="flex flex-wrap gap-1">
                        {medicine.contraindications.map((contra, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-gray-700 rounded text-sm">
                            {contra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicine.interactions && medicine.interactions.length > 0 && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Drug Interactions</p>
                      <div className="flex flex-wrap gap-1">
                        {medicine.interactions.map((interaction, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-gray-700 rounded text-sm">
                            {interaction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {medicine.storageInstructions && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Storage Instructions</p>
                      <p className="text-gray-800">{medicine.storageInstructions}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium mb-1">Created At</p>
                    <p>{formatDate(medicine.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Updated At</p>
                    <p>{formatDate(medicine.updatedAt)}</p>
                  </div>
                  {medicine.createdBy && (
                    <div>
                      <p className="font-medium mb-1">Created By</p>
                      <p>{medicine.createdBy.name || medicine.createdBy.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;