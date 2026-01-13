// pages/Users.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUserPlus, FaEdit, FaTrash, FaEye,
  FaSearch, FaFilter, FaUserMd, FaUserGraduate,
  FaUserShield, FaKey, FaCopy, FaCheck, FaHandHoldingMedical, 
  FaPhone, FaEnvelope, FaCalendar, FaIdCard, FaUserInjured,
  FaTimes, FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaUser, FaStethoscope,  FaThLarge,
  FaSpa, FaList, FaLock, FaUnlock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    role: 'patient',
    bio: '',
    photo: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [searchHighlight, setSearchHighlight] = useState('');
  const [roleTypes, setRoleTypes] = useState([]);
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch role types
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/users/meta');
        setRoleTypes(res.data.roleTypes || ['admin', 'doctor', 'therapist', 'patient']);
      } catch (err) {
        console.error('Failed to fetch meta:', err);
        setRoleTypes(['admin', 'doctor', 'therapist', 'patient']);
      }
    };
    fetchMeta();
  }, []);

  // Filter and sort users when dependencies change
  useEffect(() => {
    let result = [...users];
    let highlightTerm = '';

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      highlightTerm = searchLower;
      
      result = result.filter(user => {
        const nameMatch = user.name?.toLowerCase().includes(searchLower);
        const emailMatch = user.email?.toLowerCase().includes(searchLower);
        const phoneMatch = user.phone?.toLowerCase().includes(searchLower);
        const roleMatch = user.role?.toLowerCase().includes(searchLower);
        
        if (searchLower === 'doctor' && user.role === 'doctor') {
          return true;
        }
        
        return nameMatch || emailMatch || phoneMatch || roleMatch;
      });
    }

    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
    setSearchHighlight(highlightTerm);
    setCurrentPage(1);
  }, [searchTerm, filterRole, users, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get("/users");
      // Map phone to number for frontend compatibility
      const usersWithNumber = response.data.map(user => ({
        ...user,
        number: user.phone || ''
      }));
      setUsers(usersWithNumber);
      setFilteredUsers(usersWithNumber);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please check your API endpoint.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      if (start > 1) {
        pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      }
      
      if (end < totalPages) {
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill remaining characters
    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    setFormData(prev => ({ ...prev, password }));
    return password;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
    toast.success('Copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.number ? formData.number.trim() : '',
        role: formData.role,
        bio: formData.bio || '',
        photo: formData.photo || '',
        password: formData.password || ''
      };
      
      if (!editingUser && !userData.password) {
        const generatedPass = generatePassword();
        userData.password = generatedPass;
      }

      if (editingUser) {
        if (!userData.password || userData.password === '') {
          delete userData.password;
        }
        
        await api.put(`/users/${editingUser._id}`, userData);
        alert('User updated successfully!');
      } else {
        console.log('Creating user with data:', userData);
        
        const response = await api.post('/auth/register', userData);
        
        if (response.data.success) {
          alert('User created successfully!');
          
          if (userData.password) {
            const message = `✅ User Created Successfully!\n\n📋 Login Credentials:\n📧 Email: ${userData.email}\n🔑 Password: ${userData.password}\n\n⚠️ Save these credentials for login.`;
            alert(message);
            
            navigator.clipboard.writeText(`Email: ${userData.email}\nPassword: ${userData.password}`);
            toast.success('Credentials copied to clipboard!', {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }
      }

      resetForm();
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving user:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save user';
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test Login Function
  const testUserLogin = async (user) => {
    try {
      const userPassword = prompt(`Enter password for ${user.name} (${user.email}):`, '');
      if (!userPassword) return;
      
      console.log('Testing login for:', user.email, 'with password:', userPassword);
      
      const response = await api.post('/auth/login', {
        identifier: user.email,
        password: password
      });
      
      if (response.data.success) {
        toast.success(`Login successful! Token generated.`, {
          position: "top-right",
          autoClose: 3000,
        });
        alert(`✅ Login successful!\n\nUser: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}\n\nToken generated successfully!`);
      }
    } catch (error) {
      console.error('Test login failed:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Login failed';
      
      toast.error(`Login failed: ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
      
      alert(`❌ Login failed: ${errorMsg}\n\nPlease check:\n1. Password is correct\n2. User is active\n3. Email is in lowercase`);
      
      // Try with phone if available
      if (user.phone) {
        const tryPhone = confirm(`Login with email failed. Try with phone number: ${user.phone}?`);
        if (tryPhone) {
          try {
            const phoneResponse = await api.post('/auth/login', {
              identifier: user.phone,
              password: password
            });
            
            if (phoneResponse.data.success) {
              toast.success('Login successful with phone!', {
                position: "top-right",
                autoClose: 3000,
              });
              alert(`✅ Login successful with phone!\n\nUser can login with phone number: ${user.phone}`);
            }
          } catch (phoneError) {
            console.error('Phone login also failed:', phoneError.response?.data);
            toast.error('Phone login also failed', {
              position: "top-right",
              autoClose: 3000,
            });
          }
        }
      }
    }
  };

  // Toggle User Active/Inactive
  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const response = await api.put(`/users/${user._id}`, {
        isActive: newStatus
      });
      
      if (response.data.success) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      number: user.phone || '',
      role: user.role,
      bio: user.bio || '',
      photo: user.photo || '',
      password: ''
    });
    setGeneratedPassword('');
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${selectedUser._id}`);
      alert('User deleted successfully!');
      fetchUsers();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      number: '',
      role: 'patient',
      bio: '',
      photo: '',
      password: ''
    });
    setGeneratedPassword('');
    setEditingUser(null);
    setPasswordVisibility(false);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "admin": return <FaUserShield className="w-4 h-4" />;
      case "doctor": return <FaStethoscope className="w-4 h-4" />;
      case "therapist": return <FaSpa className="w-4 h-4" />;
      case "patient": return <FaUserInjured className="w-4 h-4" />;
      default: return <FaUser className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    const isDoctorSearch = searchTerm.toLowerCase() === 'doctor' && role === 'doctor';
    switch (role) {
      case 'admin': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-purple-100 text-purple-800 border-purple-200';
      case 'doctor': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patient': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-green-100 text-green-800 border-green-200';
      case 'therapist': 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-pink-100 text-pink-800 border-pink-200'; 
      default: 
        return isDoctorSearch 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleBadge = (role) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
      {getRoleIcon(role)}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const extractNumbers = (text) => {
    if (!text) return '';
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.join('') : '';
  };

  const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 px-1 py-0.5 rounded font-medium">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const UserAvatar = ({ user, size = 'md' }) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg',
      xl: 'w-24 h-24 text-xl'
    };

    if (user.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name}
          className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      );
    }

    const initials = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const colors = ['bg-linear-to-br from-emerald-500 to-emerald-700', 
                    'bg-linear-to-br from-blue-500 to-blue-700', 
                    'bg-linear-to-br from-purple-500 to-purple-700', 
                    'bg-linear-to-br from-amber-500 to-amber-700', 
                    'bg-linear-to-br from-rose-500 to-rose-700'];
    const colorIndex = user.name.length % colors.length;

    return (
      <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}>
        {initials}
      </div>
    );
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {currentUsers.map((user) => (
        <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <UserAvatar user={user} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="mb-3">
              {getRoleBadge(user.role)}
              <div className="mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaCalendar className="w-3 h-3" />
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.isActive ? <FaUnlock className="w-2 h-2" /> : <FaLock className="w-2 h-2" />}
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleView(user)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View"
                >
                  <FaEye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleEdit(user)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleUserStatus(user)}
                  className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                  title={user.isActive ? 'Deactivate' : 'Activate'}
                >
                  {user.isActive ? <FaLock className="w-3.5 h-3.5" /> : <FaUnlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table View Component
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <button 
                onClick={() => handleSort('name')}
                className="flex items-center gap-2 hover:text-gray-900 focus:outline-none"
              >
                User
                {sortConfig.key === 'name' && (
                  sortConfig.direction === 'ascending' ? 
                  <FaArrowUp className="w-3 h-3" /> : 
                  <FaArrowDown className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <button 
                onClick={() => handleSort('createdAt')}
                className="flex items-center gap-2 hover:text-gray-900 focus:outline-none"
              >
                Member Since
                {sortConfig.key === 'createdAt' && (
                  sortConfig.direction === 'ascending' ? 
                  <FaArrowUp className="w-3 h-3" /> : 
                  <FaArrowDown className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentUsers.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="sm" />
                  <div>
                    <div className="font-medium text-gray-900">
                      <HighlightText text={user.name} highlight={searchHighlight} />
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user._id?.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900">
                  {user.phone ? (
                    <HighlightText text={user.phone} highlight={searchHighlight} />
                  ) : (
                    'Not provided'
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <HighlightText text={user.email} highlight={searchHighlight} />
                </div>
              </td>
              <td className="px-6 py-4">
                {getRoleBadge(user.role)}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.isActive ? <FaUnlock className="w-2 h-2" /> : <FaLock className="w-2 h-2" />}
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-gray-900 font-medium">
                  {formatDate(user.createdAt)}
                </div>
                <div className="text-xs text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testUserLogin(user)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    title="Test Login"
                  >
                    <FaKey className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleView(user)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Quick View"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
                    title="Edit User"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${user.isActive ? 'text-gray-600 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive ? <FaLock className="w-4 h-4" /> : <FaUnlock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete User"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium animate-pulse">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaUserPlus className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {currentUsers.length} of {filteredUsers.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaUserGraduate className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.isActive).length}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((users.filter(u => u.isActive).length / users.length) * 100).toFixed(1)}% active
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FaUnlock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'doctor').length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FaUserMd className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Therapists</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'therapist').length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <FaHandHoldingMedical className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'patient').length}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <FaUserInjured className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-red-500 flex shrink-0" />
              <div>
                <p className="text-red-700 font-medium">API Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={fetchUsers}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                >
                  <option value="all">All Roles</option>
                  {roleTypes.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <FaThLarge  className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List View"
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaUserGraduate className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm || filterRole !== 'all' ? 'No matching users found' : 'No users found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results for "${searchTerm}"` : 'Try adding new users or check your API connection'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                Clear search & filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? <GridView /> : <TableView />}
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(indexOfLastItem, filteredUsers.length)}
                </span>{" "}
                of <span className="font-semibold">{filteredUsers.length}</span> users
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                {getPaginationNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : typeof pageNum === 'number'
                        ? 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        : 'text-gray-400 cursor-default'
                    }`}
                    disabled={typeof pageNum !== 'number'}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => { setShowModal(false); resetForm(); }}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {editingUser && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaIdCard className="w-4 h-4" />
                      <span className="font-mono">User ID: {editingUser._id}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                    >
                      <option value="" disabled>Select role</option>
                      {roleTypes.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                      placeholder="Tell us about this user..."
                    />
                  </div>

                  {/* Password Field */}
                  {(!editingUser || formData.password) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {editingUser ? '(Leave empty to keep current)' : '*'}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={passwordVisibility ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                            placeholder={editingUser ? "Enter new password (optional)" : "Enter password or generate one"}
                            required={!editingUser}
                          />
                          <button
                            type="button"
                            onClick={() => setPasswordVisibility(!passwordVisibility)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {passwordVisibility ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {!editingUser && (
                          <>
                            <button
                              type="button"
                              onClick={generatePassword}
                              className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2"
                            >
                              <FaKey className="w-4 h-4" />
                              <span>Generate</span>
                            </button>
                            {(formData.password || generatedPassword) && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(formData.password || generatedPassword)}
                                className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                                title="Copy to clipboard"
                              >
                                {copiedPassword ? (
                                  <FaCheck className="w-4 h-4 text-green-500" />
                                ) : (
                                  <FaCopy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Password strength:</span>
                            <span className={`text-xs font-medium ${
                              formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formData.password.length >= 8 ? 'Strong' : 'Weak'}
                            </span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                formData.password.length >= 12 ? 'bg-green-500' :
                                formData.password.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, (formData.password.length / 12) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal with Test Login Button */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowViewModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <UserAvatar user={selectedUser} size="xl" />
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedUser.name}</h3>
                    <div className="mb-3">
                      {getRoleBadge(selectedUser.role)}
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedUser.isActive ? <FaUnlock className="w-2 h-2" /> : <FaLock className="w-2 h-2" />}
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FaEnvelope className="w-4 h-4" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaIdCard className="w-4 h-4" />
                      <span className="font-mono text-sm">ID: {selectedUser._id}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaPhone className="w-4 h-4" />
                      <span className="text-sm font-medium">Phone Number</span>
                    </div>
                    <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    {selectedUser.phone && (
                      <p className="text-sm text-gray-600 mt-1">
                        Numbers: {extractNumbers(selectedUser.phone)}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaCalendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Member Since</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatFullDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaCalendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Last Updated</span>
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatFullDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <FaIdCard className="w-4 h-4" />
                      <span className="text-sm font-medium">User ID</span>
                    </div>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {selectedUser._id}
                    </p>
                    <button
                      onClick={() => copyToClipboard(selectedUser._id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Copy ID to clipboard
                    </button>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Bio</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => testUserLogin(selectedUser)}
                      className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded-xl hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2"
                    >
                      <FaKey className="w-3 h-3" />
                      <span>Test Login</span>
                    </button>
                    <button
                      onClick={() => toggleUserStatus(selectedUser)}
                      className={`px-4 py-2 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2 ${selectedUser.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-500' : 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'}`}
                    >
                      {selectedUser.isActive ? <FaLock className="w-3 h-3" /> : <FaUnlock className="w-3 h-3" />}
                      <span>{selectedUser.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedUser);
                      }}
                      className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Edit User</span>
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTrash className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Delete User</h2>
                
                <div className="my-6">
                  <UserAvatar user={selectedUser} size="lg" className="mx-auto mb-4" />
                  <div className="text-center mb-4">
                    <p className="text-gray-800 font-medium">{selectedUser.name}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedUser._id.substring(0, 12)}...</p>
                  </div>
                  <p className="text-gray-600">
                    Are you sure you want to delete this user?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This action cannot be undone. All data associated with this user will be permanently removed.
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Yes, Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;