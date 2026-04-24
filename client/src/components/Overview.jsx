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
  monthlyData = {
    users: [45, 62, 78, 95, 110, 125, 140, 158, 172, 185, 200, 215],
    lawyers: [12, 18, 25, 32, 38, 45, 52, 58, 65, 72, 78, 85],
    appointments: [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195]
  },
}) {
  const [showClientsTable, setShowClientsTable] = useState(false);
  const [showLawyersTable, setShowLawyersTable] = useState(false);
  const [showActiveLawyersTable, setShowActiveLawyersTable] = useState(false);
  const [showTodayAppointmentsTable, setShowTodayAppointmentsTable] = useState(false);
  const [showChart, setShowChart] = useState(true);
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
    setShowChart(false);
  };

  const handleShowLawyers = () => {
    setShowLawyersTable(true);
    setShowClientsTable(false);
    setShowActiveLawyersTable(false);
    setShowTodayAppointmentsTable(false);
    setShowChart(false);
  };

  const handleShowActiveLawyers = () => {
    setShowActiveLawyersTable(true);
    setShowClientsTable(false);
    setShowLawyersTable(false);
    setShowTodayAppointmentsTable(false);
    setShowChart(false);
  };

  const handleShowTodayAppointments = () => {
    setShowTodayAppointmentsTable(true);
    setShowClientsTable(false);
    setShowLawyersTable(false);
    setShowActiveLawyersTable(false);
    setShowChart(false);
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

      {/* Analytics Chart Section */}
      {showChart && (
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Analytics Overview</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span>Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Lawyers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Appointments</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-700">Monthly Activity</h4>
            <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Chart grid lines */}
              <div className="absolute left-12 right-4 top-0 bottom-0 flex flex-col justify-between">
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
                <div className="border-t border-gray-200"></div>
              </div>

              {/* Bars - Last 4 months data */}
              <div className="absolute left-12 right-4 bottom-0 top-8 flex items-end justify-around">
                {(() => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
                  const maxUsers = Math.max(...monthlyData.users, 1);
                  const maxLawyers = Math.max(...monthlyData.lawyers, 1);
                  const maxAppointments = Math.max(...monthlyData.appointments, 1);
                  const activePercent = lawyersCount > 0 ? (activeLawyersCount / lawyersCount) * 100 : 0;
                  
                  return months.map((month, idx) => {
                    const userPercent = (monthlyData.users[idx] / maxUsers) * 100;
                    const lawyerPercent = (monthlyData.lawyers[idx] / maxLawyers) * 100;
                    const appointmentPercent = (monthlyData.appointments[idx] / maxAppointments) * 100;
                    
                    return (
                      <div key={month} className="flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-600">{month}</div>
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-md shadow-sm" style={{height: `${userPercent}%`}}></div>
                          <div className="w-8 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-md shadow-sm absolute bottom-0" style={{height: `${lawyerPercent}%`}}></div>
                          <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md shadow-sm absolute bottom-0" style={{height: `${activePercent}%`}}></div>
                          <div className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t-md shadow-sm absolute bottom-0" style={{height: `${appointmentPercent}%`}}></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* X-axis labels */}
              <div className="absolute left-12 right-4 bottom-2 flex justify-around text-xs text-gray-500">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
              </div>
            </div>
          </div>

          {/* Data Summary */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-700">Platform Statistics</h4>
            <div className="space-y-6">
              {/* Users vs Lawyers */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Users vs Lawyers</span>
                  <span className="text-sm text-gray-500">{Math.round((usersCount / (usersCount + lawyersCount)) * 100)}% / {Math.round((lawyersCount / (usersCount + lawyersCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-cyan-500 h-3 rounded-full" style={{width: `${Math.round((usersCount / (usersCount + lawyersCount)) * 100)}%`}}></div>
                  <div className="bg-teal-500 h-3 rounded-full" style={{width: `${Math.round((lawyersCount / (usersCount + lawyersCount)) * 100)}%`}}></div>
                </div>
              </div>

              {/* Active vs Inactive Lawyers */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Active vs Inactive Lawyers</span>
                  <span className="text-sm text-gray-500">{Math.round((activeLawyersCount / lawyersCount) * 100)}% / {Math.round(((lawyersCount - activeLawyersCount) / lawyersCount) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{width: `${Math.round((activeLawyersCount / lawyersCount) * 100)}%`}}></div>
                  <div className="bg-gray-400 h-3 rounded-full" style={{width: `${Math.round(((lawyersCount - activeLawyersCount) / lawyersCount) * 100)}%`}}></div>
                </div>
              </div>

              {/* Growth Indicators */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">{usersCount > 0 ? Math.round(usersCount * 1.2) : 0}</div>
                  <div className="text-sm opacity-90">Total Users</div>
                  <div className="text-xs mt-1 opacity-75">+20% from last month</div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-lg">
                  <div className="text-2xl font-bold">{lawyersCount > 0 ? Math.round(lawyersCount * 1.15) : 0}</div>
                  <div className="text-sm opacity-90">Total Lawyers</div>
                  <div className="text-xs mt-1 opacity-75">+15% from last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Clients Table */}
      {showClientsTable && (
        <div className="flex-1 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={20} /></div>
              <h2 className="text-xl font-semibold text-gray-800">All Clients</h2>
              <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{clients.length} Total</span>
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">No clients found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
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
