import React, { useState, useMemo } from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
} from "lucide-react";

export default function VerificationQueue({
  allLawyers,
  onApprove,
  onReject,
  onToggleFeatured,
  processingId,
  processingAction,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [viewingLawyer, setViewingLawyer] = useState(null);
  const [rejectingLawyer, setRejectingLawyer] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Get all unique specializations
  const allSpecializations = useMemo(() => {
    if (!allLawyers) return [];
    const specs = new Set();
    allLawyers.forEach((lawyer) => {
      if (lawyer.specializations && Array.isArray(lawyer.specializations)) {
        lawyer.specializations.forEach((spec) => {
          if (spec) specs.add(spec);
        });
      }
    });
    return Array.from(specs).sort();
  }, [allLawyers]);

  const filteredLawyers = useMemo(() => {
    if (!allLawyers) return [];
    return allLawyers.filter((lawyer) => {
      if (!lawyer) return false;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (lawyer.name || "").toLowerCase().includes(searchLower) ||
        (lawyer.email || "").toLowerCase().includes(searchLower) ||
        (lawyer.specializations || []).some((s) =>
          (s || "").toLowerCase().includes(searchLower),
        ) ||
        (lawyer.location?.city || "").toLowerCase().includes(searchLower) ||
        (lawyer.location?.state || "").toLowerCase().includes(searchLower);

      const lawyerStatus = lawyer.verification || "Pending";
      const matchesStatus =
        statusFilter === "all" || lawyerStatus === statusFilter;

      // Filter by specialization
      const matchesSpecialization =
        specializationFilter === "all" ||
        (lawyer.specializations || []).includes(specializationFilter);

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [allLawyers, searchQuery, statusFilter, specializationFilter]);

  const totalLawyers = allLawyers ? allLawyers.length : 0;
  const pendingCount = allLawyers
    ? allLawyers.filter(
        (l) =>
          l?.verification !== "Approved" && l?.verification !== "Under Review",
      ).length
    : 0;
  const underReviewCount = allLawyers
    ? allLawyers.filter((l) => l?.verification === "Under Review").length
    : 0;
  const approvedCount = allLawyers
    ? allLawyers.filter((l) => l?.verification === "Approved").length
    : 0;
  const rejectedCount = allLawyers
    ? allLawyers.filter((l) => l?.verification === "Rejected").length
    : 0;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleRowClick = (lawyer) => {
    setViewingLawyer(lawyer);
    setShowDetailModal(true);
  };

  const handleRejectClick = (lawyer) => {
    setRejectingLawyer(lawyer);
    setRejectReason("");
    setShowRejectModal(true);
    setShowDetailModal(false);
  };

  const handleConfirmReject = () => {
    if (rejectingLawyer) {
      onReject(rejectingLawyer._id, rejectReason);
      setShowRejectModal(false);
      setRejectingLawyer(null);
      setRejectReason("");
    }
  };

  const getInitials = (name) => {
    if (!name) return "L";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Verification Queue
          </h2>
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, category, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <polygon points="22 3 10 3 2 12 22 12" />
            <path d="m22 3-4.3 4.3" />
          </svg>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
          </svg>
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white cursor-pointer"
          >
            <option value="all">All Specializations</option>
            {allSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
        {(searchQuery ||
          statusFilter !== "all" ||
          specializationFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSpecializationFilter("all");
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {totalLawyers === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <p className="text-gray-500">
            No lawyers found in verification queue.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-230">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Lawyer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Verification
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLawyers.map((lawyer) => {
                  const isApproving =
                    processingId === lawyer._id &&
                    processingAction === "approve";
                  const isRejecting =
                    processingId === lawyer._id &&
                    processingAction === "reject";
                  const verificationStatus = lawyer.verification || "Pending";
                  const statusClasses =
                    verificationStatus === "Approved"
                      ? "bg-green-100 text-green-700"
                      : verificationStatus === "Under Review"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700";

                  return (
                    <tr
                      key={lawyer._id}
                      onClick={() => handleRowClick(lawyer)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              lawyer.profileImage?.url ||
                              "https://i.pravatar.cc/40"
                            }
                            alt={lawyer.name || "Lawyer"}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {lawyer.name || "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lawyer.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {Array.isArray(lawyer.specializations) &&
                        lawyer.specializations.length > 0
                          ? lawyer.specializations.join(", ")
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {[lawyer.location?.city, lawyer.location?.state]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                        >
                          {verificationStatus}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          {verificationStatus !== "Approved" && (
                            <button
                              type="button"
                              onClick={() => onApprove?.(lawyer._id)}
                              disabled={isApproving || isRejecting}
                              className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${isApproving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                            >
                              {isApproving ? "Approving..." : "Approve"}
                            </button>
                          )}
                          {verificationStatus === "Approved" ? (
                            <button
                              type="button"
                              onClick={() => onToggleFeatured?.(lawyer._id, !lawyer.isFeatured)}
                              disabled={processingId === lawyer._id && processingAction === "featured"}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${lawyer.isFeatured ? "bg-amber-100 text-amber-700 border border-amber-300" : "bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={lawyer.isFeatured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {lawyer.isFeatured ? "Featured" : "Feature"}
                            </button>
                          ) : verificationStatus === "Rejected" ? (
                            <span className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 rounded-md">
                              No Action
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingLawyer(lawyer);
                                setRejectReason("");
                                setShowRejectModal(true);
                              }}
                              disabled={isApproving || isRejecting}
                              className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${isRejecting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                            >
                              {isRejecting ? "Rejecting..." : "Reject"}
                            </button>
                          )}
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

      {/* Detail Modal */}
      {showDetailModal && viewingLawyer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "100%",
              maxWidth: "48rem",
              maxHeight: "90vh",
              overflow: "hidden",
              margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(to right, #374151, #1f2937)",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                  }}
                >
                  {getInitials(viewingLawyer.name)}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    {viewingLawyer.name}
                  </h3>
                  <p
                    style={{
                      color: "#d1d5db",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    {viewingLawyer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} style={{ color: "white" }} />
              </button>
            </div>
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                maxHeight: "calc(90vh - 120px)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.5rem",
                  }}
                >
                  <Mail size={18} style={{ color: "#2563eb" }} />
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Email
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {viewingLawyer.email || "N/A"}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.5rem",
                  }}
                >
                  <Phone size={18} style={{ color: "#2563eb" }} />
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Phone
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {viewingLawyer.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.5rem",
                  }}
                >
                  <Award size={18} style={{ color: "#2563eb" }} />
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      License No
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                      }}
                    >
                      {viewingLawyer.licenseNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {(viewingLawyer.location?.city ||
                viewingLawyer.location?.state) && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <MapPin size={16} style={{ color: "#2563eb" }} /> Location
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {viewingLawyer.location.city && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {viewingLawyer.location.city}
                      </span>
                    )}
                    {viewingLawyer.location.state && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {viewingLawyer.location.state}
                      </span>
                    )}
                    {viewingLawyer.location.address && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {viewingLawyer.location.address}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {viewingLawyer.experience && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Briefcase size={16} style={{ color: "#2563eb" }} />{" "}
                    Experience
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.875rem",
                        fontWeight: "bold",
                        color: "#2563eb",
                      }}
                    >
                      {viewingLawyer.experience}
                    </span>
                    <span style={{ color: "#6b7280" }}>Years</span>
                  </div>
                </div>
              )}
              {viewingLawyer.specializations &&
                viewingLawyer.specializations.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Specializations
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {viewingLawyer.specializations.map((spec, index) => (
                        <span
                          key={index}
                          style={{
                            padding: "0.25rem 0.75rem",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {viewingLawyer.education &&
                viewingLawyer.education.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#374151",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <BookOpen size={16} style={{ color: "#2563eb" }} />{" "}
                      Education
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {viewingLawyer.education.map((edu, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f9fafb",
                            borderRadius: "0.5rem",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: 500,
                              color: "#111827",
                              margin: 0,
                            }}
                          >
                            {edu.degree}
                          </p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#6b7280",
                              margin: 0,
                            }}
                          >
                            {edu.university} {edu.year && `(${edu.year})`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {viewingLawyer.bio && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.75rem",
                    }}
                  >
                    About / Bio
                  </h4>
                  <p
                    style={{
                      color: "#4b5563",
                      backgroundColor: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      margin: 0,
                    }}
                  >
                    {viewingLawyer.bio}
                  </p>
                </div>
              )}
              {viewingLawyer.verification !== "Approved" && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <button
                    onClick={() => {
                      onApprove(viewingLawyer._id);
                      setShowDetailModal(false);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#16a34a",
                      color: "white",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleRejectClick(viewingLawyer)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#dc2626",
                      color: "white",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
              {viewingLawyer.verification === "Approved" && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#dcfce7",
                      color: "#166534",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    ✓ Approved
                  </span>
                </div>
              )}
              {viewingLawyer.verification === "Rejected" && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "0.5rem",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    ✗ Rejected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              width: "100%",
              maxWidth: "28rem",
              overflow: "hidden",
              margin: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                backgroundColor: "#dc2626",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  color: "white",
                  margin: 0,
                }}
              >
                Reject Lawyer
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  padding: "0.25rem",
                  borderRadius: "0.25rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} style={{ color: "white" }} />
              </button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <p style={{ color: "#4b5563", marginBottom: "0.5rem" }}>
                You are rejecting:
              </p>
              <p
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "1rem",
                }}
              >
                {rejectingLawyer?.name}
              </p>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Reason for rejection <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  resize: "none",
                  fontFamily: "inherit",
                  fontSize: "0.875rem",
                }}
              />
              <div
                style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
              >
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    border: "1px solid #d1d5db",
                    color: "#374151",
                    borderRadius: "0.5rem",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={!rejectReason.trim()}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    backgroundColor: rejectReason.trim()
                      ? "#dc2626"
                      : "#fca5a5",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: rejectReason.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
