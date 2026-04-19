import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  Loader2,
  MapPin,
  Globe,
  Pen,
  Award,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  Star,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { API_URL } from "../../utils/api";
import LoadingFallback from "../../components/LoadingFallback";
import { FaBalanceScale, FaSearch } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import ClientHeader from "../../components/common/ClientHeader";
import LawyerHeader from "../../components/common/LawyerHeader";

const formatTimeLabel = (timeString) => {
  if (!timeString) return "";

  const match = timeString.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return timeString;

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const parseAvailabilityDateTime = (dateValue, timeString) => {
  if (!dateValue || !timeString) return null;

  const rawDate =
    typeof dateValue === "string"
      ? dateValue
      : dateValue instanceof Date
        ? `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`
        : "";
  const datePart = rawDate.split("T")[0];
  const match = timeString.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!datePart || !match) return null;

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM") {
    hours += 12;
  }

  const [year, month, day] = datePart.split("-").map(Number);

  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const formatNextConsultationLabel = (dateValue, timeString) => {
  const consultationDateTime = parseAvailabilityDateTime(dateValue, timeString);

  if (!consultationDateTime) {
    return null;
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const targetDay = new Date(
    consultationDateTime.getFullYear(),
    consultationDateTime.getMonth(),
    consultationDateTime.getDate(),
  );
  const diffDays = Math.round(
    (targetDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  const timeLabel = formatTimeLabel(timeString);

  if (diffDays === 0) {
    return `Today at ${timeLabel}`;
  }

  if (diffDays === 1) {
    return `Tomorrow at ${timeLabel}`;
  }

  return `${consultationDateTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} at ${timeLabel}`;
};

const getNextAvailableConsultation = (availabilities = []) => {
  const now = new Date();

  const orderedAvailabilities = [...availabilities]
    .map((availability) => ({
      ...availability,
      dateTime: parseAvailabilityDateTime(availability?.date, "12:00 AM"),
    }))
    .filter((availability) => availability.dateTime)
    .sort((a, b) => a.dateTime - b.dateTime);

  for (const availability of orderedAvailabilities) {
    const availableSlots = (availability.slots || [])
      .map((slot) => {
        const time =
          typeof slot === "string" ? slot : slot?.time || slot?.startTime;
        return {
          time,
          isBooked:
            slot?.isBooked === true ||
            slot?.booked === true ||
            slot?.isAvailable === false,
          dateTime: parseAvailabilityDateTime(availability.date, time),
        };
      })
      .filter(
        (slot) =>
          slot.time &&
          !slot.isBooked &&
          slot.dateTime &&
          slot.dateTime.getTime() >= now.getTime(),
      )
      .sort((a, b) => a.dateTime - b.dateTime);

    if (availableSlots.length > 0) {
      const nextSlot = availableSlots[0];
      return {
        date: availability.date,
        time: nextSlot.time,
        label: formatNextConsultationLabel(availability.date, nextSlot.time),
      };
    }
  }

  return null;
};

const LawyerProfile = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`${API_URL}/lawyers/${id}`);
  const {
    data: reviews = [],
    loading: reviewsLoading,
    error: reviewsError,
  } = useFetch(`${API_URL}/reviews/lawyer/${id}`);
  const [lawyerProfileData, setLawyerProfileData] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [creatingConversation, setCreatingConversation] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const canShowBookingCard = !user || user.role !== "lawyer";
  const isOwnProfile = user?.role === "lawyer" && user?.id === id || user?._id === id;
  const primaryConsultationFee =
    lawyerProfileData?.feesByCategory &&
    lawyerProfileData.feesByCategory.length > 0
      ? lawyerProfileData.feesByCategory[0].fee
      : null;
  const nextAvailableConsultation =
    getNextAvailableConsultation(availabilityData);

  useEffect(() => {
    if (data) {
      setLawyerProfileData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!lawyerProfileData?._id || !canShowBookingCard) {
      return;
    }

    let isMounted = true;

    const fetchAvailability = async () => {
      setAvailabilityLoading(true);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/availability/lawyer/${lawyerProfileData._id}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          },
        );

        const responseData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.availabilities || [];

        if (isMounted) {
          setAvailabilityData(responseData);
        }
      } catch (availabilityError) {
        console.error("Failed to load lawyer availability:", availabilityError);
        if (isMounted) {
          setAvailabilityData([]);
        }
      } finally {
        if (isMounted) {
          setAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [lawyerProfileData?._id, canShowBookingCard]);

  useEffect(() => {
    if (!shareStatus) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShareStatus("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [shareStatus]);

  const handleShareProfile = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${lawyerProfileData.name} | JustifAi`,
      text: `View ${lawyerProfileData.name}'s lawyer profile on JustifAi.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Profile link shared.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Profile link copied.");
    } catch (shareError) {
      if (shareError?.name === "AbortError") {
        return;
      }

      setShareStatus("Unable to share right now.");
    }
  };

  const handleMessageClick = async () => {
    const viewedLawyerId = id;

    if (!viewedLawyerId) {
      return;
    }

    const clientId = user?.id || user?._id;

    if (!clientId) {
      navigate(`/messages?lawyerId=${encodeURIComponent(viewedLawyerId)}`);
      return;
    }

    try {
      setCreatingConversation(true);
      const response = await axios.post(
        `${API_URL}/messages/conversations/ensure`,
        {
          clientId,
          lawyerId: viewedLawyerId,
        },
      );

      const conversationId = response.data?.conversationId;
      navigate(
        conversationId
          ? `/messages?conversationId=${encodeURIComponent(conversationId)}`
          : `/messages?lawyerId=${encodeURIComponent(viewedLawyerId)}`,
      );
    } catch (error) {
      console.error(
        "Failed to create conversation before opening messages:",
        error,
      );
      navigate(`/messages?lawyerId=${encodeURIComponent(viewedLawyerId)}`);
    } finally {
      setCreatingConversation(false);
    }
  };

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
    <>
      {/* Dynamic Header Based on User Role */}
      {user && user.role === "user" && <ClientHeader />}
      {user && user.role === "lawyer" && <LawyerHeader />}
      
      {/* Default Header for Non-Logged In Users */}
      {!user && (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-xl font-barlow">
              <FaBalanceScale />
              <Link to="/">
                <span className="tracking-wide">
                  Justif<span className="text-blue-500">Ai</span>
                </span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link to="/client/lawyer-list" className="hover:text-blue-600 transition">
                <FaSearch className="inline mr-2" /> Find Lawyer
              </Link>
              <Link to="/about" className="hover:text-blue-600 transition">
                About
              </Link>
              <Link to="/contact" className="hover:text-blue-600 transition">
                Contact Us
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/auth/login"
                className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-100 transition"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>
      )}

      <div className="min-h-screen bg-slate-50 font-barlow">
      {/* HERO BANNER */}
      <div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full -ml-40 -mb-40"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
            {/* LEFT: Profile Info */}
            <div className="space-y-6">
              <div className="flex flex-col justify-center items-start">
                <h1 className="text-5xl font-bold text-white mb-2">
                  {lawyerProfileData.name}
                </h1>
                <p className="text-xl text-blue-100 font-medium">
                  {lawyerProfileData.specializations?.[0] || "Legal Professional"} | {lawyerProfileData.experience || 0} Years Experience
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
                  <MapPin size={18} />
                  <span>{lawyerProfileData.location?.city || "Location not specified"}</span>
                </div>
                {lawyerProfileData.verification === "Approved" && (
                  <div className="flex items-center gap-2 bg-green-400/30 backdrop-blur px-4 py-2 rounded-full border border-green-300">
                    <CheckCircle size={18} />
                    <span>Verified Professional</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {user && user.role === 'lawyer' ? "" : <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate("/auth/login");
                    } else {
                      handleMessageClick();
                    }
                  }}
                  disabled={creatingConversation}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 transition disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
                }
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur border border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 transition"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
              {shareStatus && <p className="text-sm text-blue-100 font-medium">{shareStatus}</p>}
            </div>

            {/* RIGHT: Profile Image */}
            <div className="flex justify-center relative">
              <div className="relative w-72 h-72 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src={
                    lawyerProfileData.profileImage?.url ||
                    "https://randomuser.me/api/portraits/women/44.jpg"
                  }
                  alt={lawyerProfileData.name}
                  className="w-full object-fit"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION - MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:shadow-md transition">
                <p className="text-3xl font-bold text-blue-600">{lawyerProfileData.experience || "N/A"}</p>
                <p className="text-sm text-slate-600 mt-2">Years Experience</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:shadow-md transition">
                <p className="text-3xl font-bold text-yellow-500">
                  {lawyerProfileData.rating?.toFixed(1) || "N/A"}
                </p>
                <p className="text-sm text-slate-600 mt-2">Rating</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:shadow-md transition">
                <p className="text-3xl font-bold text-emerald-600">{lawyerProfileData.totalReviews || 0}</p>
                <p className="text-sm text-slate-600 mt-2">Reviews</p>
              </div>
            </div>

            {/* PROFESSIONAL SUMMARY */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Professional Summary</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {lawyerProfileData.bio || "No professional summary available."}
              </p>
            </div>

            {/* SPECIALIZATIONS */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Specializations</h2>
              <div className="flex flex-wrap gap-3">
                {lawyerProfileData.specializations?.length > 0 ? (
                  lawyerProfileData.specializations.map((item, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium hover:shadow-md transition"
                    >
                      <Award size={16} />
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No specializations listed</p>
                )}
              </div>
            </div>

            {/* CREDENTIALS & EDUCATION */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Credentials & Education</h2>
              <div className="space-y-4">
                {/* License */}
                <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                      <ShieldCheck className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div className="grow">
                    <p className="font-semibold text-slate-800">License Number</p>
                    <p className="text-slate-600 font-mono text-sm mt-1">{lawyerProfileData.licenseNo}</p>
                  </div>
                </div>

                {/* Education */}
                {lawyerProfileData.education?.length > 0 ? (
                  lawyerProfileData.education.map((edu, index) => (
                    <div key={index} className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-200 transition">
                      <div className="shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100">
                          <GraduationCap className="text-indigo-600" size={24} />
                        </div>
                      </div>
                      <div className="grow">
                        <p className="font-semibold text-slate-800">{edu.degree}</p>
                        <p className="text-slate-600 text-sm">{edu.university}</p>
                        <p className="text-slate-500 text-xs mt-1">{edu.year}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                    <GraduationCap className="text-slate-400" size={24} />
                    <p className="text-slate-500">Education information not provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Client Reviews</h2>
                <div className="flex items-center gap-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.floor(lawyerProfileData.rating || 0) ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="ml-2 text-lg font-bold text-slate-800">
                    {lawyerProfileData.rating?.toFixed(1) || "0"} ({lawyerProfileData.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>

              {reviewsLoading ? (
                <p className="text-slate-600 italic">Loading reviews...</p>
              ) : reviewsError ? (
                <p className="text-red-500">Unable to load reviews</p>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-slate-800">{review.userId?.name || "Anonymous"}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className="text-yellow-500" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <p className="text-slate-700">{review.comment || "No written comment"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600 italic">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* RIGHT SECTION - BOOKING CARD (STICKY) */}
          {canShowBookingCard && (
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-br from-blue-600 to-indigo-600 px-6 py-6 text-white">
                  <h3 className="text-2xl font-bold">Book Now</h3>
                  <p className="text-blue-100 text-sm mt-2">
                    Consultation with {lawyerProfileData.name}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Price */}
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-slate-600 font-medium">STARTING AT</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">
                      {primaryConsultationFee ? `Rs. ${primaryConsultationFee}` : "Contact"}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">per 30 min</p>
                  </div>

                  {/* Next Available */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <Calendar size={16} />
                      Next Available
                    </p>
                    {availabilityLoading ? (
                      <p className="mt-2 text-slate-600 text-sm">Checking...</p>
                    ) : nextAvailableConsultation ? (
                      <>
                        <p className="text-lg font-bold text-slate-800 mt-2">{nextAvailableConsultation.label}</p>
                        <p className="text-xs text-emerald-700 mt-1">{nextAvailableConsultation.time}</p>
                      </>
                    ) : (
                      <p className="text-slate-600 text-sm mt-2">No slots available</p>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-slate-600">Online & Office Sessions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-slate-600">Verified Professional</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-slate-600">Secure & Confidential</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate("/auth/login");
                      } else {
                        navigate(`/client/appointment-scheduling/${lawyerProfileData._id}`);
                      }
                    }}
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition duration-200"
                  >
                    {user ? "Schedule Appointment" : "Login to Book"}
                  </button>

                  {/* Security Badge */}
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl text-sm">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-slate-700">
                      {lawyerProfileData.verification === "Approved"
                        ? "Identity verified for secure bookings"
                        : "Verification in progress"}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {isOwnProfile && (
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Profile Health Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="bg-linear-to-br from-emerald-600 to-teal-600 px-6 py-6 text-white">
                    <h3 className="text-2xl font-bold">Profile Health</h3>
                    <p className="text-emerald-100 text-sm mt-2">Complete your profile</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Completeness Meter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-800">Completeness</p>
                        <span className="text-lg font-bold text-emerald-600">85%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">4.8</p>
                        <p className="text-xs text-slate-600 mt-1">Rating</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-2xl font-bold text-green-600">24</p>
                        <p className="text-xs text-slate-600 mt-1">Reviews</p>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-emerald-600" />
                        <p className="font-semibold text-emerald-900">Verified</p>
                      </div>
                      <p className="text-sm text-emerald-800">Your identity has been verified</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => navigate('/lawyer/edit-profile')}
                        className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:shadow-lg transition"
                      >
                        <Pen size={18} />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => navigate('/lawyer/manage-availability')}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition"
                      >
                        <Calendar size={18} />
                        Manage Availability
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Links Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h4 className="font-semibold text-slate-800 mb-4">Quick Access</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/lawyer/lawyer-dashboard')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition flex items-center justify-between group"
                    >
                      <span className="text-slate-700 font-medium">View Dashboard</span>
                      <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition">→</span>
                    </button>
                    <button
                      onClick={() => navigate('/lawyer/calendar')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-emerald-50 transition flex items-center justify-between group"
                    >
                      <span className="text-slate-700 font-medium">View Calendar</span>
                      <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition">→</span>
                    </button>
                    <button
                      onClick={() => navigate('/lawyer/earnings')}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-yellow-50 transition flex items-center justify-between group"
                    >
                      <span className="text-slate-700 font-medium">View Earnings</span>
                      <span className="text-yellow-600 opacity-0 group-hover:opacity-100 transition">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
      </div>
    </>
  );
};

export default LawyerProfile;
