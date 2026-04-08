import React, { useState } from "react";
import { X, Shield, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function AdminActiveLawyerList({
  lawyers = [],
  onLawyerClick,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  // Filter only active lawyers (verification = "Approved")
  const activeLawyers = lawyers.filter(lawyer => lawyer.verification === "Approved");

  // Get unique specializations
  const allSpecializations = [...new Set(activeLawyers.flatMap(l => l.specializations || []))].sort();

  // Filter lawyers based on search and specialization
  const filteredLawyers = activeLawyers.filter((lawyer) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (lawyer.name || "").toLowerCase().includes(searchLower) ||
      (lawyer.email || "").toLowerCase().includes(searchLower) ||
      (lawyer.phone || "").toLowerCase().includes(searchLower) ||
      (lawyer.specializations || []).some(s => s.toLowerCase().includes(searchLower));

    const matchesSpecialization = specializationFilter === "all" || 
      (lawyer.specializations || []).includes(specializationFilter);

    return matchesSearch && matchesSpecialization;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSpecializationFilter("all");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return String(name).substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">Active Lawyers</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{activeLawyers.length} Approved</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, phone or specialization..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <select 
          value={specializationFilter} 
          onChange={(e) => setSpecializationFilter(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Specializations</option>
          {allSpecializations.map((spec) => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {(searchQuery || specializationFilter !== "all") && (
          <button onClick={clearFilters} className2 text-sm text-gray-="px-4 py-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {activeLawyers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <Shield className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No active lawyers found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lawyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLawyers.map((lawyer) => {
                  const specializations = lawyer.specializations || [];
                  
                  return (
                    <tr 
                      key={lawyer._id || lawyer.id} 
                      onClick={() => onLawyerClick && onLawyerClick(lawyer)}
                      className="hover:bg-green-50/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                            {getInitials(lawyer.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lawyer.name || "N/A"}</p>
                            <p className="text-xs text-gray-500">ID: {(lawyer._id || lawyer.id || "").slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{lawyer.email || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{lawyer.phone || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {specializations.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                              {spec}
                            </span>
                          ))}
                          {specializations.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{specializations.length - 2}
                            </span>
                          )}
                          {specializations.length === 0 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              General
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {lawyer.experience ? `${lawyer.experience} Yrs` : "Fresher"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700`}>
                          <CheckCircle size={12} />
                          Approved
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatDate(lawyer.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
