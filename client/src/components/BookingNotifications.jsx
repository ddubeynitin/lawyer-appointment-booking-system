import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  X, 
  Loader2,
  Clock,
  MessageSquare,
  DollarSign
} from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/api";

export default function BookingNotifications({
  userId,
  recipientType = "user",
  onNotificationCount,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/notifications/${recipientType}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const notificationsData = response.data?.notifications || response.data || [];
      setNotifications(notificationsData);
      
      // Update unread count for badge
      if (onNotificationCount) {
        const unreadCount = notificationsData.filter(n => !n.isRead).length;
        onNotificationCount(unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
      // Fallback to mock data for demo
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/notifications/${recipientType}/${userId}/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/notifications/${recipientType}/${userId}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      if (onNotificationCount) {
        onNotificationCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showAllModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowAllModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showAllModal]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, recipientType]);

  // Handle dropdown toggle
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // When opening, mark visible unread notifications as read
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      unreadIds.forEach(id => markAsRead(id));
    }
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    setShowAllModal(true);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const previewNotifications = notifications.slice(0, 5);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment_confirmed":
      case "appointment_approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "appointment_cancelled":
      case "appointment_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "appointment_reschedule_requested":
      case "appointment_rescheduled":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "appointment_reschedule_rejected":
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case "appointment_reminder":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "new_message":
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case "payment_received":
        return <DollarSign className="w-5 h-5 text-green-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format notification time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h4 className="font-semibold text-gray-800">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              previewNotifications.map((notification) => (
                <div
                  key={notification._id || notification.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? "font-medium text-gray-800" : "text-gray-600"}`}>
                        {notification.title || notification.message || notification.notificationMsg}
                      </p>
                      {notification.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt || notification.timestamp)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="mb-2 text-center text-xs text-gray-500">
                Showing latest 5 notifications
              </p>
              <button
                type="button"
                onClick={handleViewAllNotifications}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {showAllModal && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm"
              role="presentation"
              onClick={() => setShowAllModal(false)}
            >
              <div
                className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="All notifications"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                      Notification History
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-800">
                      All Notifications
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Browse your full notification timeline.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAllModal(false)}
                    className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    aria-label="Close notifications history"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
                  <p className="text-sm text-slate-600">
                    {notifications.length} notification{notifications.length === 1 ? "" : "s"}
                  </p>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                  ) : error ? (
                    <div className="px-6 py-16 text-center text-sm text-slate-500">
                      {error}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <Bell className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                      <h4 className="text-lg font-semibold text-slate-700">
                        No notifications yet
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        New notifications will appear here as they arrive.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 px-6 py-5">
                      {notifications.map((notification) => {
                        const title =
                          notification.title ||
                          notification.message ||
                          notification.notificationMsg ||
                          "Notification";

                        return (
                          <button
                            key={notification._id || notification.id}
                            type="button"
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className={`w-full rounded-2xl border px-4 py-4 text-left transition hover:shadow-sm ${
                              !notification.isRead
                                ? "border-blue-200 bg-white"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="mt-1 shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className={`text-sm ${!notification.isRead ? "font-semibold text-slate-800" : "font-medium text-slate-700"}`}>
                                      {title}
                                    </p>
                                    {notification.description && (
                                      <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {notification.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    {!notification.isRead && (
                                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        New
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                                  <span>{formatTime(notification.createdAt || notification.timestamp)}</span>
                                  <span>•</span>
                                  <span>{notification.type || "general"}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

// Mock notifications for demo
function getMockNotifications() {
  return [
    {
      _id: "1",
      type: "appointment_confirmed",
      title: "Appointment Confirmed",
      description: "Your appointment with Sarah Jenkins has been confirmed",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
    },
    {
      _id: "2",
      type: "new_message",
      title: "New Message",
      description: "You have a new message from your lawyer",
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
      _id: "3",
      type: "payment_received",
      title: "Payment Successful",
      description: "Payment of $250 has been received",
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    }
  ];
}
