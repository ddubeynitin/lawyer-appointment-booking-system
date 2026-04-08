import React from "react";
import { Eye } from "lucide-react";

export default function AdminUserList({
  users = [],
  lawyers = [],
  onUserClick,
}) {
  // Combine users and lawyers into one list
  const allUsers = [
    ...(Array.isArray(users) ? users.map(u => ({ ...u, type: 'user' })) : []),
    ...(Array.isArray(lawyers) ? lawyers.map(l => ({ ...l, type: 'lawyer' })) : [])
  ];

  const getRoleBadge = (user) => {
    if (user.role === "lawyer") {
      return (
        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          Lawyer
        </span>
      );
    }
    if (user.role === "admin") {
      return (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        User
      </span>
    );
  };

  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          Inactive
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
        Active
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">All Users & Lawyers</h3>
        <p className="text-sm text-gray-500">Click on any row to view user details</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allUsers.length > 0 ? (
              allUsers.map((user, index) => (
                <tr 
                  key={user._id || user.id || index} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onUserClick && onUserClick(user)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {user.name ? String(user.name).substring(0, 2).toUpperCase() : "??"}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{user.name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{user.email || "N/A"}</td>
                  <td className="px-5 py-4 text-gray-600">{user.phone || "N/A"}</td>
                  <td className="px-5 py-4">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(user)}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUserClick) {
                          onUserClick(user);
                        }
                      }}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
