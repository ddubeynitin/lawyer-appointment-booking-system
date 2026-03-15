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
  
  console.log(lawyer);

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-100 relative">
      {/* Rating Badge */}
      <div className="absolute right-2 top-2  bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm">
        <FaStar />
        <span>{lawyer.rating || "4.8"}</span>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-5 h-28">
        <div className="relative">
          <img
            src={
              lawyer.profileImage?.url ||
              "https://randomuser.me/api/portraits/lego/1.jpg"
            }
            alt={lawyer.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white" />
        </div>

        <div className="flex-1">
          <h4 className="text-xl font-semibold text-slate-800">
            {lawyer.name}
          </h4>
          <p className="text-sm text-blue-700 font-medium">
            {lawyer.role}
            <span className="ml-2 border border-gray-200 rounded-lg p-1 text-xs text-slate-500 font-normal">
              {lawyer.experience ? `${lawyer.experience} Years` : "Fresher"}
            </span>
          </p>

          <div className="flex items-center text-sm text-slate-500 mt-2">
            <FaMapMarkerAlt className="mr-2 text-sm text-slate-400" />
            <span>{location || "New Delhi, India"}</span>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {lawyer.specializations && lawyer.specializations.length > 0 ? (
        <div className="flex gap-2 mt-2 h-7 pt-1 pb-1 ">
          {(lawyer.specializations || []).slice(0, 3).map((specialization) => (
            <span
              key={specialization}
              className="text-xs bg-slate-100 px-3 rounded-full text-slate-700 font-medium"
            >
              {specialization}
            </span>
          ))}
          {lawyer.specializations && lawyer.specializations.length > 3 && (
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium">
              +{lawyer.specializations.length - 3} more
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2 mt-2 h-7 pt-1 pb-1 ">
          <span className="text-xs bg-slate-100 px-3 rounded-full text-slate-700 font-medium">
            No specializations
          </span>
        </div>
      )}

      {/* Availability + Price */}
      <div className="h-10 flex items-center justify-between mt-2  p-5">
        <div className="text-sm text-slate-500">
          <span className=" font-medium">
            {lawyer.availability ? (
              <span className="text-white bg-green-500 animate-pulse rounded-lg p-1">Available </span>
            ) : (
              <span className="text-white bg-red-500 font-medium">Unavailable</span>
            )}
          </span>
        </div>

        <div className="text-lg font-bold text-slate-800 bg-amber-300 pl-2 pr-2 rounded-lg">
          {lawyer.feesByCategory && lawyer.feesByCategory.length > 0 ? (
            <div className="relative">
              <select
                value={selectedFeeIndex}
                onChange={(e) => setSelectedFeeIndex(Number(e.target.value))}
                className="appearance-none bg-transparent text-sm font-bold text-slate-800 cursor-pointer pr-5 focus:outline-none"
              >
                {lawyer.feesByCategory.map((feeCategory, index) => (
                  <option key={index} value={index}>
                    ₹{feeCategory.fee} - {feeCategory.category}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" />
            </div>
          ) : (
            <span className="text-black">FREE</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        <Link
          to={`/lawyer/lawyer-profile/${lawyer._id}`}
          className="flex-1 border border-slate-300 hover:bg-slate-50 rounded-xl py-2 text-center text-sm font-medium transition"
        >
          View Profile
        </Link>

        <button className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl py-2 text-sm font-semibold shadow-md hover:opacity-95 transition">
          Book Consultation
        </button>
      </div>
    </div>
  );
}

export default LawyerCard;
