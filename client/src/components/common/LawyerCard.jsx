import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaChevronDown, FaCalendarCheck, FaRupeeSign, FaTimes, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

function LawyerCard({ lawyer }) {
  const location =
    typeof lawyer.location === "object"
      ? [lawyer.location.address, lawyer.location.city, lawyer.location.state]
          .filter(Boolean)
          .join(", ")
      : lawyer.location;
  
  const [selectedFeeIndex, setSelectedFeeIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    caseCategory: "",
    caseDescription: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [isBooking, setIsBooking] = useState(false);
  
  const handleBookNow = () => {
    setShowBookingModal(true);
  };
  
  const handleCloseModal = () => {
    setShowBookingModal(false);
    setBookingData({ caseCategory: "", caseDescription: "", preferredDate: "", preferredTime: "" });
  };
  
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingData.caseCategory || !bookingData.preferredDate || !bookingData.preferredTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsBooking(true);
    try {
      await axios.post(`http://localhost:5000/api/appointments`, {
        lawyerId: lawyer._id,
        caseCategory: bookingData.caseCategory,
        caseDescription: bookingData.caseDescription,
        date: bookingData.preferredDate,
        timeSlot: bookingData.preferredTime,
        feeCharged: lawyer.feesByCategory?.[selectedFeeIndex]?.fee || 0,
      });
      toast.success("Appointment booked successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-slate-100 relative overflow-hidden"
      >
        {/* Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        {/* Rating Badge */}
        <div className="absolute right-4 top-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-lg">
          <FaStar className="text-xs" />
          <span>{lawyer.rating || "4.8"}</span>
        </div>

        {/* Verified Badge */}
        {lawyer.verified && (
          <div className="absolute left-4 top-6 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
            ✓ Verified
          </div>
        )}

        {/* Profile */}
        <div className="flex items-center gap-5 mt-4">
          <div className="relative">
            <img
              src={
                lawyer.profileImage?.url ||
                "https://randomuser.me/api/portraits/lego/1.jpg"
              }
              alt={lawyer.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-2 ring-white ${lawyer.availability ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-bold text-slate-800 truncate">
              {lawyer.name}
            </h4>
            <p className="text-sm text-blue-700 font-semibold">
              {lawyer.role || lawyer.specializations?.[0] || "Attorney"}
            </p>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                {lawyer.experience ? `${lawyer.experience} Years` : "Fresher"}
              </span>
            </div>

            <div className="flex items-center text-sm text-slate-500 mt-2">
              <FaMapMarkerAlt className="mr-1.5 text-sm text-slate-400 flex-shrink-0" />
              <span className="truncate">{location || "New Delhi, India"}</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        {lawyer.specializations && lawyer.specializations.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {lawyer.specializations.slice(0, 3).map((specialization) => (
              <span
                key={specialization}
                className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-slate-700 font-medium transition-colors cursor-default"
              >
                {specialization}
              </span>
            ))}
            {lawyer.specializations.length > 3 && (
              <span className="text-xs bg-indigo-100 px-3 py-1.5 rounded-full text-indigo-700 font-medium">
                +{lawyer.specializations.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-700 font-medium">
              General Practice
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          {/* Availability */}
          <div className="flex items-center gap-2">
            <FaCalendarCheck className={`text-lg ${lawyer.availability ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <p className={`text-xs font-semibold ${lawyer.availability ? 'text-green-600' : 'text-gray-500'}`}>
                {lawyer.availability ? 'Available Today' : 'Unavailable'}
              </p>
              <p className="text-xs text-slate-400">
                {lawyer.responseTime || 'Quick Response'}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            {lawyer.feesByCategory && lawyer.feesByCategory.length > 0 ? (
              <div className="relative">
                <select
                  value={selectedFeeIndex}
                  onChange={(e) => setSelectedFeeIndex(Number(e.target.value))}
                  className="appearance-none bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-2 rounded-xl text-sm font-bold cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md hover:shadow-lg transition-shadow"
                >
                  {lawyer.feesByCategory.map((feeCategory, index) => (
                    <option key={index} value={index} className="text-slate-800">
                      ₹{feeCategory.fee} - {feeCategory.category}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs pointer-events-none" />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-md">
                <FaRupeeSign className="inline text-xs mr-0.5" /> FREE
              </div>
            )}
          </div>
        </div>

        {/* Review Preview */}
        {lawyer.totalReviews > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`text-sm ${i < Math.floor(lawyer.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              ({lawyer.totalReviews} reviews)
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <Link
            to={`/lawyer/lawyer-profile/${lawyer._id}`}
            className="flex-1 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl py-2.5 text-center text-sm font-semibold text-slate-700 hover:text-blue-700 transition-all"
          >
            View Profile
          </Link>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBookNow}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Book Now
          </motion.button>
        </div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Book Appointment</h3>
                  <p className="text-sm text-slate-500">with {lawyer.name}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <FaTimes className="text-slate-500" />
                </button>
              </div>

              {/* Lawyer Info Summary */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-6">
                <img
                  src={lawyer.profileImage?.url || "https://randomuser.me/api/portraits/lego/1.jpg"}
                  alt={lawyer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-800">{lawyer.name}</p>
                  <p className="text-sm text-slate-500">
                    {lawyer.feesByCategory?.[selectedFeeIndex]?.fee 
                      ? `₹${lawyer.feesByCategory[selectedFeeIndex].fee}` 
                      : "FREE"} - {lawyer.feesByCategory?.[selectedFeeIndex]?.category || "Consultation"}
                  </p>
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {/* Case Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Case Category *
                  </label>
                  <select
                    value={bookingData.caseCategory}
                    onChange={(e) => setBookingData({...bookingData, caseCategory: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {(lawyer.specializations || []).map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                    <option value="General Consultation">General Consultation</option>
                  </select>
                </div>

                {/* Case Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Case Description
                  </label>
                  <textarea
                    value={bookingData.caseDescription}
                    onChange={(e) => setBookingData({...bookingData, caseDescription: e.target.value})}
                    placeholder="Briefly describe your case..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({...bookingData, preferredDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred Time *
                  </label>
                  <select
                    value={bookingData.preferredTime}
                    onChange={(e) => setBookingData({...bookingData, preferredTime: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isBooking}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Confirm Booking
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LawyerCard;
