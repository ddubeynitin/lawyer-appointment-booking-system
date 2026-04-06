import { FaSearch, FaVideo } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../utils/api";
import useFetch from "../../hooks/useFetch";
import ClientHeader from "../../components/common/ClientHeader";

const formatLawyerLocation = (lawyer) => {
  const parts = [
    lawyer?.location?.address,
    lawyer?.location?.city,
    lawyer?.location?.state,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Office location not available";
};

const ClientDashboard = () => {
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [currentTime] = useState(() => Date.now());

  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { data: lawyersData } = useFetch(`${API_URL}/lawyers`);
  const lawyers = useMemo(
    () => (Array.isArray(lawyersData) ? lawyersData : []),
    [lawyersData],
  );

  const recommendedLawyers = lawyers
    .filter((lawyer) => lawyer._id !== user?.id)
    .sort(
      (firstLawyer, secondLawyer) =>
        (secondLawyer.rating || 0) - (firstLawyer.rating || 0),
    )
    .slice(0, 2);

  const matchedLawyers = useMemo(() => {
    const normalizedQuery = searchInput.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return lawyers
      .filter((lawyer) => {
        const searchableText = [
          lawyer.name,
          ...(lawyer.specializations || []),
          lawyer.location?.city,
          lawyer.location?.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return tokens.every((token) => searchableText.includes(token));
      })
      .slice(0, 3);
  }, [lawyers, searchInput]);

  const upcomingAppointment = appointmentHistory
    .filter((appointment) => {
      if (!appointment?.date || !appointment?.timeSlot) return false;

      const appointmentDateTime = new Date(
        `${new Date(appointment.date).toISOString().split("T")[0]} ${appointment.timeSlot}`,
      );

      return (
        !Number.isNaN(appointmentDateTime.getTime()) &&
        appointmentDateTime >= new Date() &&
        appointment.status !== "Rejected" &&
        appointment.status !== "Completed"
      );
    })
    .sort((firstAppointment, secondAppointment) => {
      const firstDate = new Date(
        `${new Date(firstAppointment.date).toISOString().split("T")[0]} ${firstAppointment.timeSlot}`,
      );
      const secondDate = new Date(
        `${new Date(secondAppointment.date).toISOString().split("T")[0]} ${secondAppointment.timeSlot}`,
      );

      return firstDate - secondDate;
    })[0];

  const upcomingAppointmentMode = upcomingAppointment?.appointmentMode || "Online";
  const upcomingLawyerLocation = formatLawyerLocation(
    upcomingAppointment?.lawyerId,
  );

  const recentAppointmentHistory = useMemo(() => {
    return [...appointmentHistory]
      .sort((firstAppointment, secondAppointment) => {
        const firstTime = new Date(
          firstAppointment?.createdAt ||
            firstAppointment?.date ||
            0,
        ).getTime();
        const secondTime = new Date(
          secondAppointment?.createdAt ||
            secondAppointment?.date ||
            0,
        ).getTime();

        return secondTime - firstTime;
      })
      .slice(0, 5);
  }, [appointmentHistory]);

  const getAppointmentDateTime = (appointment) => {
    if (!appointment?.date || !appointment?.timeSlot) return null;

    const appointmentDate = new Date(appointment.date);
    if (Number.isNaN(appointmentDate.getTime())) return null;

    const [time, meridiem] = String(appointment.timeSlot).split(" ");
    const [rawHours, rawMinutes] = time.split(":").map(Number);
    if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) return null;

    let hours = rawHours % 12;
    if (meridiem === "PM") hours += 12;
    appointmentDate.setHours(hours, rawMinutes, 0, 0);
    return appointmentDate;
  };

  const canRescheduleAppointment = (appointment) => {
    const appointmentDateTime = getAppointmentDateTime(appointment);
    if (!appointmentDateTime) return false;

    return (
      appointment.status === "Approved" &&
      appointmentDateTime.getTime() - currentTime >= 3 * 60 * 60 * 1000
    );
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmCancel) {
      return;
    }

    try {
      await axios.put(
        `${API_URL}/appointments/${appointmentId}`,
        { status: "Rejected" },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      setAppointmentHistory((previousHistory) =>
        previousHistory.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "Rejected" }
            : appointment,
        ),
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to cancel appointment",
      );
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    if (user?.id) {
      let active = true;

      (async () => {
        try {
          const response = await axios.get(
            `${API_URL}/appointments/user/${user.id}`,
          );

          if (active) {
            setAppointmentHistory(response.data.appointments || []);
          }
        } catch (error) {
          console.error("Error fetching appointment history:", error);
          if (active) {
            setAppointmentHistory([]);
          }
        }
      })();

      return () => {
        active = false;
      };
    }
  }, [user?.id]);

  const handleLawyerSearch = () => {
    const trimmedSearch = searchInput.trim();

    navigate(
      trimmedSearch
        ? `/client/lawyer-list?search=${encodeURIComponent(trimmedSearch)}`
        : "/client/lawyer-list",
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 font-barlow">
      <ClientHeader />

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="uppercase text-blue-600">{user.name}</span>
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your appointments and find the legal help you need.
          </p>
        </div>

        <div className="rounded-xl bg-linear-to-b from-blue-700 to-blue-950 p-10 text-white shadow-xl">
          <h2 className="mb-3 text-center text-2xl font-semibold">
            Find the right legal help today
          </h2>
          <p className="mb-6 text-center text-sm opacity-90">
            Search by specialty, location, or name to book your next consultation.
          </p>

          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <div className="flex overflow-hidden rounded-full bg-white">
                <div className="flex items-center justify-center px-4 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleLawyerSearch();
                    }
                  }}
                  placeholder="Family Law, Corporate, Real Estate..."
                  className="flex-1 px-3 py-2 text-gray-700 outline-none"
                />
                <button
                  type="button"
                  onClick={handleLawyerSearch}
                  className="bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {searchInput.trim() ? (
                <div className="mt-4 rounded-2xl bg-white/95 p-4 text-left text-slate-700 shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quick matches
                  </p>
                  {matchedLawyers.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {matchedLawyers.map((lawyer) => (
                        <button
                          key={lawyer._id}
                          type="button"
                          onClick={() =>
                            navigate(`/lawyer/lawyer-profile/${lawyer._id}`)
                          }
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {lawyer.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {(lawyer.specializations || []).slice(0, 2).join(", ") ||
                                "General Practice"}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            View
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No direct matches found. Press search to browse all lawyers.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">Upcoming Appointment</h3>
            {upcomingAppointment && (
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  upcomingAppointment.status === "Approved"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {upcomingAppointment.status.toUpperCase()}
              </span>
            )}
          </div>

          {upcomingAppointment ? (
            <>
              <h4 className="flex justify-center font-semibold">
                Consultation with {upcomingAppointment.lawyerName}
              </h4>
              <p className="mb-3 flex justify-center text-sm text-blue-600">
                {upcomingAppointment.lawyerSpecialization}
              </p>
              <div className="mb-4 flex flex-wrap justify-center gap-2 text-xs font-medium">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  {upcomingAppointmentMode}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {upcomingAppointmentMode === "Office"
                    ? upcomingLawyerLocation
                    : "Online meeting link will be emailed before the session"}
                </span>
              </div>
              <div className="mb-4 space-y-1 text-center text-sm text-gray-600">
                <p>
                  {new Date(upcomingAppointment.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
                <p>{upcomingAppointment.timeSlot}</p>
                <p>{upcomingAppointment.caseCategory} consultation</p>
              </div>
              <div className="flex justify-center gap-4">
                {/* <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                  <FaVideo /> Join Video Call
                </button> */}
                {canRescheduleAppointment(upcomingAppointment) ? (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/client/appointment-history", {
                        state: { rescheduleAppointmentId: upcomingAppointment._id },
                      })
                    }
                    className="rounded-lg border px-4 py-2 text-sm"
                  >
                    Request Reschedule
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="space-y-3 text-center text-gray-500">
              <p>No upcoming appointments scheduled.</p>
              <Link
                to="/client/lawyer-list"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Book a Lawyer
              </Link>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Appointment History</h3>
              <Link
                to="/client/appointment-history"
                className="text-sm text-blue-600"
              >
                View All
              </Link>
            </div>

            <section className="overflow-x-auto rounded-3xl bg-white p-6 shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-3 text-center text-gray-600">DATE</th>
                    <th className="px-2 py-3 text-center text-gray-600">LAWYER</th>
                    <th className="px-2 py-3 text-center text-gray-600">TYPE</th>
                    <th className="px-2 py-3 text-center text-gray-600">MODE</th>
                    <th className="px-2 py-3 text-center text-gray-600">STATUS</th>
                    <th className="px-2 py-3 text-center text-gray-600">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointmentHistory.length > 0 ? (
                    recentAppointmentHistory.map((appointment, index) => (
                      <tr
                        key={appointment._id || index}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="py-4 text-center">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="text-center">{appointment.lawyerName}</td>
                        <td className="text-center">{appointment.caseCategory}</td>
                        <td className="text-center">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                              {appointment?.appointmentMode || "Online"}
                            </p>
                            <p className="mx-auto max-w-[12rem] text-xs text-gray-500">
                              {(appointment?.appointmentMode || "Online") === "Office"
                                ? formatLawyerLocation(appointment?.lawyerId)
                                : "Online meeting link will be emailed before the session"}
                            </p>
                          </div>
                        </td>
                        <td className="text-center">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              appointment.status === "Completed"
                                ? "bg-green-100 text-green-600"
                                : appointment.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : appointment.status === "Approved"
                                    ? "bg-blue-100 text-blue-600"
                                    : appointment.status === "Rejected"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="text-center">
                          {appointment.status === "Completed" ? (
                            <span className="cursor-pointer text-blue-600">
                              View Notes
                            </span>
                          ) : appointment.status === "Pending" ? (
                            <button
                              type="button"
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          ) : appointment.status === "Rejected" ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Cancelled
                            </span>
                          ) : appointment.status === "Approved" ? (
                            <span className="cursor-pointer text-blue-600">
                              Book Again
                            </span>
                          ) : (
                            <span className="cursor-not-allowed text-gray-400">
                              No Action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No appointment history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <h3 className="mb-2 text-lg font-semibold">Recommended</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendedLawyers.length > 0 ? (
                recommendedLawyers.map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-md transition hover:shadow-xl"
                  >
                    <img
                      src={
                        lawyer.profileImage?.url ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      className="mb-4 h-16 w-16 rounded-full object-cover"
                      alt={lawyer.name}
                    />
                    <p className="font-medium text-gray-800">{lawyer.name}</p>
                    <p className="mb-2 text-xs text-gray-500">
                      {(lawyer.specializations || []).slice(0, 2).join(", ") ||
                        "General Practice"}{" "}
                      • {lawyer.experience || 0} yrs
                    </p>
                    <p className="mb-4 line-clamp-3 px-2 text-sm text-gray-600">
                      {lawyer.bio ||
                        "Experienced lawyer ready to help with your legal matter."}
                    </p>
                    <Link
                      to={`/lawyer/lawyer-profile/${lawyer._id}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Profile
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No recommended lawyers available.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, disabled, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
    <input
      {...props}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
    />
  </label>
);

const SelectField = ({ label, options, disabled, className = "", ...props }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
    <select
      {...props}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default ClientDashboard;
