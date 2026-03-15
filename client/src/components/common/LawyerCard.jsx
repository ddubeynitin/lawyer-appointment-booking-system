import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

function LawyerCard({ lawyer }) {
  const location =
    typeof lawyer.location === "object"
      ? [lawyer.location.address, lawyer.location.city, lawyer.location.state]
          .filter(Boolean)
          .join(", ")
      : lawyer.location;
  console.log(lawyer);
  
  return (
  <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-100 relative">

    {/* Rating Badge */}
    <div className="absolute right-6 top-6 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm">
      <FaStar />
      <span>{lawyer.rating || "—"}</span>
    </div>

    {/* Profile */}
    <div className="flex items-center gap-5">
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
        </p>

        <div className="flex items-center text-sm text-slate-500 mt-2">
          <FaMapMarkerAlt className="mr-2 text-sm text-slate-400" />
          <span>{location}</span>
        </div>
      </div>
    </div>

    {/* Tags */}
    <div className="flex flex-wrap gap-2 mt-6">
      {(lawyer.tags || []).slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-medium"
        >
          {tag}
        </span>
      ))}
    </div>

    {/* Availability + Price */}
    <div className="flex items-center justify-between mt-8 border-t border-slate-100 pt-5">
      <div className="text-sm text-slate-500">
        <span className="block text-xs uppercase tracking-wide text-slate-400">
          Next Available
        </span>
        <span className="text-slate-800 font-medium">
          {lawyer.availability || "—"}
        </span>
      </div>

      <div className="text-2xl font-bold text-slate-800">
        {lawyer.price || "—"}
      </div>
    </div>

    {/* Buttons */}
    <div className="flex gap-3 mt-6">
      <Link
        to={`/lawyer/${lawyer._id}`}
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
