import React, { useMemo } from "react";
import { LogOut, User } from "lucide-react";

export default function Settings() {
  // Get admin info from localStorage
  const adminInfo = useMemo(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          name: user.name || "Admin",
          email: user.email || ""
        };
      } catch {
        return { name: "Admin", email: "" };
      }
    }
    return { name: "Admin", email: "" };
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h2>
      
      {/* Admin Info */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="text-blue-600" size={24} />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{adminInfo.name}</p>
          {adminInfo.email && <p className="text-sm text-gray-500">{adminInfo.email}</p>}
        </div>
      </div>
      
      <button 
        onClick={handleLogout} 
        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
      >
        <LogOut size={18} />
        Logout ({adminInfo.name})
      </button>
    </div>
  );
}