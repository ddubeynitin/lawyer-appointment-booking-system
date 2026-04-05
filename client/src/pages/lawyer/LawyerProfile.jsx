import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  Loader2,
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
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { API_URL } from "../../utils/api";
import LoadingFallback from "../../components/LoadingFallback";
import { FaBalanceScale, FaSearch } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

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
  const topSectionGridClass = canShowBookingCard
    ? "lg:grid-cols-3"
    : "lg:grid-cols-2";
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
            {user && user.role != "lawyer" ? (
              <Link
                to="/client/lawyer-list"
                className="hover:text-blue-600 transition flex items-center gap-2"
              >
                <FaSearch /> Find Lawyer
              </Link>
            ) : (
              ""
            )}
            {user ? (
              <Link
                to={
                  user.role == "lawyer"
                    ? "/lawyer/lawyer-dashboard"
                    : "/client/client-dashboard"
                }
                className="hover:text-blue-600 transition"
              >
                Your Dashboard
              </Link>
            ) : (
              ""
            )}
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
        <div className={`grid grid-cols-1 ${topSectionGridClass} gap-8`}>
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
                    {user && user.role == "lawyer" ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!user) {
                            navigate("/auth/login");
                          } else {
                            handleMessageClick();
                          }
                        }}
                        disabled={creatingConversation}
                        className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {creatingConversation ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <MessageCircle size={18} />
                        )}
                        {creatingConversation ? "Opening..." : "Message"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleShareProfile}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
                    >
                      <Share2 size={18} /> Share
                    </button>
                  </div>
                  {shareStatus ? (
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      {shareStatus}
                    </p>
                  ) : null}
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
          {canShowBookingCard ? (
            <aside className="h-fit self-start lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                <div className="bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                    Consultation
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Book an Appointment
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Secure a time with {lawyerProfileData.name} for legal
                        guidance tailored to your case.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-100">
                        Starting at
                      </p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {primaryConsultationFee
                          ? `Rs.${primaryConsultationFee}`
                          : "N/A"}
                      </p>
                      <p className="text-xs text-slate-300">per 30 min</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <Calendar size={18} />
                      Next available consultation
                    </p>
                    <p className="mt-3 text-2xl font-bold text-slate-800">
                      {availabilityLoading
                        ? "Checking availability..."
                        : nextAvailableConsultation?.time ||
                          "No upcoming consultation slots"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {nextAvailableConsultation?.label || ""}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {nextAvailableConsultation
                        ? "Video or office meeting, based on your preference"
                        : "Please check back soon or book a custom consultation time"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Session format</p>
                      <p className="mt-2 font-semibold text-slate-800">
                        Online/Office
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Verification</p>
                      <p className="mt-2 font-semibold text-slate-800">
                        {lawyerProfileData.verification === "Approved"
                          ? "Verified profile"
                          : "Pending review"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      What to expect
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <p>Share your issue and preferred consultation mode.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <p>Pick a time slot that works for your schedule.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <p>Receive confirmation and connect securely.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          navigate("/auth/login");
                        } else {
                          navigate(
                            `/client/appointment-scheduling/${lawyerProfileData._id}`,
                          );
                        }
                      }}
                      className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
                    >
                      {user ? "Book Now" : "Login to Book"}
                    </button>

                    {/* <button
                      type="button"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Full Calendar
                    </button> */}
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    <p>
                      {lawyerProfileData.verification === "Approved"
                        ? "This lawyer's identity has been verified for safer bookings."
                        : "Profile verification is in progress. Booking details will still be confirmed before your session."}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
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
