import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, RefreshCw, Users, AlertCircle, ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import LawyerClientsModal from "./common/LawyerClientsModal";

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const response = await axios.get(`${API_URL}/lawyers`);``
    setLawyers(Array.isArray(response.data) ? response.data : []);
  };

  const fetchAppointments = async () => {
    const response = await axios.get(`${API_URL}/appointments`);
    setAppointments(Array.isArray(response.data) ? response.data : []);
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

  const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLawyers = filteredLawyers.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const totalLawyers = lawyers.length;
  const pendingCount = lawyers.filter(l => l?.verification !== "Approved").length;
  const approvedCount = lawyers.filter(l => l?.verification === "Approved").length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSpecializationFilter("all");
  };

  const handleCardClick = (lawyer) => setSelectedLawyer(lawyer);
  const handleCloseModal = () => setSelectedLawyer(null);

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
          <button onClick={() => fetchData()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{totalLawyers} Total Lawyers</span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">{pendingCount} Pending</span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{approvedCount} Approved</span>
        </div>
        <button onClick={() => fetchData(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search lawyers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
        <select value={specializationFilter} onChange={(e) => setSpecializationFilter(e.target.value)} className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Specializations</option>
          {allSpecializations.map((spec) => (<option key={spec} value={spec}>{spec}</option>))}
        </select>
        {(searchQuery || statusFilter !== "all" || specializationFilter !== "all") && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Clear</button>
        )}
      </div>

      {filteredLawyers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No lawyers found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3">Lawyer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Specialization</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Appointments</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedLawyers.map((lawyer) => {
                  const appointmentCount = lawyerAppointmentCounts[lawyer._id] || 0;
                  const specializations = lawyer.specializations || [];
                  return (
                    <tr key={lawyer._id} onClick={() => handleCardClick(lawyer)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={lawyer.profileImage?.url || lawyer.profileImage || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={lawyer.name || "Lawyer"} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          <span className="font-medium text-gray-800">{lawyer.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{lawyer.email || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{lawyer.phone || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{specializations.length > 0 ? specializations.slice(0, 2).join(", ") : "General"}</td>
                      <td className="px-4 py-3 text-gray-600">{lawyer.experience ? `${lawyer.experience} Yrs` : "Fresher"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointmentCount > 10 ? "bg-green-100 text-green-800" : appointmentCount > 5 ? "bg-emerald-100 text-emerald-800" : appointmentCount > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                          <CalendarCheck size={12} className="mr-1" />{appointmentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lawyer.verification === "Approved" ? "bg-green-100 text-green-800" : lawyer.verification === "Pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {lawyer.verification || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-sm text-gray-600">Showing {startIndex + 1} to {Math.min(endIndex, filteredLawyers.length)} of {filteredLawyers.length} entries</div>
              <div className="flex items-center gap-2">
                <button onClick={goToPrevPage} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                      {page}
                    </button>
                  ))}
                </div>
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50">
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedLawyer && <LawyerClientsModal lawyer={selectedLawyer} appointments={appointments} onClose={handleCloseModal} />}
    </div>
  );
}