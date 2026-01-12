// components/admin/MedicinesPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, 
  FiFilter, FiDownload, FiRefreshCw, FiPackage,
  FiChevronLeft, FiChevronRight, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiGrid, FiList,
  FiChevronDown, FiMoreVertical, FiCopy, FiPrinter
} from 'react-icons/fi';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import MedicineForm from '../../../pages/doctorPages/MedicineForm';
import MedicineDetails from "../../../components/admin/Patients/MedicineDetails";

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const itemsPerPage = 4;

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, [currentPage, categoryFilter, statusFilter, searchTerm, sortBy, sortOrder]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder
      };

      const response = await api.get('/chatbot/medicines', { params });
      setMedicines(response.data.medicines);
      setTotalPages(response.data.pagination.pages);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/chatbot/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedMedicine(null);
    setShowForm(true);
  };

  const handleEdit = (medicine) => {
    setSelectedMedicine(medicine);
    setShowForm(true);
  };

  const handleDelete = async (medicine) => {
    try {
      await api.delete(`/chatbot/medicines/${medicine._id}`);
      toast.success(`${medicine.name} deleted successfully`);
      fetchMedicines();
      setShowDeleteConfirm(false);
      setMedicineToDelete(null);
      setSelectedMedicines([]);
    } catch (error) {
      console.error('Failed to delete medicine:', error);
      toast.error('Failed to delete medicine');
    }
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDetails(true);
  };

  const handleFormSuccess = (newMedicine) => {
    setShowForm(false);
    setSelectedMedicine(null);
    fetchMedicines();
    
    if (newMedicine) {
      toast.success(
        `${newMedicine.name} ${medicine ? 'updated' : 'added'} successfully!`,
        {
          duration: 3000,
          icon: '✅',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        }
      );
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedMedicine(null);
  };

  const handleSelectMedicine = (id) => {
    setSelectedMedicines(prev =>
      prev.includes(id)
        ? prev.filter(medId => medId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMedicines.length === medicines.length) {
      setSelectedMedicines([]);
    } else {
      setSelectedMedicines(medicines.map(med => med._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedMedicines.length) {
      toast.error('Please select medicines to delete');
      return;
    }
    
    try {
      await Promise.all(
        selectedMedicines.map(id => 
          api.delete(`/chatbot/medicines/${id}`)
        )
      );
      toast.success(`${selectedMedicines.length} medicines deleted successfully`);
      setSelectedMedicines([]);
      fetchMedicines();
    } catch (error) {
      console.error('Failed to delete medicines:', error);
      toast.error('Failed to delete selected medicines');
    }
  };



  const getStatusBadge = (status) => {
    const badges = {
      active: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <FiCheckCircle className="w-4 h-4" />,
        label: 'Active'
      },
      discontinued: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <FiXCircle className="w-4 h-4" />,
        label: 'Discontinued'
      },
      out_of_stock: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <FiAlertCircle className="w-4 h-4" />,
        label: 'Out of Stock'
      }
    };
    return badges[status] || badges.active;
  };

  const getCategoryColor = (category) => {
    const colors = {
      fever: 'from-red-500 to-red-600',
      headache: 'from-blue-500 to-blue-600',
      cough: 'from-teal-500 to-teal-600',
      vomiting: 'from-purple-500 to-purple-600',
      allergy: 'from-pink-500 to-pink-600',
      pain: 'from-orange-500 to-orange-600',
      antibiotic: 'from-indigo-500 to-indigo-600',
      antiviral: 'from-cyan-500 to-cyan-600',
      other: 'from-gray-500 to-gray-600'
    };
    return colors[category] || colors.other;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Grid View Card
  const MedicineCard = ({ medicine }) => {
    const statusBadge = getStatusBadge(medicine.status);
    const categoryColor = getCategoryColor(medicine.category);

    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${selectedMedicines.includes(medicine._id) ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="p-5">
          {/* Card Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedMedicines.includes(medicine._id)}
                onChange={() => handleSelectMedicine(medicine._id)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusBadge.color} border`}>
                {statusBadge.icon}
                <span className="ml-1">{statusBadge.label}</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleViewDetails(medicine)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(medicine)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Edit"
              >
                <FiEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMedicineToDelete(medicine);
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Medicine Info */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <div className={`h-10 w-10 rounded-lg bg-linear-to-r ${categoryColor} flex items-center justify-center mr-3`}>
                <FiPackage className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 truncate">{medicine.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{medicine.category}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {medicine.genericName && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Generic:</span>
                  <span className="text-sm text-gray-900">{medicine.genericName}</span>
                </div>
              )}
              {medicine.activeIngredient && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 w-24">Active:</span>
                  <span className="text-sm text-gray-900">{medicine.activeIngredient}</span>
                </div>
              )}
              {medicine.dosage?.english && (
                <div className="flex">
                  <span className="text-sm font-medium text-gray-700 w-24">Dosage:</span>
                  <span className="text-sm text-gray-900 flex-1">{medicine.dosage.english}</span>
                </div>
              )}
            </div>

            {/* Price */}
          {medicine.priceRange && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Price Range:
              </span>
              <span className="text-lg font-bold text-green-600">
                {medicine.priceRange && (
                  <div>₹{medicine.priceRange.min} - ₹{medicine.priceRange.max}</div>
                )}
              </span>
            </div>
          </div>
        )}
          </div>

          {/* Available Forms */}
          {medicine.availableForms && medicine.availableForms.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Available Forms:</p>
              <div className="flex flex-wrap gap-1">
                {medicine.availableForms.slice(0, 3).map((form, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {form}
                  </span>
                ))}
                {medicine.availableForms.length > 3 && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                    +{medicine.availableForms.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Table View Row
  const MedicineTableRow = ({ medicine }) => {
    const statusBadge = getStatusBadge(medicine.status);

    return (
      <tr className={`hover:bg-gray-50 ${selectedMedicines.includes(medicine._id) ? 'bg-blue-50' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={selectedMedicines.includes(medicine._id)}
            onChange={() => handleSelectMedicine(medicine._id)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-3">
              <FiPackage className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
              <div className="text-sm text-gray-500">{medicine.genericName}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="capitalize">{medicine.category}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {medicine.activeIngredient}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-24 justify-center ${statusBadge.color} border`}>
            {statusBadge.icon}
            <span className="ml-1">{statusBadge.label}</span>
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {medicine.priceRange && (
              <div>₹{medicine.priceRange.min} - ₹{medicine.priceRange.max}</div>
            )}

        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewDetails(medicine)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="View Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(medicine)}
              className="text-green-600 hover:text-green-900 p-1"
              title="Edit"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMedicineToDelete(medicine);
                setShowDeleteConfirm(true);
              }}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
            Delete Medicine
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <strong>"{medicineToDelete?.name}"</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(medicineToDelete)}
              className="px-6 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium flex items-center"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medicine Management</h1>
          </div>
          <button
            onClick={handleAddNew}
            className="mt-4 md:mt-0 px-6 py-3 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Add New Medicine
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiPackage className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {medicines.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {medicines.filter(m => m.status === 'out_of_stock').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FiAlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-blue-600">{selectedMedicines.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <FiFilter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search medicines by name, generic name, or ingredient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            {selectedMedicines.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete ({selectedMedicines.length})
              </button>
            )}

            <button
              onClick={fetchMedicines}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <FiRefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMedicines.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                {selectedMedicines.length} medicine{selectedMedicines.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedMedicines.length === medicines.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => setSelectedMedicines([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Medicines List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : medicines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiPackage className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Medicines Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
              ? 'Try changing your filters or search term'
              : 'Get started by adding your first medicine'}
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors font-medium flex items-center mx-auto"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Add New Medicine
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {medicines.map((medicine) => (
              <MedicineCard key={medicine._id} medicine={medicine} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedMedicines.length === medicines.length && medicines.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Medicine Name
                      {sortBy === 'name' && (
                        <FiChevronDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {sortBy === 'category' && (
                        <FiChevronDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Ingredient
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortBy === 'status' && (
                        <FiChevronDown className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => (
                  <MedicineTableRow key={medicine._id} medicine={medicine} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {medicines.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700 mb-4 md:mb-0">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalCount)}
            </span>{' '}
            of <span className="font-medium">{totalCount}</span> medicines
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 border border-gray-300 rounded-lg ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 border rounded-lg ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 border border-gray-300 rounded-lg ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full">
              <MedicineForm
                medicine={selectedMedicine}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedMedicine && (
        <MedicineDetails
          medicine={selectedMedicine}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false);
            handleEdit(selectedMedicine);
          }}
          onDelete={() => {
            setShowDetails(false);
            setMedicineToDelete(selectedMedicine);
            setShowDeleteConfirm(true);
          }}
        />
      )}

      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default MedicinesPage;