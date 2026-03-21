import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaChevronDown } from "react-icons/fa";

function LawyerCard({ lawyer }) {
  const location =
    typeof lawyer.location === "object"
      ? [lawyer.location.address, lawyer.location.city, lawyer.location.state]
          .filter(Boolean)
          .join(", ")
      : lawyer.location;

  const [selectedFeeIndex, setSelectedFeeIndex] = useState(0);

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-2xl sm:p-6">
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 shadow-sm sm:text-sm">
        <FaStar />
        <span>{lawyer.rating || "4.8"}</span>
      </div>

      <div className="flex flex-col items-start gap-4 sm:h-28 sm:flex-row sm:items-center sm:gap-5">
        <div className="relative">
          <img
            src={
              lawyer.profileImage?.url || "/assets/images/profile.png"
            }
            alt={lawyer.name}
            className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md sm:h-20 sm:w-20"
          />
          <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />
        </div>

        <div className="w-full flex-1 pr-14 sm:pr-0">
          <h4 className="text-lg font-semibold text-slate-800 sm:text-xl">
            {lawyer.name}
          </h4>
          <p className="text-sm font-medium text-blue-700">
            {lawyer.role}
            <span className="ml-2 inline-block rounded-lg border border-gray-200 p-1 text-xs font-normal text-slate-500">
              {lawyer.experience ? `${lawyer.experience} Years` : "Fresher"}
            </span>
          </p>

          <div className="mt-2 flex items-start text-sm text-slate-500">
            <FaMapMarkerAlt className="mr-2 mt-0.5 shrink-0 text-sm text-slate-400" />
            <span className="line-clamp-2">{location || "New Delhi, India"}</span>
          </div>
        </div>
      </div>

      {lawyer.specializations && lawyer.specializations.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(lawyer.specializations || []).slice(0, 3).map((specialization) => (
            <span
              key={specialization}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {specialization}
            </span>
          ))}
          {lawyer.specializations.length > 3 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              +{lawyer.specializations.length - 3} more
            </span>
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            No specializations
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          <span className="font-medium">
            {lawyer.availability ? (
              <span className="rounded-lg bg-green-500 px-2 py-1 text-white animate-pulse">
                Available
              </span>
            ) : (
              <span className="rounded-lg bg-red-500 px-2 py-1 font-medium text-white">
                Unavailable
              </span>
            )}
          </span>
        </div>

        <div className="w-full rounded-lg bg-amber-300 px-3 py-2 text-left text-lg font-bold text-slate-800 sm:w-auto">
          {lawyer.feesByCategory && lawyer.feesByCategory.length > 0 ? (
            <div className="relative">
              <select
                value={selectedFeeIndex}
                onChange={(e) => setSelectedFeeIndex(Number(e.target.value))}
                className="w-full cursor-pointer appearance-none bg-transparent pr-5 text-sm font-bold text-slate-800 focus:outline-none sm:w-auto"
              >
                {lawyer.feesByCategory.map((feeCategory, index) => (
                  <option key={index} value={index}>
                    Rs {feeCategory.fee} - {feeCategory.category}
                  </option>
                ))}
              </select>
              <FaChevronDown className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white" />
            </div>
          ) : (
            <span className="text-black">FREE</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/lawyer/lawyer-profile/${lawyer._id}`}
          className="flex-1 rounded-xl border border-slate-300 py-2 text-center text-sm font-medium transition hover:bg-slate-50"
        >
          View Profile
        </Link>

        <button className="flex-1 rounded-xl bg-linear-to-r from-blue-600 to-blue-700 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-95">
          Book Consultation
        </button>
      </div>
    </div>
  );
}

export default LawyerCard;
