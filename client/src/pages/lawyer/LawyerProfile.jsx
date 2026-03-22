import React, { useState } from "react";
import {
  CheckCircle,
  MapPin,
  Globe,
  Award,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  Star,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { API_URL } from "../../utils/api";
import LoadingFallback from "../../components/LoadingFallback";
import { FaBalanceScale, FaSearch } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const LawyerProfile = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`${API_URL}/lawyers/${id}`);
  const {
    data: reviews = [],
    loading: reviewsLoading,
    error: reviewsError,
  } = useFetch(`${API_URL}/reviews/lawyer/${id}`);
  const [lawyerProfileData, setLawyerProfileData] = useState(null);
  const { user } = useAuth();

  React.useEffect(() => {
    if (data) {
      setLawyerProfileData(data);
    }
  }, [data]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">
          Error loading lawyer profile: {error}
        </p>
      </div>
    );
  }

  if (!lawyerProfileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-linear-to-br from-slate-50 to-slate-100 min-h-screen pb-16">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl font-barlow ">
            <FaBalanceScale />
            <Link to="/">
              <span className="tracking-wide">
                Justif<span className="text-blue-500">Ai</span>{" "}
              </span>
            </Link>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              to="/client/lawyer-list"
              className="hover:text-blue-600 transition flex items-center gap-2"
            >
              <FaSearch /> Find Lawyer
            </Link>
            {user ?
            <Link
            to={user.role == 'lawyer' ? '/lawyer/lawyer-dashboard':'/client/client-dashboard'}
            className="hover:text-blue-600 transition"
            >
              Your Dashboard
            </Link>
            : "" }
            {/* <Link
              to="/auth/register"
              className="hover:text-blue-600 transition"
            >
              Join as Lawyer
            </Link> */}
            <Link to="/about" className="hover:text-blue-600 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-blue-600 transition">
              Contact Us
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.profileImage?.url || user.profilePicture ? (
                  <img
                    src={user.profileImage?.url || user.profilePicture}
                    alt={user.name || "User profile"}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold uppercase ring-2 ring-blue-500">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-lg hover:scale-105 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* ===== TOP SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row gap-8">
                <img
                  src={
                    lawyerProfileData.profileImage?.url ||
                    "https://randomuser.me/api/portraits/women/44.jpg"
                  }
                  alt="Lawyer"
                  className="w-40 h-40 rounded-xl object-cover shadow-md"
                />

                <div className="flex flex-col justify-between items-start">
                  <h1 className=" text-3xl font-bold text-slate-800 uppercase">
                    {lawyerProfileData.name}
                  </h1>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-blue-600 font-medium">
                      {lawyerProfileData.experience
                        ? `${lawyerProfileData.experience} Years Experience`
                        : "Experience not specified"}
                    </span>
                    {user ? (
                      user.role == "lawyer" ? (
                        <span className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                          <CheckCircle size={16} className="mr-1" />
                          {lawyerProfileData.verification === "Approved"
                            ? "Verified"
                            : "Pending Verification"}
                        </span>
                      ) : (
                        <span>
                          {lawyerProfileData.verification === "Approved" ? (
                            <span className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                              <CheckCircle size={16} className="mr-1" />
                              Verified
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                      )
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />{" "}
                      {lawyerProfileData.location?.city ||
                        "Location not specified"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe size={16} /> English
                    </div>
                    <div>{lawyerProfileData.licenseNo}</div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition">
                      <MessageCircle size={18} /> Message
                    </button>

                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition">
                      <Share2 size={18} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Professional Summary
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {lawyerProfileData.bio || "No bio available."}
              </p>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {lawyerProfileData.specializations &&
                lawyerProfileData.specializations.length > 0 ? (
                  lawyerProfileData.specializations.map((item, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">
                    No specializations listed
                  </span>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Education & Credentials
              </h2>

              {lawyerProfileData.education &&
              lawyerProfileData.education.length > 0 ? (
                lawyerProfileData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <GraduationCap className="text-blue-600" />
                    <div>
                      <p className="font-medium">{edu.university}</p>
                      <p className="text-sm text-slate-500">
                        {edu.degree}, {edu.year}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <GraduationCap className="text-blue-600" />
                  <div>
                    <p className="font-medium">Education not specified</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck className="text-green-600" />
                <div>
                  <p className="font-medium">License Number</p>
                  <p className="text-sm text-slate-500">
                    {lawyerProfileData.licenseNo}
                  </p>
                </div>
              </div>

              {lawyerProfileData.rating > 0 && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <Award className="text-yellow-600" />
                  <div>
                    <p className="font-medium">Rating</p>
                    <p className="text-sm text-slate-500">
                      {lawyerProfileData.rating} stars (
                      {lawyerProfileData.totalReviews} reviews)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - BOOKING CARD */}
          {user && user.role != "lawyer" ? (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-fit sticky top-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Book an Appointment
              </h2>

              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <p className="text-blue-600 font-medium flex items-center gap-2">
                  <Calendar size={18} /> Next Available Slot
                </p>
                <p className="text-slate-700 mt-2 font-medium">
                  Tomorrow at 10:00 AM
                </p>
                <p className="text-sm text-slate-500">
                  Pacific Standard Time (PST)
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span>Consultation Fee</span>
                  <span className="font-medium text-slate-800">
                    $
                    {lawyerProfileData.feesByCategory &&
                    lawyerProfileData.feesByCategory.length > 0
                      ? lawyerProfileData.feesByCategory[0].fee
                      : "N/A"}{" "}
                    / 30 min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-medium text-slate-800">
                    Video Call / Office
                  </span>
                </div>
              </div>

              <button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition">
                Book Now
              </button>

              <button className="w-full mt-3 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50 transition">
                View Full Calendar
              </button>

              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl mt-6 flex items-center gap-2">
                <ShieldCheck size={16} />
                {lawyerProfileData.verification === "Approved"
                  ? "Identity Verified"
                  : "Verification Pending"}
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Client Reviews
            </h2>
            <div className="flex items-center gap-2 text-yellow-500 font-medium">
              <Star size={18} fill="currentColor" />
              {lawyerProfileData.rating || 0} (
              {lawyerProfileData.totalReviews || 0} reviews)
            </div>
          </div>

          <div className="border-t pt-6">
            {reviewsLoading ? (
              <p className="text-slate-600 italic">Loading reviews...</p>
            ) : reviewsError ? (
              <p className="text-red-500 italic">
                Unable to load reviews right now.
              </p>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {review.userId?.name || "Client"}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              fill={
                                index < review.rating ? "currentColor" : "none"
                              }
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium text-slate-600">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <p className="mt-3 text-slate-600">
                      {review.comment || "No written comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 italic">No reviews available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
