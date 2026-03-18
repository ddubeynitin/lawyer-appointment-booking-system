import React, { useState, useMemo } from "react";

export default function VerificationQueue({ allLawyers, onApprove, onReject, processingId, processingAction }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter lawyers based on search and status
  const filteredLawyers = useMemo(() => {
    return allLawyers.filter((lawyer) => {
      // Search filter - search by name, email, category, location
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        lawyer?.name?.toLowerCase().includes(searchLower) ||
        lawyer?.email?.toLowerCase().includes(searchLower) ||
        lawyer?.specializations?.some(s => s.toLowerCase().includes(searchLower)) ||
        lawyer?.location?.city?.toLowerCase().includes(searchLower) ||
        lawyer?.location?.state?.toLowerCase().includes(searchLower);

      // Status filter
      const lawyerStatus = lawyer?.verification || "Pending";
      const matchesStatus = statusFilter === "all" || lawyerStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allLawyers, searchQuery, statusFilter]);

  // Calculate counts for all statuses
  const totalLawyers = allLawyers.length;
  const pendingCount = allLawyers.filter(l => l?.verification !== "Approved" && l?.verification !== "Under Review").length;
  const underReviewCount = allLawyers.filter(l => l?.verification === "Under Review").length;
  const approvedCount = allLawyers.filter(l => l?.verification === "Approved").length;
  const rejectedCount = allLawyers.filter(l => l?.verification === "Rejected").length;
  const inactiveCount = allLawyers.filter(l => l?.isActive === false).length;
  const activeCount = approvedCount;

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Verification Queue</h2>
          
          {/* 5 Status Badges */}
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
            {totalLawyers} Total
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
            {underReviewCount} Under Review
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            {approvedCount} Approved
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
            {rejectedCount} Rejected
          </span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            placeholder="Search by name, email, category, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><polygon points="22 3 10 3 2 12 22 12"/><path d="m22 3-4.3 4.3"/></svg>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || statusFilter !== "all") && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count */}
      {(searchQuery || statusFilter !== "all") && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredLawyers.length} of {allLawyers.length} lawyers
        </p>
      )}

      {allLawyers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No lawyers found in verification queue.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-230">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lawyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Verification</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLawyers.map((lawyer) => {
                  const isApproving = processingId === lawyer._id && processingAction === "approve";
                  const isRejecting = processingId === lawyer._id && processingAction === "reject";
                  const verificationStatus = lawyer?.verification || "Pending";
                  const statusClasses =
                    verificationStatus === "Approved"
                      ? "bg-green-100 text-green-700"
                      : verificationStatus === "Under Review"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";

                  return (
                    <tr key={lawyer._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={lawyer?.profileImage?.url || "https://i.pravatar.cc/40"}
                            alt={lawyer?.name || "Lawyer"}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{lawyer?.name || "-"}</p>
                            <p className="text-xs text-gray-500">{lawyer?.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {Array.isArray(lawyer?.specializations) && lawyer.specializations.length > 0
                          ? lawyer.specializations.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {[lawyer?.location?.city, lawyer?.location?.state].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                          {verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onApprove?.(lawyer._id)}
                            disabled={isApproving || isRejecting}
                            className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${
                              isApproving
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {isApproving ? "Approving..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject?.(lawyer._id)}
                            disabled={isApproving || isRejecting}
                            className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${
                              isRejecting
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {isRejecting ? "Rejecting..." : "Reject"}
                          </button>
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
