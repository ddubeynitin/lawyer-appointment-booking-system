import React from "react";

export default function VerificationQueue({ allLawyers, onApprove, onReject, processingId, processingAction }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Verification Queue</h2>
        <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
          {allLawyers.length} Lawyers
        </span>
      </div>
      {allLawyers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">No lawyers found in verification queue.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
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
                {allLawyers.map((lawyer) => {
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
