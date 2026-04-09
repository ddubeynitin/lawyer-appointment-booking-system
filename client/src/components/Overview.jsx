import React, { useState } from "react";
import { X, Users, Shield, Calendar, Search, CheckCircle, Clock, UserCheck, ClipboardList } from "lucide-react";
import AdminLawyerList from "./AdminLawyerList";
import AdminActiveLawyerList from "./AdminActiveLawyerList";
import AdminTodayAppointments from "./AdminTodayAppointments";

export default function Overview({
  usersCount = 0,
  lawyersCount = 0,
  activeLawyersCount = 0,
  todayAppointmentsCount = 0,
  onTodayAppointmentsCountChange,
  users = [],
  lawyers = [],
}) {
  const [showClientsTable, setShowClientsTable] = useState(false);
  const [showLawyersTable, setShowLawyersTable] = useState(false);
  const [showActiveLawyersTable, setShowActiveLawyersTable] = useState(false);
  const [showTodayAppointmentsTable, setShowTodayAppointmentsTable] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter only clients (role = "user")
  const clients = Array.isArray(users) ? users.filter(user => user.role === "user") : [];

  // Filter clients based on search and status
  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (client.name || "").toLowerCase().includes(searchLower) ||
      (client.email || "").toLowerCase().includes(searchLower) ||
      (client.phone || "").toLowerCase().includes(searchLower);

    const clientStatus = client.isActive !== false ? "Active" : "Inactive";
    const matchesStatus = statusFilter === "all" || clientStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeClients = clients.filter(c => c.isActive !== false).length;
  const inactiveClients = clients.filter(c => c.isActive === false).length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const getStatusColor = (status) => {
    if (status === "Active" || status === "Approved") return { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle };
    if (status === "Inactive") return { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };
    if (status === "Pending") return { bg: "bg-amber-100", text: "text-amber-700", icon: Clock };
    return { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };
  };

  const getRoleColor = (role) => {
    if (role === "lawyer") return "bg-emerald-100 text-emerald-700";
    if (role === "admin") return "bg-purple-100 text-purple-700";
    return "bg-blue-100 text-blue-700";
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
      month: "long",
      day: "numeric"
    });
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleShowClients = () => {
    setShowClientsTable(true);
    setShowLawyersTable(false);
    setShowActiveLawyersTable(false);
    setShowTodayAppointmentsTable(false);
  };

  const handleShowLawyers = () => {
    setShowLawyersTable(true);
    setShowClientsTable(false);
    setShowActiveLawyersTable(false);
    setShowTodayAppointmentsTable(false);
  };

  const handleShowActiveLawyers = () => {
    setShowActiveLawyersTable(true);
    setShowClientsTable(false);
    setShowLawyersTable(false);
    setShowTodayAppointmentsTable(false);
  };

  const handleShowTodayAppointments = () => {
    setShowTodayAppointmentsTable(true);
    setShowClientsTable(false);
    setShowLawyersTable(false);
    setShowActiveLawyersTable(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats Cards - Medium Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <div 
          onClick={handleShowClients}
          className="bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-5 rounded-2xl text-white shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-cyan-400"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{usersCount}</p>
            </div>
          </div>
          <p className="text-cyan-200 text-xs">Click to view all users</p>
        </div>
        <div 
          onClick={handleShowLawyers}
          className="bg-gradient-to-br from-teal-600 via-cyan-700 to-slate-800 p-5 rounded-2xl text-white shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-teal-500"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-teal-100 text-sm">Total Lawyers</p>
              <p className="text-2xl font-bold">{lawyersCount}</p>
            </div>
          </div>
          <p className="text-teal-200 text-xs">Click to view all lawyers</p>
        </div>
        <div 
          onClick={handleShowActiveLawyers}
          className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-5 rounded-2xl text-white shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-blue-500"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <UserCheck size={22} />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Active Lawyers</p>
              <p className="text-2xl font-bold">{activeLawyersCount}</p>
            </div>
          </div>
          <p className="text-blue-200 text-xs">Click to view active lawyers</p>
        </div>
        <div 
          onClick={handleShowTodayAppointments}
          className="bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 p-5 rounded-2xl text-white shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-teal-400"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ClipboardList size={22} />
            </div>
            <div>
              <p className="text-teal-100 text-sm">Today's Appointments</p>
              <p className="text-2xl font-bold">{todayAppointmentsCount}</p>
            </div>
          </div>
          <p className="text-teal-200 text-xs">Click to view appointments</p>
        </div>
      </div>

      {/* Clients Table - Same UI as UserAppointments */}
      {showClientsTable && (
        <div className="flex-1 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={20} /></div>
              <h2 className="text-xl font-semibold text-gray-800">All Clients</h2>
              <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{clients.length} Total</span>
              <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{activeClients} Active</span>
              <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">{inactiveClients} Inactive</span>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email or phone..." 
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {(searchQuery || statusFilter !== "all") && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          {clients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">No clients found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredClients.map((client) => {
                      const status = client.isActive !== false ? "Active" : "Inactive";
                      const config = getStatusColor(status);
                      const IconComponent = config.icon;

                      return (
                        <tr 
                          key={client._id || client.id} 
                          onClick={() => handleUserClick(client)}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                {getInitials(client.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{client.name || "N/A"}</p>
                                <p className="text-xs text-gray-500">ID: {(client._id || client.id || "").slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{client.email || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{client.phone || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
                              <IconComponent size={12} /> {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(client.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lawyers Table - Same UI as LawyerAppointments */}
      {showLawyersTable && (
        <div className="flex-1 mt-6">
          <AdminLawyerList lawyers={lawyers} onLawyerClick={(lawyer) => handleUserClick(lawyer)} />
        </div>
      )}

      {/* Active Lawyers Table - Only Approved lawyers */}
      {showActiveLawyersTable && (
        <div className="flex-1 mt-6">
          <AdminActiveLawyerList lawyers={lawyers} onLawyerClick={(lawyer) => handleUserClick(lawyer)} />
        </div>
      )}

      {/* Today's Appointments Table */}
      {showTodayAppointmentsTable && (
        <div className="flex-1 mt-6">
          <AdminTodayAppointments onTodayCountChange={onTodayAppointmentsCountChange} />
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-blue-600">
                      {getInitials(selectedUser.name)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name || "N/A"}</h2>
                    <p className="text-blue-100 text-sm">ID: {(selectedUser._id || selectedUser.id || "").slice(-8)}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : "User"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.isActive !== false ? "Active" : "Inactive").bg} ${getStatusColor(selectedUser.isActive !== false ? "Active" : "Inactive").text}`}>
                  {selectedUser.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.email || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.phone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Verification</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.verification || "Not Verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lawyer Specific Details */}
              {selectedUser.role === "lawyer" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.licenseNo && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">License Number</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.licenseNo}</p>
                      </div>
                    )}
                    {selectedUser.experience && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.experience} years</p>
                      </div>
                    )}
                  </div>
                  {selectedUser.specializations && selectedUser.specializations.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.specializations.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedUser.bio && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Bio</p>
                      <p className="text-sm text-gray-700">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              {selectedUser.location && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-700">
                      {selectedUser.location.city || selectedUser.location.state 
                        ? `${selectedUser.location.city || ""}, ${selectedUser.location.state || ""}`
                        : "Location not available"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
