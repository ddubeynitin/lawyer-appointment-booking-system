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

  return (
    <div className="bg-white rounded-xl shadow p-6 relative">
      <div className="absolute right-4 top-4 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-semibold">
        <FaStar />
        <span>{lawyer.rating || "—"}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={lawyer.img || "https://randomuser.me/api/portraits/lego/1.jpg"}
            alt={lawyer.name}
            className="w-16 h-16 rounded-full object-cover border"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold">{lawyer.name}</h4>
          <p className="text-sm text-gray-500">{lawyer.role}</p>

          <div className="flex items-center text-sm text-gray-500 mt-2">
            <FaMapMarkerAlt className="mr-2 text-sm" />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {(lawyer.tags || []).slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span className="text-sm">Next available:</span>
          <span className="text-gray-800 font-medium">{lawyer.availability || "—"}</span>
        </div>

        <div className="text-lg font-semibold">{lawyer.price || "—"}</div>
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          to={`/lawyer/${lawyer._id}`}
          className="flex-1 border border-gray-200 rounded-md py-2 text-center text-sm"
        >
          Profile
        </Link>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">Book Now</button>
      </div>
    </div>
  );
}

export default LawyerCard;
