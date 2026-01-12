import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaUserInjured, FaUserMd, FaCalendarCheck, 
  FaUsers, FaSearch, FaFilter 
} from "react-icons/fa";
import api from "../../services/api";

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredResults, setFilteredResults] = useState({});

  useEffect(() => {
    if (location.state?.results) {
      setResults(location.state.results);
      setQuery(location.state.query);
      filterResults(location.state.results);
    } else {
      // If no state, get query from URL
      const searchParams = new URLSearchParams(location.search);
      const q = searchParams.get('q');
      if (q) {
        performSearch(q);
      }
    }
  }, [location]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const res = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data.results);
      setQuery(searchQuery);
      filterResults(res.data.results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = (allResults) => {
    const filtered = {};
    
    if (allResults.patients?.length > 0) {
      filtered.patients = allResults.patients;
    }
    
    if (allResults.doctors?.length > 0) {
      filtered.doctors = allResults.doctors;
    }
    
    if (allResults.appointments?.length > 0) {
      filtered.appointments = allResults.appointments;
    }
    
    if (allResults.users?.length > 0) {
      filtered.users = allResults.users;
    }
    
    setFilteredResults(filtered);
  };

  const getCount = (category) => {
    return results?.[category]?.length || 0;
  };

  const totalResults = results ? 
    getCount('patients') + getCount('doctors') + 
    getCount('appointments') + getCount('users') : 0;

  const renderResults = () => {
    if (activeTab === "all") {
      return (
        <>
          {filteredResults.patients && renderPatientResults()}
          {filteredResults.doctors && renderDoctorResults()}
          {filteredResults.appointments && renderAppointmentResults()}
          {filteredResults.users && renderUserResults()}
        </>
      );
    }

    switch(activeTab) {
      case 'patients': return renderPatientResults();
      case 'doctors': return renderDoctorResults();
      case 'appointments': return renderAppointmentResults();
      case 'users': return renderUserResults();
      default: return null;
    }
  };

  const renderPatientResults = () => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FaUserInjured className="text-blue-500 text-xl" />
        <h3 className="text-xl font-semibold">Patients ({getCount('patients')})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.patients.map((patient, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/patients/${patient._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md 
              cursor-pointer border border-gray-200 dark:border-gray-700 
              hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 
                flex items-center justify-center">
                <FaUserInjured className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium" dangerouslySetInnerHTML={{ 
                  __html: patient.fullName 
                }} />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: <span dangerouslySetInnerHTML={{ __html: patient.patientId }} />
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="font-medium">Phone:</span> 
                <span dangerouslySetInnerHTML={{ __html: patient.phone || 'N/A' }} />
              </p>
              <p><span className="font-medium">Email:</span> 
                <span dangerouslySetInnerHTML={{ __html: patient.email || 'N/A' }} />
              </p>
              {patient.gender && (
                <p><span className="font-medium">Gender:</span> {patient.gender}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctorResults = () => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FaUserMd className="text-green-500 text-xl" />
        <h3 className="text-xl font-semibold">Doctors ({getCount('doctors')})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.doctors.map((doctor, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/doctors/${doctor._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md 
              cursor-pointer border border-gray-200 dark:border-gray-700 
              hover:border-green-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 
                flex items-center justify-center">
                <FaUserMd className="text-green-500" />
              </div>
              <div>
                <h4 className="font-medium" dangerouslySetInnerHTML={{ 
                  __html: doctor.user?.name || 'Doctor' 
                }} />
                <p className="text-sm text-gray-600 dark:text-gray-400" 
                  dangerouslySetInnerHTML={{ 
                    __html: doctor.specialization 
                  }} 
                />
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="font-medium">Department:</span> 
                <span dangerouslySetInnerHTML={{ __html: doctor.department }} />
              </p>
              <p><span className="font-medium">Qualification:</span> 
                {doctor.qualification || 'N/A'}
              </p>
              {doctor.consultationFee && (
                <p className="font-medium text-green-600">
                  Fee: ₹{doctor.consultationFee}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppointmentResults = () => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarCheck className="text-purple-500 text-xl" />
        <h3 className="text-xl font-semibold">Appointments ({getCount('appointments')})</h3>
      </div>
      <div className="space-y-4">
        {results.appointments.map((appointment, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/appointments/${appointment._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md 
              cursor-pointer border border-gray-200 dark:border-gray-700 
              hover:border-purple-300 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    <span dangerouslySetInnerHTML={{ __html: appointment.status }} />
                  </span>
                  {appointment.type && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium 
                      bg-blue-100 text-blue-800">
                      {appointment.type}
                    </span>
                  )}
                </div>
                <h4 className="font-medium">Appointment Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Patient: <span dangerouslySetInnerHTML={{ 
                    __html: appointment.patient?.fullName || 'Unknown' 
                  }} />
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{appointment.time}</p>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm" dangerouslySetInnerHTML={{ 
                  __html: appointment.notes 
                }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserResults = () => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FaUsers className="text-orange-500 text-xl" />
        <h3 className="text-xl font-semibold">Users ({getCount('users')})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.users.map((user, index) => (
          <div 
            key={index}
            onClick={() => navigate(`/admin/users/${user._id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow hover:shadow-md 
              cursor-pointer border border-gray-200 dark:border-gray-700 
              hover:border-orange-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 
                flex items-center justify-center">
                <FaUsers className="text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium" dangerouslySetInnerHTML={{ 
                  __html: user.name 
                }} />
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <p><span className="font-medium">Email:</span> 
                <span dangerouslySetInnerHTML={{ __html: user.email }} />
              </p>
              <p><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs
                  ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`}
                >
                  {user.status}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 
              flex items-center justify-center">
              <FaSearch className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {totalResults} results found for "{query}"
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === "all" 
                ? "bg-gradient-to-r from-green-500 to-blue-500 text-white" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
            >
              All ({totalResults})
            </button>
            
            {getCount('patients') > 0 && (
              <button
                onClick={() => setActiveTab("patients")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === "patients" 
                  ? "bg-blue-500 text-white" 
                  : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}
              >
                <FaUserInjured /> Patients ({getCount('patients')})
              </button>
            )}
            
            {getCount('doctors') > 0 && (
              <button
                onClick={() => setActiveTab("doctors")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === "doctors" 
                  ? "bg-green-500 text-white" 
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"}`}
              >
                <FaUserMd /> Doctors ({getCount('doctors')})
              </button>
            )}
            
            {getCount('appointments') > 0 && (
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === "appointments" 
                  ? "bg-purple-500 text-white" 
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"}`}
              >
                <FaCalendarCheck /> Appointments ({getCount('appointments')})
              </button>
            )}
            
            {getCount('users') > 0 && (
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeTab === "users" 
                  ? "bg-orange-500 text-white" 
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"}`}
              >
                <FaUsers /> Users ({getCount('users')})
              </button>
            )}
          </div>

          {/* Search Again */}
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch(query)}
              placeholder="Search again..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 
                rounded-xl bg-gray-50 dark:bg-gray-700 
                focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => performSearch(query)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 
                text-white rounded-xl hover:opacity-90 transition-opacity 
                flex items-center gap-2"
            >
              <FaSearch /> Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {results ? (
            renderResults()
          ) : (
            <div className="text-center py-12">
              <FaSearch className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No search performed yet
              </h3>
              <p className="text-gray-500">
                Enter a search term above to find patients, doctors, appointments, or users
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;