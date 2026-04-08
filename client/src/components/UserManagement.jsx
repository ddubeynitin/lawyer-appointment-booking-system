import React, { useEffect, useRef, useState, useMemo } from "react";

// ============= User List Component =============
function UserList({ users, userSearchQuery, setUserSearchQuery, handleInactiveUser, handleDeleteUser }) {
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      if (!user) return false;
      const searchLower = userSearchQuery.toLowerCase();
      const matchesSearch = 
        (user.name || "").toLowerCase().includes(searchLower) ||
        (user.userName || "").toLowerCase().includes(searchLower) ||
        (user.email || "").toLowerCase().includes(searchLower) ||
        (user.userEmail || "").toLowerCase().includes(searchLower) ||
        (user.phone || "").toLowerCase().includes(searchLower) ||
        (user.userPhone || "").toLowerCase().includes(searchLower);

      const userRole = user.role || user.userRole || "user";
      const matchesRole = userRoleFilter === "all" || userRole === userRoleFilter;

      const isActive = user?.isActive === undefined || user?.isActive === null ? true : Boolean(user.isActive);
      const matchesStatus = userStatusFilter === "all" || (userStatusFilter === "active" && isActive) || (userStatusFilter === "inactive" && !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearchQuery, userRoleFilter, userStatusFilter]);

  const userStats = useMemo(() => {
    if (!Array.isArray(users)) return { total: 0, active: 0, inactive: 0 };
    const total = users.length;
    const active = users.filter(u => u?.isActive !== false).length;
    const inactive = users.filter(u => u?.isActive === false).length;
    return { total, active, inactive };
  }, [users]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">User List</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">{userStats.total} Total</span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{userStats.active} Active</span>
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">{userStats.inactive} Inactive</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search by name, email, phone..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
        </div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><polygon points="22 3 10 3 2 12 22 12"/><path d="m22 3-4.3 4.3"/></svg>
          <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white cursor-pointer">
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <select value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value)} className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {(userSearchQuery || userRoleFilter !== "all" || userStatusFilter !== "all") && (
          <button onClick={() => { setUserSearchQuery(""); setUserRoleFilter("all"); setUserStatusFilter("all"); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">Clear Filters</button>
        )}
      </div>

      {userStats.total === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-230">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const userId = user?._id ?? user?.id;
                  const isActive = user?.isActive === undefined || user?.isActive === null ? true : Boolean(user.isActive);
                  const role = user.role || user.userRole || "user";
                  const roleClasses = role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700";
                  const statusClasses = isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

                  return (
                    <tr key={userId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.profileImage?.url ? (
                            <img src={user.profileImage.url} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{(user.name || user.userName || "U").charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{user.name || user.userName || "-"}</p>
                            <p className="text-xs text-gray-500">{user.email || user.userEmail || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{user.phone || user.userPhone || "-"}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClasses}`}>{role}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>{isActive ? "Active" : "Inactive"}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleInactiveUser(userId)} disabled={!userId || !isActive} className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${!userId || !isActive ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}>Inactive</button>
                          <button type="button" onClick={() => handleDeleteUser(userId)} disabled={!userId} className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${!userId ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>Delete</button>
                        </div>
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
  );
}

// ============= User Form Component =============
function UserForm({ userFormRef, isUserFormAtEnd, userName, setUserName, userEmail, setUserEmail, userPhone, setUserPhone, userRole, setUserRole, userPassword, setUserPassword, userConfirmPassword, setUserConfirmPassword, userErrors, setUserErrors, handleCreateUser, checkScrollEnd, setIsUserFormAtEnd }) {
  return (
    <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-300">
      <div ref={userFormRef} onScroll={() => checkScrollEnd(userFormRef.current, setIsUserFormAtEnd)} className="max-h-[70vh] overflow-y-auto px-4 pt-6 pb-4 sm:px-6 lg:px-8" style={{ scrollbarWidth: "thin" }}>
        <h2 className="text-2xl font-semibold mb-6 text-blue-900">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">User Name</label>
            <input type="text" value={userName} onChange={(e) => { setUserName(e.target.value); setUserErrors({ ...userErrors, userName: "" }); }} placeholder="Enter user name" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userName ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`} />
            {userErrors.userName && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Email Address</label>
            <input type="email" value={userEmail} onChange={(e) => { setUserEmail(e.target.value); setUserErrors({ ...userErrors, userEmail: "" }); }} placeholder="Enter email address" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userEmail ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`} />
            {userErrors.userEmail && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Phone Number</label>
            <input type="tel" value={userPhone} onChange={(e) => { setUserPhone(e.target.value); setUserErrors({ ...userErrors, userPhone: "" }); }} placeholder="Enter phone number" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userPhone ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`} />
            {userErrors.userPhone && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Role</label>
            <select value={userRole} onChange={(e) => { setUserRole(e.target.value); setUserErrors({ ...userErrors, userRole: "" }); }} className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userRole ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {userErrors.userRole && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userRole}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Password</label>
            <input type="password" value={userPassword} onChange={(e) => { setUserPassword(e.target.value); setUserErrors({ ...userErrors, userPassword: "" }); }} placeholder="Enter password" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userPassword ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`} />
            {userErrors.userPassword && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-3">Confirm Password</label>
            <input type="password" value={userConfirmPassword} onChange={(e) => { setUserConfirmPassword(e.target.value); setUserErrors({ ...userErrors, userConfirmPassword: "" }); }} placeholder="Confirm password" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${userErrors.userConfirmPassword ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-blue-200 focus:ring-blue-500"}`} />
            {userErrors.userConfirmPassword && <p className="text-red-600 text-xs mt-2 font-semibold">{userErrors.userConfirmPassword}</p>}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 px-8 pb-8 pt-4 bg-blue-50/80 backdrop-blur border-t border-blue-100">
        {!isUserFormAtEnd && <p className="text-xs text-blue-700/70 mb-2">Scroll to the bottom to enable Add User</p>}
        <button onClick={handleCreateUser} disabled={!isUserFormAtEnd} className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${isUserFormAtEnd ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg" : "bg-blue-300 text-white/70 cursor-not-allowed"}`}>Add User</button>
      </div>
    </div>
  );
}

// ============= Lawyer List Component =============
function LawyerList({ lawyers, lawyerSearchQuery, setLawyerSearchQuery, lawyerStatusFilter, setLawyerStatusFilter, lawyerSpecializationFilter, setLawyerSpecializationFilter, handleActivateLawyer, handleInactiveLawyer }) {
  const allLawyerSpecializations = useMemo(() => {
    if (!lawyers) return [];
    const specs = new Set();
    lawyers.forEach((lawyer) => {
      if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
        lawyer.specializations.forEach((spec) => {
          if (spec) specs.add(spec);
        });
      }
    });
    return Array.from(specs).sort();
  }, [lawyers]);

  const filteredLawyers = useMemo(() => {
    if (!Array.isArray(lawyers)) return [];
    return lawyers.filter((lawyer) => {
      if (!lawyer) return false;
      const searchLower = lawyerSearchQuery.toLowerCase();
      const matchesSearch = 
        (lawyer.name || "").toLowerCase().includes(searchLower) ||
        (lawyer.lawyerName || "").toLowerCase().includes(searchLower) ||
        (lawyer.email || "").toLowerCase().includes(searchLower) ||
        (lawyer.lawyerEmail || "").toLowerCase().includes(searchLower) ||
        (lawyer.specializations || []).some(s => (s || "").toLowerCase().includes(searchLower)) ||
        (lawyer.location?.city || "").toLowerCase().includes(searchLower) ||
        (lawyer.location?.state || "").toLowerCase().includes(searchLower) ||
        (lawyer.phone || "").toLowerCase().includes(searchLower) ||
        (lawyer.lawyerPhone || "").toLowerCase().includes(searchLower);

      const lawyerStatus = lawyer.verification || "Pending";
      const matchesStatus = lawyerStatusFilter === "all" || lawyerStatus === lawyerStatusFilter;
      const matchesSpecialization = lawyerSpecializationFilter === "all" || (lawyer.specializations || []).includes(lawyerSpecializationFilter);
      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [lawyers, lawyerSearchQuery, lawyerStatusFilter, lawyerSpecializationFilter]);

  const lawyerStats = useMemo(() => {
    if (!Array.isArray(lawyers)) return { total: 0, approved: 0, pending: 0, inactive: 0 };
    const total = lawyers.length;
    const approved = lawyers.filter(l => l?.verification === "Approved" && l?.isActive !== false).length;
    const pending = lawyers.filter(l => l?.verification !== "Approved" || l?.isActive === false).length;
    const inactive = lawyers.filter(l => l?.isActive === false).length;
    return { total, approved, pending, inactive };
  }, [lawyers]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Lawyer List</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">{lawyerStats.total} Total</span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{lawyerStats.approved} Active</span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">{lawyerStats.pending} Pending</span>
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">{lawyerStats.inactive} Inactive</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Search by name, email, specialization, location..." value={lawyerSearchQuery} onChange={(e) => setLawyerSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-green-500 hover:ring-2 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
        </div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><polygon points="22 3 10 3 2 12 22 12"/><path d="m22 3-4.3 4.3"/></svg>
          <select value={lawyerStatusFilter} onChange={(e) => setLawyerStatusFilter(e.target.value)} className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-green-500 hover:ring-2 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition appearance-none bg-white cursor-pointer">
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
          <select value={lawyerSpecializationFilter} onChange={(e) => setLawyerSpecializationFilter(e.target.value)} className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-green-500 hover:ring-2 hover:ring-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition appearance-none bg-white cursor-pointer">
            <option value="all">All Specializations</option>
            {allLawyerSpecializations.map((spec) => (<option key={spec} value={spec}>{spec}</option>))}
          </select>
        </div>
        {(lawyerSearchQuery || lawyerStatusFilter !== "all" || lawyerSpecializationFilter !== "all") && (
          <button onClick={() => { setLawyerSearchQuery(""); setLawyerStatusFilter("all"); setLawyerSpecializationFilter("all"); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">Clear Filters</button>
        )}
      </div>

      {lawyerStats.total === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No lawyers found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-230">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lawyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Specialization</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLawyers.map((lawyer) => {
                  const lawyerId = lawyer?._id ?? lawyer?.id;
                  const isActive = lawyer?.isActive === undefined || lawyer?.isActive === null ? true : Boolean(lawyer.isActive);
                  const verificationStatus = lawyer.verification || "Pending";
                  const statusClasses = verificationStatus === "Approved" ? "bg-green-100 text-green-700" : verificationStatus === "Under Review" ? "bg-amber-100 text-amber-700" : verificationStatus === "Rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
                  const activeStatusClasses = isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

                  return (
                    <tr key={lawyerId} className="hover:bg-green-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={lawyer.profileImage?.url || lawyer.avatar || "https://i.pravatar.cc/40"} alt={lawyer.name || "Lawyer"} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                          <div>
                            <p className="font-medium text-gray-900">{lawyer.name || lawyer.lawyerName || "-"}</p>
                            <p className="text-xs text-gray-500">{lawyer.email || lawyer.lawyerEmail || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{Array.isArray(lawyer.specializations) && lawyer.specializations.length > 0 ? lawyer.specializations.join(", ") : "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{[lawyer.location?.city, lawyer.location?.state].filter(Boolean).join(", ") || "-"}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>{verificationStatus}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${activeStatusClasses}`}>{isActive ? "Active" : "Inactive"}</span></td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleActivateLawyer(lawyerId)} disabled={!lawyerId || isActive} className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${!lawyerId || isActive ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>Activate</button>
                          <button type="button" onClick={() => handleInactiveLawyer(lawyerId)} disabled={!lawyerId || !isActive} className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${!lawyerId || !isActive ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}>Deactivate</button>
                        </div>
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
  );
}

// ============= Lawyer Form Component =============
function LawyerForm({ lawyerFormRef, isLawyerFormAtEnd, lawyerName, setLawyerName, lawyerEmail, setLawyerEmail, lawyerPhone, setLawyerPhone, lawyerLicense, setLawyerLicense, lawyerSpecializations, setLawyerSpecializations, lawyerExperience, setLawyerExperience, lawyerProfileImage, setLawyerProfileImage, lawyerFees, setLawyerFees, lawyerEducation, setLawyerEducation, lawyerLocation, setLawyerLocation, lawyerDescription, setLawyerDescription, lawyerPassword, setLawyerPassword, lawyerConfirmPassword, setLawyerConfirmPassword, lawyerErrors, setLawyerErrors, handleCreateLawyer, checkScrollEnd, setIsLawyerFormAtEnd }) {
  return (
    <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl shadow-lg border-2 border-green-200 animate-in fade-in slide-in-from-top duration-300">
      <div ref={lawyerFormRef} onScroll={() => checkScrollEnd(lawyerFormRef.current, setIsLawyerFormAtEnd)} className="max-h-[70vh] overflow-y-auto px-8 pt-8 pb-4" style={{ scrollbarWidth: "thin" }}>
        <h2 className="text-2xl font-semibold mb-6 text-green-900">Create New Lawyer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Lawyer Name</label>
            <input type="text" value={lawyerName} onChange={(e) => { setLawyerName(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerName: "" }); }} placeholder="Enter lawyer name" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerName ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerName && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Email Address</label>
            <input type="email" value={lawyerEmail} onChange={(e) => { setLawyerEmail(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerEmail: "" }); }} placeholder="Enter email address" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerEmail ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerEmail && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Phone Number</label>
            <input type="tel" value={lawyerPhone} onChange={(e) => { setLawyerPhone(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerPhone: "" }); }} placeholder="Enter phone number" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerPhone ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerPhone && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">License Number</label>
            <input type="text" value={lawyerLicense} onChange={(e) => { setLawyerLicense(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerLicense: "" }); }} placeholder="Enter license number" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerLicense ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerLicense && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerLicense}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Specializations</label>
            <select multiple size={5} value={lawyerSpecializations} onChange={(e) => { const options = Array.from(e.target.selectedOptions).map((o) => o.value); setLawyerSpecializations(options); setLawyerErrors({ ...lawyerErrors, lawyerSpecializations: "" }); }} className={`w-full h-32 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerSpecializations ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`}>
              <option value="Criminal">Criminal</option>
              <option value="Civil">Civil</option>
              <option value="Corporate">Corporate</option>
              <option value="Family">Family</option>
              <option value="Property">Property</option>
            </select>
            <p className="text-xs text-green-700/70 mt-2">Select one or more specializations.</p>
            {lawyerErrors.lawyerSpecializations && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerSpecializations}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Years of Experience</label>
            <input type="number" value={lawyerExperience} onChange={(e) => { setLawyerExperience(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerExperience: "" }); }} placeholder="Enter years of experience" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerExperience ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerExperience && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerExperience}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Profile Image</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files && e.target.files[0]; if (file) { const previewUrl = URL.createObjectURL(file); setLawyerProfileImage({ file, previewUrl }); } else { setLawyerProfileImage({ file: null, previewUrl: "" }); } }} className="w-full text-sm" />
              {lawyerProfileImage?.previewUrl && <img src={lawyerProfileImage.previewUrl} alt="preview" className="h-20 w-20 rounded-md object-cover" />}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Fees by Category</label>
            <div className="space-y-2">
              {lawyerFees.map((f, idx) => (
                <div key={idx} className="flex flex-col gap-2 sm:flex-row">
                  <select value={f.category} onChange={(e) => { const newFees = [...lawyerFees]; newFees[idx].category = e.target.value; setLawyerFees(newFees); }} className="flex-1 px-3 py-2 border rounded">
                    <option value="">Select category</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Civil">Civil</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Family">Family</option>
                    <option value="Property">Property</option>
                  </select>
                  <input type="number" value={f.fee} onChange={(e) => { const newFees = [...lawyerFees]; newFees[idx].fee = e.target.value; setLawyerFees(newFees); }} placeholder="Fee" className="w-full px-3 py-2 border rounded sm:w-28" />
                  <button onClick={() => setLawyerFees(lawyerFees.filter((_, i) => i !== idx))} className="px-2 py-2 bg-red-500 text-white rounded" type="button">Remove</button>
                </div>
              ))}
              <button onClick={() => setLawyerFees([...lawyerFees, { category: "", fee: "" }])} type="button" className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded sm:w-auto">Add Fee</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Location</label>
            <input type="text" value={lawyerLocation.address} onChange={(e) => setLawyerLocation({ ...lawyerLocation, address: e.target.value })} placeholder="Street address" className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition border-green-200 focus:ring-green-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <input type="text" value={lawyerLocation.city} onChange={(e) => setLawyerLocation({ ...lawyerLocation, city: e.target.value })} placeholder="City" className="px-3 py-2 border rounded" />
              <input type="text" value={lawyerLocation.state} onChange={(e) => setLawyerLocation({ ...lawyerLocation, state: e.target.value })} placeholder="State" className="px-3 py-2 border rounded" />
            </div>
            {lawyerErrors.lawyerLocation && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerLocation}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Education</label>
            <div className="space-y-2">
              {lawyerEducation.map((ed, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <input type="text" value={ed.degree} onChange={(e) => { const arr = [...lawyerEducation]; arr[idx].degree = e.target.value; setLawyerEducation(arr); }} placeholder="Degree" className="px-3 py-2 border rounded" />
                  <input type="text" value={ed.university} onChange={(e) => { const arr = [...lawyerEducation]; arr[idx].university = e.target.value; setLawyerEducation(arr); }} placeholder="University" className="px-3 py-2 border rounded" />
                  <div className="flex items-center gap-2">
                    <input type="number" value={ed.year} onChange={(e) => { const arr = [...lawyerEducation]; arr[idx].year = e.target.value; setLawyerEducation(arr); }} placeholder="Year" className="w-24 px-3 py-2 border rounded" />
                    <button type="button" onClick={() => setLawyerEducation(lawyerEducation.filter((_, i) => i !== idx))} className="px-2 py-2 bg-red-500 text-white rounded">Remove</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setLawyerEducation([...lawyerEducation, { degree: "", university: "", year: "" }])} className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded sm:w-auto">Add Education</button>
              {lawyerErrors.lawyerEducation && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerEducation}</p>}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-green-900 mb-3">Description</label>
            <textarea value={lawyerDescription} onChange={(e) => { setLawyerDescription(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerDescription: "" }); }} placeholder="Enter professional description" rows="3" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerDescription ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerDescription && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerDescription}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Password</label>
            <input type="password" value={lawyerPassword} onChange={(e) => { setLawyerPassword(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerPassword: "" }); }} placeholder="Enter password" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerPassword ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerPassword && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerPassword}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-3">Confirm Password</label>
            <input type="password" value={lawyerConfirmPassword} onChange={(e) => { setLawyerConfirmPassword(e.target.value); setLawyerErrors({ ...lawyerErrors, lawyerConfirmPassword: "" }); }} placeholder="Confirm password" className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${lawyerErrors.lawyerConfirmPassword ? "border-red-500 ring-2 ring-red-500 bg-red-50" : "border-green-200 focus:ring-green-500"}`} />
            {lawyerErrors.lawyerConfirmPassword && <p className="text-red-600 text-xs mt-2 font-semibold">{lawyerErrors.lawyerConfirmPassword}</p>}
          </div>
        </div>
        <div className="sticky bottom-0 mt-6 pb-6 bg-green-50/80 border-t border-green-100 px-4 sm:px-6 lg:px-8">
          {!isLawyerFormAtEnd && <p className="text-xs text-green-700/70 mb-2">Scroll to the bottom to enable Add Lawyer</p>}
          <button onClick={handleCreateLawyer} disabled={!isLawyerFormAtEnd} className={`w-full px-6 py-3 pb-8 rounded-lg transition-all duration-200 font-semibold ${isLawyerFormAtEnd ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg" : "bg-green-300 text-white/70 cursor-not-allowed"}`}>Add Lawyer</button>
        </div>
      </div>
    </div>
  );
}

// ============= Main UserManagement Component =============
export default function UserManagement(props) {
  const { mode } = props;
  const {
    userName, setUserName, userEmail, setUserEmail, userPhone, setUserPhone, userRole, setUserRole,
    userPassword, setUserPassword, userConfirmPassword, setUserConfirmPassword,
    userErrors, setUserErrors, handleCreateUser, handleDeleteUser, handleInactiveUser,
    handleCreateLawyer, handleInactiveLawyer, handleActivateLawyer,
    lawyerName, setLawyerName, lawyerEmail, setLawyerEmail, lawyerPhone, setLawyerPhone,
    lawyerLicense, setLawyerLicense, lawyerSpecializations, setLawyerSpecializations,
    lawyerExperience, setLawyerExperience, lawyerProfileImage, setLawyerProfileImage,
    lawyerFees, setLawyerFees, lawyerEducation, setLawyerEducation, lawyerLocation, setLawyerLocation,
    lawyerDescription, setLawyerDescription, lawyerPassword, setLawyerPassword,
    lawyerConfirmPassword, setLawyerConfirmPassword, lawyerErrors, setLawyerErrors,
    lawyers, users,
  } = props;

  const [showForm, setShowForm] = useState(true);
  const userFormRef = useRef(null);
  const lawyerFormRef = useRef(null);
  const [isUserFormAtEnd, setIsUserFormAtEnd] = useState(false);
  const [isLawyerFormAtEnd, setIsLawyerFormAtEnd] = useState(false);
  
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [lawyerSearchQuery, setLawyerSearchQuery] = useState("");
  const [lawyerStatusFilter, setLawyerStatusFilter] = useState("all");
  const [lawyerSpecializationFilter, setLawyerSpecializationFilter] = useState("all");

  const handleListView = () => setShowForm(false);

  const checkScrollEnd = (el, setter) => {
    if (!el) return;
    const isAtEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setter(isAtEnd);
  };

  useEffect(() => {
    if (mode === "users" && showForm) checkScrollEnd(userFormRef.current, setIsUserFormAtEnd);
    if (mode === "lawyers" && showForm) checkScrollEnd(lawyerFormRef.current, setIsLawyerFormAtEnd);
  }, [mode, showForm]);

  useEffect(() => {
    setShowForm(true);
  }, [mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {mode === "users" && !showForm && (
          <button onClick={() => setShowForm(true)} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700">Add User Form</button>
        )}
        {mode === "lawyers" && !showForm && (
          <button onClick={() => setShowForm(true)} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-green-600 text-white shadow-lg hover:bg-green-700">Add Lawyer Form</button>
        )}
        {mode === "users" && showForm && (
          <button onClick={() => handleListView()} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700">User List</button>
        )}
        {mode === "lawyers" && showForm && (
          <button onClick={() => handleListView()} className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-green-600 text-white shadow-lg hover:bg-green-700">Lawyer List</button>
        )}
      </div>

      {mode === "users" && !showForm && (
        <UserList users={users} userSearchQuery={userSearchQuery} setUserSearchQuery={setUserSearchQuery} handleInactiveUser={handleInactiveUser} handleDeleteUser={handleDeleteUser} />
      )}

      {mode === "lawyers" && !showForm && (
        <LawyerList lawyers={lawyers} lawyerSearchQuery={lawyerSearchQuery} setLawyerSearchQuery={setLawyerSearchQuery} lawyerStatusFilter={lawyerStatusFilter} setLawyerStatusFilter={setLawyerStatusFilter} lawyerSpecializationFilter={lawyerSpecializationFilter} setLawyerSpecializationFilter={setLawyerSpecializationFilter} handleActivateLawyer={handleActivateLawyer} handleInactiveLawyer={handleInactiveLawyer} />
      )}

      {mode === "users" && showForm && (
        <UserForm userFormRef={userFormRef} isUserFormAtEnd={isUserFormAtEnd} userName={userName} setUserName={setUserName} userEmail={userEmail} setUserEmail={setUserEmail} userPhone={userPhone} setUserPhone={setUserPhone} userRole={userRole} setUserRole={setUserRole} userPassword={userPassword} setUserPassword={setUserPassword} userConfirmPassword={userConfirmPassword} setUserConfirmPassword={setUserConfirmPassword} userErrors={userErrors} setUserErrors={setUserErrors} handleCreateUser={handleCreateUser} checkScrollEnd={checkScrollEnd} setIsUserFormAtEnd={setIsUserFormAtEnd} />
      )}

      {mode === "lawyers" && showForm && (
        <LawyerForm lawyerFormRef={lawyerFormRef} isLawyerFormAtEnd={isLawyerFormAtEnd} lawyerName={lawyerName} setLawyerName={setLawyerName} lawyerEmail={lawyerEmail} setLawyerEmail={setLawyerEmail} lawyerPhone={lawyerPhone} setLawyerPhone={setLawyerPhone} lawyerLicense={lawyerLicense} setLawyerLicense={setLawyerLicense} lawyerSpecializations={lawyerSpecializations} setLawyerSpecializations={setLawyerSpecializations} lawyerExperience={lawyerExperience} setLawyerExperience={setLawyerExperience} lawyerProfileImage={lawyerProfileImage} setLawyerProfileImage={setLawyerProfileImage} lawyerFees={lawyerFees} setLawyerFees={setLawyerFees} lawyerEducation={lawyerEducation} setLawyerEducation={setLawyerEducation} lawyerLocation={lawyerLocation} setLawyerLocation={setLawyerLocation} lawyerDescription={lawyerDescription} setLawyerDescription={setLawyerDescription} lawyerPassword={lawyerPassword} setLawyerPassword={setLawyerPassword} lawyerConfirmPassword={lawyerConfirmPassword} setLawyerConfirmPassword={setLawyerConfirmPassword} lawyerErrors={lawyerErrors} setLawyerErrors={setLawyerErrors} handleCreateLawyer={handleCreateLawyer} checkScrollEnd={checkScrollEnd} setIsLawyerFormAtEnd={setIsLawyerFormAtEnd} />
      )}
    </div>
  );
}
