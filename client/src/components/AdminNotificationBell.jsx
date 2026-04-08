import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, X, CheckCircle, Clock, AlertCircle, Users, Shield, Calendar, DollarSign } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch all data and create notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [usersRes, lawyersRes, appointmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`, { timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/lawyers`, { timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/appointments`, { timeout: 5000 }).catch(() => ({ data: [] }))
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const lawyers = Array.isArray(lawyersRes.data) ? lawyersRes.data : [];
      const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

      const newNotifications = [];

      // New Users (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const recentUsers = users.filter(u => u.role === "user" && new Date(u.createdAt) >= oneDayAgo);
      if (recentUsers.length > 0) {
        newNotifications.push({
          id: `users-${Date.now()}`,
          type: "users",
          icon: Users,
          title: "New Users",
          message: `${recentUsers.length} new user${recentUsers.length > 1 ? 's' : ''} registered today`,
          count: recentUsers.length,
          time: new Date(),
          color: "blue"
        });
      }

      // Pending Lawyers (verification)
      const pendingLawyers = lawyers.filter(l => l.verification !== "Approved");
      if (pendingLawyers.length > 0) {
        newNotifications.push({
          id: `pending-${Date.now()}`,
          type: "pending",
          icon: Clock,
          title: "Pending Verifications",
          message: `${pendingLawyers.length} lawyer${pendingLawyers.length > 1 ? 's' : ''} waiting for approval`,
          count: pendingLawyers.length,
          time: new Date(),
          color: "amber"
        });
      }

      // Today's Appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.date).toISOString().split('T')[0];
        return appointmentDate === today;
      });
      
      if (todayAppointments.length > 0) {
        const pendingToday = todayAppointments.filter(a => a.status === "Pending").length;
        newNotifications.push({
          id: `appointments-${Date.now()}`,
          type: "appointments",
          icon: Calendar,
          title: "Today's Appointments",
          message: `${todayAppointments.length} appointment${todayAppointments.length > 1 ? 's' : ''} today${pendingToday > 0 ? ` (${pendingToday} pending)` : ''}`,
          count: todayAppointments.length,
          time: new Date(),
          color: "violet"
        });
      }

      // Completed Appointments (revenue)
      const completedAppointments = appointments.filter(a => a.status === "Completed" && a.feeCharged);
      const todayCompleted = completedAppointments.filter(a => {
        const appointmentDate = new Date(a.date).toISOString().split('T')[0];
        return appointmentDate === today;
      });
      
      if (todayCompleted.length > 0) {
        const todayRevenue = todayCompleted.reduce((sum, a) => sum + Number(a.feeCharged || 0), 0);
        newNotifications.push({
          id: `revenue-${Date.now()}`,
          type: "revenue",
          icon: DollarSign,
          title: "Today's Revenue",
          message: `₹${todayRevenue.toLocaleString()} from ${todayCompleted.length} completed case${todayCompleted.length > 1 ? 's' : ''}`,
          count: todayCompleted.length,
          amount: todayRevenue,
          time: new Date(),
          color: "green"
        });
      }

      // Total stats notifications
      if (users.length > 0) {
        newNotifications.push({
          id: `total-users-${Date.now()}`,
          type: "total",
          icon: Users,
          title: "Total Users",
          message: `${users.length} registered users in system`,
          count: users.length,
          time: new Date(),
          color: "indigo"
        });
      }

      if (lawyers.length > 0) {
        const approvedLawyers = lawyers.filter(l => l.verification === "Approved").length;
        newNotifications.push({
          id: `total-lawyers-${Date.now()}`,
          type: "total",
          icon: Shield,
          title: "Total Lawyers",
          message: `${lawyers.length} lawyers (${approvedLawyers} approved)`,
          count: lawyers.length,
          time: new Date(),
          color: "teal"
        });
      }

      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getColorClasses = (color) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-600";
      case "amber": return "bg-amber-100 text-amber-600";
      case "violet": return "bg-violet-100 text-violet-600";
      case "green": return "bg-green-100 text-green-600";
      case "indigo": return "bg-indigo-100 text-indigo-600";
      case "teal": return "bg-teal-100 text-teal-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const totalCount = notifications.reduce((sum, n) => sum + (n.count || 1), 0);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-500">{notifications.length} updates</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Bell size={40} className="text-gray-300 mb-2" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getColorClasses(notification.color)}`}>
                          <IconComponent size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => {
                fetchNotifications();
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
            >
              Refresh Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
