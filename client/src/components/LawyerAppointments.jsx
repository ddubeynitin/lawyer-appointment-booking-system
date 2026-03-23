import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, RefreshCw, Users, AlertCircle } from "lucide-react";
import LawyerAppointmentCard from "./common/LawyerAppointmentCard";
import LawyerClientsModal from "./common/LawyerClientsModal";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function LawyerAppointments() {
  const [lawyers, setLawyers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);

  // Get all unique specializations from lawyers
  const allSpecializations = useMemo(() => {
    const specs = new Set();        
    lawyers.forEach((lawyer) => {
      if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
        lawyer.specializations.forEach((spec) => specs.add(spec));
      }
    });
    return Array.from(specs).sort();
  }, [lawyers]);

  const fetchLawyers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lawyers`, { timeout: 10000 });
      setLawyers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/appointments`, { timeout: 10000 });
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchLawyers(), fetchAppointments()]);
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate appointment count for each lawyer
  const lawyerAppointmentCounts = useMemo(() => {
    const counts = {};
    appointments.forEach((appointment) => {
      const lawyerId = appointment?.lawyerId?._id || appointment?.lawyerId;
      if (lawyerId) {
        counts[lawyerId] = (counts[lawyerId] || 0) + 1;
      }
    });
    return counts;
  }, [appointments]);

  // Filter lawyers based on search, status and specialization
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (lawyer.name || "").toLowerCase().includes(searchLower) ||
        (lawyer.email || "").toLowerCase().includes(searchLower) ||
        (lawyer.specializations || []).some(s => s.toLowerCase().includes(searchLower));

      const matchesStatus = statusFilter === "all" || lawyer.verification === statusFilter;

      const matchesSpecialization = specializationFilter === "all" || 
        (lawyer.specializations || []).includes(specializationFilter);

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [lawyers, searchQuery, statusFilter, specializationFilter]);

  const totalLawyers = lawyers.length;
  const pendingCount = lawyers.filter(l => l?.verification !== "Approved").length;
  const approvedCount = lawyers.filter(l => l?.verification === "Approved").length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSpecializationFilter("all");
  };

  const handleCardClick = (lawyer) => {
    setSelectedLawyer(lawyer);
  };

  const handleCloseModal = () => {
    setSelectedLawyer(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading lawyers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{totalLawyers} Total Lawyers</span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">{pendingCount} Pending</span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{approvedCount} Approved</span>
        </div>
        <button 
          onClick={() => fetchData(true)} 
          disabled={refreshing} 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> 
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search lawyers by name, email or specialization..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select 
          value={specializationFilter} 
          onChange={(e) => setSpecializationFilter(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Specializations</option>
          {allSpecializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {(searchQuery || statusFilter !== "all" || specializationFilter !== "all") && (
          <button 
            onClick={clearFilters} 
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Lawyer Cards Grid with 3 Rows and Vertical Scroll */}
      {filteredLawyers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No lawyers found.</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[600px] rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
            {filteredLawyers.map((lawyer) => {
              const appointmentCount = lawyerAppointmentCounts[lawyer._id] || 0;
              return (
                <LawyerAppointmentCard 
                  key={lawyer._id} 
                  lawyer={lawyer} 
                  appointmentCount={appointmentCount}
                  onClick={() => handleCardClick(lawyer)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Lawyer Clients Modal */}
      {selectedLawyer && (
        <LawyerClientsModal 
          lawyer={selectedLawyer} 
          appointments={appointments} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
