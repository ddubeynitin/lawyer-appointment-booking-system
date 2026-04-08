import React, { useState, useEffect } from "react";
import axios from "axios";
import { DollarSign, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function PaymentManagement({ theme, tc }) {
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("payments");

  useEffect(() => {
    fetchPayments();
    fetchRefunds();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/payments`);
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRefunds = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/refunds`);
      setRefunds(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);
      setRefunds([]);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment?.clientName?.toLowerCase().includes(search) ||
      payment?.clientEmail?.toLowerCase().includes(search) ||
      payment?.lawyerName?.toLowerCase().includes(search) ||
      payment?.transactionId?.toLowerCase().includes(search) ||
      payment?.status?.toLowerCase().includes(search)
    );
  });

  const filteredRefunds = refunds.filter((refund) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      refund?.clientName?.toLowerCase().includes(search) ||
      refund?.clientEmail?.toLowerCase().includes(search) ||
      refund?.lawyerName?.toLowerCase().includes(search) ||
      refund?.transactionId?.toLowerCase().includes(search) ||
      refund?.reason?.toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return theme === "dark" ? "bg-green-900 text-green-300" : theme === "system" ? "bg-green-800 text-green-300" : "bg-green-100 text-green-800";
      case "pending": return theme === "dark" ? "bg-yellow-900 text-yellow-300" : theme === "system" ? "bg-yellow-800 text-yellow-300" : "bg-yellow-100 text-yellow-800";
      case "failed": return theme === "dark" ? "bg-red-900 text-red-300" : theme === "system" ? "bg-red-800 text-red-300" : "bg-red-100 text-red-800";
      case "refunded": return theme === "dark" ? "bg-purple-900 text-purple-300" : theme === "system" ? "bg-purple-800 text-purple-300" : "bg-purple-100 text-purple-800";
      case "approved": return theme === "dark" ? "bg-green-900 text-green-300" : theme === "system" ? "bg-green-800 text-green-300" : "bg-green-100 text-green-800";
      case "rejected": return theme === "dark" ? "bg-red-900 text-red-300" : theme === "system" ? "bg-red-800 text-red-300" : "bg-red-100 text-red-800";
      default: return theme === "dark" ? "bg-gray-700 text-gray-300" : theme === "system" ? "bg-indigo-700 text-indigo-300" : "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const completedPayments = payments.filter((p) => p?.status?.toLowerCase() === "completed");
  const pendingPayments = payments.filter((p) => p?.status?.toLowerCase() === "pending");
  const totalRefunded = refunds.reduce((sum, r) => sum + (r?.amount || 0), 0);

  const getCardStyle = () => {
    if (theme === "dark") return "bg-gray-900 border-gray-800";
    if (theme === "system") return "bg-indigo-800 border-indigo-700";
    return "bg-white border-gray-100";
  };

  const getTextStyle = () => {
    if (theme === "dark" || theme === "system") return "text-white";
    return "text-gray-800";
  };

  const getTabStyle = (tab) => {
    if (activeTab === tab) {
      return theme === "dark" ? "bg-blue-600 text-white" : theme === "system" ? "bg-indigo-600 text-white" : "bg-blue-600 text-white";
    }
    return theme === "dark" ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : theme === "system" ? "bg-indigo-700 text-indigo-200 hover:bg-indigo-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200";
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${theme === "dark" ? "bg-black" : theme === "system" ? "bg-indigo-900" : "bg-gray-100"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${getCardStyle()} p-6 rounded-xl shadow-sm border transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-500"} mb-1`}>Total Payments</p>
              <p className={`text-2xl font-bold ${getTextStyle()}`}>{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
        <div className={`${getCardStyle()} p-6 rounded-xl shadow-sm border transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-500"} mb-1`}>Completed</p>
              <p className={`text-2xl font-bold ${getTextStyle()}`}>{completedPayments.length}</p>
            </div>
          </div>
        </div>
        <div className={`${getCardStyle()} p-6 rounded-xl shadow-sm border transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-500"} mb-1`}>Pending</p>
              <p className={`text-2xl font-bold ${getTextStyle()}`}>{pendingPayments.length}</p>
            </div>
          </div>
        </div>
        <div className={`${getCardStyle()} p-6 rounded-xl shadow-sm border transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-500"} mb-1`}>Total Refunds</p>
              <p className={`text-2xl font-bold ${getTextStyle()}`}>{formatCurrency(totalRefunded)}</p>
            </div>
          </div>
        </div>
        <div className={`${getCardStyle()} p-6 rounded-xl shadow-sm border transition-all`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-500"} mb-1`}>Total Transactions</p>
              <p className={`text-2xl font-bold ${getTextStyle()}`}>{payments.length + refunds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${getTabStyle("payments")}`}
        >
          <DollarSign size={18} className="inline mr-2" />
          Payments
        </button>
        <button
          onClick={() => setActiveTab("refunds")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${getTabStyle("refunds")}`}
        >
          <RefreshCw size={18} className="inline mr-2" />
          Refund History ({refunds.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className={`${getCardStyle()} p-4 rounded-xl shadow-sm border`}>
        <div className="relative">
          <input type="text" placeholder="Search by client name, email, lawyer, transaction ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : theme === "system" ? "bg-indigo-700 border-indigo-600 text-white placeholder-purple-300" : "bg-white border-gray-200 text-gray-800"}`} />
        </div>
      </div>

      {/* Payments Table */}
      {activeTab === "payments" && (
        <div className={`${getCardStyle()} rounded-xl shadow-sm border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === "dark" ? "bg-gray-800" : theme === "system" ? "bg-indigo-900" : "bg-gray-50"}>
                <tr>
                  {["Transaction ID", "Client", "Lawyer", "Amount", "Date", "Status"].map((header, i) => (
                    <th key={i} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-600"}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-gray-800" : theme === "system" ? "divide-indigo-700" : "divide-gray-100"}`}>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment, index) => (
                    <tr key={payment?._id || `payment-${index}`} className={`transition-colors ${theme === "dark" ? "hover:bg-gray-800" : theme === "system" ? "hover:bg-indigo-700" : "hover:bg-gray-50"}`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === "dark" ? "text-blue-400" : theme === "system" ? "text-blue-300" : "text-blue-600"} font-mono text-sm`}>{payment?.transactionId || "N/A"}</td>
                      <td className="px-6 py-4"><div><p className={`text-sm font-medium ${getTextStyle()}`}>{payment?.clientName || "N/A"}</p><p className={`text-xs ${theme === "dark" ? "text-gray-500" : theme === "system" ? "text-purple-300" : "text-gray-500"}`}>{payment?.clientEmail || "N/A"}</p></div></td>
                      <td className={`px-6 py-4 text-sm ${getTextStyle()}`}>{payment?.lawyerName || "N/A"}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getTextStyle()}`}>{formatCurrency(payment?.amount)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-300" : "text-gray-600"}`}>{formatDate(payment?.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment?.status)}`}>{payment?.status || "Unknown"}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="px-6 py-12 text-center"><p className={`text-sm ${theme === "dark" ? "text-gray-500" : theme === "system" ? "text-purple-300" : "text-gray-500"}`}>No payments found.</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refund History Table */}
      {activeTab === "refunds" && (
        <div className={`${getCardStyle()} rounded-xl shadow-sm border overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme === "dark" ? "bg-gray-800" : theme === "system" ? "bg-indigo-900" : "bg-gray-50"}>
                <tr>
                  {["Transaction ID", "Client", "Lawyer", "Refund Amount", "Date", "Status", "Reason"].map((header, i) => (
                    <th key={i} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-200" : "text-gray-600"}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-gray-800" : theme === "system" ? "divide-indigo-700" : "divide-gray-100"}`}>
                {filteredRefunds.length > 0 ? (
                  filteredRefunds.map((refund, index) => (
                    <tr key={refund?._id || `refund-${index}`} className={`transition-colors ${theme === "dark" ? "hover:bg-gray-800" : theme === "system" ? "hover:bg-indigo-700" : "hover:bg-gray-50"}`}>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === "dark" ? "text-blue-400" : theme === "system" ? "text-blue-300" : "text-blue-600"} font-mono text-sm`}>{refund?.transactionId || refund?.originalTransactionId || "N/A"}</td>
                      <td className="px-6 py-4"><div><p className={`text-sm font-medium ${getTextStyle()}`}>{refund?.clientName || "N/A"}</p><p className={`text-xs ${theme === "dark" ? "text-gray-500" : theme === "system" ? "text-purple-300" : "text-gray-500"}`}>{refund?.clientEmail || "N/A"}</p></div></td>
                      <td className={`px-6 py-4 text-sm ${getTextStyle()}`}>{refund?.lawyerName || "N/A"}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${theme === "dark" ? "text-red-400" : theme === "system" ? "text-red-300" : "text-red-600"}`}>{formatCurrency(refund?.amount || refund?.refundAmount)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-300" : "text-gray-600"}`}>{formatDate(refund?.refundDate || refund?.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(refund?.status)}`}>{refund?.status || "Pending"}</span></td>
                      <td className={`px-6 py-4 text-sm ${theme === "dark" ? "text-gray-400" : theme === "system" ? "text-purple-300" : "text-gray-600"} max-w-xs truncate`}>{refund?.reason || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="px-6 py-12 text-center"><p className={`text-sm ${theme === "dark" ? "text-gray-500" : theme === "system" ? "text-purple-300" : "text-gray-500"}`}>No refunds found.</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
