import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  ReceiptText,
  IndianRupee,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import LawyerHeader from "../../components/common/LawyerHeader";
import LoadingFallback from "../../components/LoadingFallback";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value = 0) => currencyFormatter.format(Number(value || 0));

const formatDateLabel = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatMonthLabel = (date) =>
  date.toLocaleDateString("en-US", { month: "short", year: "numeric" });

const toAppointmentDateTime = (appointment) => {
  if (!appointment?.date || !appointment?.timeSlot) return null;

  const datePart = new Date(appointment.date);
  if (Number.isNaN(datePart.getTime())) return null;

  const timeMatch = String(appointment.timeSlot).trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!timeMatch) return datePart;

  const [, rawHours, rawMinutes, meridiem] = timeMatch;
  let hours = Number(rawHours) % 12;
  if (meridiem.toUpperCase() === "PM") hours += 12;

  datePart.setHours(hours, Number(rawMinutes), 0, 0);
  return datePart;
};

const getMonthWindow = (months = 6) => {
  const current = new Date();
  const window = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - offset, 1);
    window.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatMonthLabel(date),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return window;
};

const LawyerEarningsPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const lawyerId = user?.id || user?._id || "";

  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [appointmentsError, setAppointmentsError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    if (user.role !== "lawyer") {
      navigate("/client/client-dashboard");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!lawyerId) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoadingProfile(true);
      setLoadingAppointments(true);
      setProfileError("");
      setAppointmentsError("");

      try {
        const [profileResponse, appointmentsResponse] = await Promise.all([
          axios.get(`${API_URL}/lawyers/${lawyerId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          axios.get(`${API_URL}/appointments/lawyer/${lawyerId}`),
        ]);

        if (!isMounted) return;

        setLawyerProfile(profileResponse.data || null);
        setAppointments(appointmentsResponse.data?.appointments || []);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load lawyer earnings:", error);
        setProfileError(error?.response?.status === 404 ? "Lawyer profile not found." : "");
        setAppointmentsError("Unable to load appointment revenue right now.");
        setAppointments([]);
      } finally {
        if (!isMounted) return;
        setLoadingProfile(false);
        setLoadingAppointments(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [lawyerId, token]);

  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment?.status === "Completed"),
    [appointments],
  );

  const payableAppointments = useMemo(
    () => appointments.filter((appointment) => appointment?.status !== "Rejected"),
    [appointments],
  );

  const monthlyRevenue = useMemo(() => {
    const months = getMonthWindow(6);

    return months.map((monthInfo) => {
      const revenue = completedAppointments.reduce((sum, appointment) => {
        const appointmentDate = toAppointmentDateTime(appointment);
        if (!appointmentDate) return sum;

        const matchesMonth =
          appointmentDate.getFullYear() === monthInfo.year &&
          appointmentDate.getMonth() === monthInfo.month;

        return matchesMonth ? sum + Number(appointment?.feeCharged || 0) : sum;
      }, 0);

      return { ...monthInfo, revenue };
    });
  }, [completedAppointments]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();

    completedAppointments.forEach((appointment) => {
      const category = appointment?.caseCategory || "Uncategorized";
      const current = map.get(category) || { category, count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += Number(appointment?.feeCharged || 0);
      map.set(category, current);
    });

    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [completedAppointments]);

  const statusBreakdown = useMemo(() => {
    const counts = appointments.reduce(
      (acc, appointment) => {
        const status = appointment?.status || "Pending";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Pending: 0, Approved: 0, Rejected: 0, Completed: 0 },
    );

    return counts;
  }, [appointments]);

  const totalRevenue = useMemo(
    () =>
      completedAppointments.reduce((sum, appointment) => sum + Number(appointment?.feeCharged || 0), 0),
    [completedAppointments],
  );

  const projectedRevenue = useMemo(
    () =>
      payableAppointments
        .filter((appointment) => appointment?.status === "Approved" || appointment?.status === "Pending")
        .reduce((sum, appointment) => sum + Number(appointment?.feeCharged || 0), 0),
    [payableAppointments],
  );

  const totalAppointments = appointments.length;
  const completedCount = statusBreakdown.Completed || 0;
  const averageTicket = completedCount > 0 ? totalRevenue / completedCount : 0;
  const completionRate = totalAppointments > 0 ? (completedCount / totalAppointments) * 100 : 0;

  const recentCompletedAppointments = useMemo(
    () =>
      [...completedAppointments]
        .sort((a, b) => (toAppointmentDateTime(b)?.getTime() || 0) - (toAppointmentDateTime(a)?.getTime() || 0))
        .slice(0, 6),
    [completedAppointments],
  );

  const topCategory = categoryBreakdown[0] || null;

  if ((loadingProfile && loadingAppointments) || (!lawyerId && !user)) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 font-barlow">
      <LawyerHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
          <div className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
                  <IndianRupee size={14} />
                  Revenue Overview
                </div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  Track your legal earnings in one place
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  See how much revenue you&apos;ve generated from completed appointments,
                  which case categories perform best, and what income is still in the pipeline.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/lawyer/lawyer-dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                  Back to dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {(profileError || appointmentsError) && (
            <div className="border-b border-slate-100 px-6 py-4 sm:px-8">
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {profileError || appointmentsError}
              </div>
            </div>
          )}

          <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-2 xl:grid-cols-4 sm:p-8">
            <StatCard
              icon={<Wallet size={18} />}
              label="Total earned"
              value={formatCurrency(totalRevenue)}
              note={`${completedCount} completed appointment${completedCount === 1 ? "" : "s"}`}
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Projected revenue"
              value={formatCurrency(projectedRevenue)}
              note="Pending and approved appointments"
            />
            <StatCard
              icon={<CalendarDays size={18} />}
              label="Completion rate"
              value={`${completionRate.toFixed(0)}%`}
              note="Share of all booked appointments"
            />
            <StatCard
              icon={<CircleDollarSign size={18} />}
              label="Average ticket"
              value={formatCurrency(averageTicket)}
              note="Average completed consultation fee"
            />
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1.35fr_0.95fr] lg:p-8">
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                      Revenue trend
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Monthly earnings snapshot
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      A rolling six-month view based on completed appointments.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Latest month total:{" "}
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-6">
                  {monthlyRevenue.map((month) => {
                    const highestRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1);
                    const height = Math.max((month.revenue / highestRevenue) * 100, month.revenue > 0 ? 12 : 6);

                    return (
                      <div key={month.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex h-44 items-end">
                          <div className="flex w-full flex-col items-center gap-3">
                            <div className="flex h-full w-full items-end rounded-2xl p-1">
                              <div
                                className="w-full rounded-2xl bg-linear-to-t from-blue-600 to-indigo-400 transition-all duration-500"
                                style={{ height: `${height}px` }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-slate-500">{month.label}</p>
                              <p className="mt-1 text-sm font-bold text-slate-900">
                                {formatCurrency(month.revenue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <InfoCard
                  icon={<BadgeCheck size={18} />}
                  label="Completed"
                  value={statusBreakdown.Completed}
                  note="Appointments already converted into revenue"
                />
                <InfoCard
                  icon={<ReceiptText size={18} />}
                  label="Approved"
                  value={statusBreakdown.Approved}
                  note="Approved but not yet completed"
                />
                <InfoCard
                  icon={<PieChart size={18} />}
                  label="Pending"
                  value={statusBreakdown.Pending}
                  note="Appointments waiting on action"
                />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Recent completed earnings
                    </h3>
                    <p className="text-sm text-slate-500">
                      The latest appointments that added to your revenue.
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {recentCompletedAppointments.length} shown
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                  {recentCompletedAppointments.length === 0 ? (
                    <div className="bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                      No completed appointments yet. Once a consultation finishes,
                      its fee will appear here.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentCompletedAppointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="grid gap-4 px-4 py-4 sm:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr]"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">
                              {appointment.userId?.name || "Client"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {appointment.caseCategory} consultation
                            </p>
                          </div>
                          <div className="text-sm text-slate-600">
                            {formatDateLabel(appointment.date)}
                          </div>
                          <div className="text-sm text-slate-600">
                            {appointment.timeSlot || "-"}
                          </div>
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(appointment.feeCharged)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Revenue mix
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">By case category</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {categoryBreakdown.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No category revenue yet. Completed appointments will build this section.
                    </p>
                  ) : (
                    categoryBreakdown.map((item) => {
                      const highest = Math.max(...categoryBreakdown.map((entry) => entry.revenue), 1);
                      const width = Math.max((item.revenue / highest) * 100, 10);

                      return (
                        <div key={item.category} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{item.category}</p>
                              <p className="text-xs text-slate-500">{item.count} completed appointment{item.count === 1 ? "" : "s"}</p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(item.revenue)}
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-linear-to-r from-blue-600 to-indigo-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fee setup
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                      Your published pricing
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  These are the consultation fees currently saved on your profile.
                </p>

                <div className="mt-4 space-y-3">
                  {Array.isArray(lawyerProfile?.feesByCategory) && lawyerProfile.feesByCategory.length > 0 ? (
                    lawyerProfile.feesByCategory.map((feeRow) => (
                      <div
                        key={feeRow.category}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{feeRow.category}</p>
                          <p className="text-xs text-slate-500">Configured fee</p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(feeRow.fee)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                      No fee categories have been saved yet. Add them from the manage availability page.
                    </div>
                  )}
                </div>

                <Link
                  to="/lawyer/manage-availability"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Update fees and availability
                </Link>
              </div>

              <div className="rounded-3xl border border-green-100 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 text-green-600" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Earnings status</p>
                    <p className="mt-1 text-sm leading-6 text-green-800">
                      {topCategory
                        ? `Your strongest earning category is ${topCategory.category}, contributing ${formatCurrency(topCategory.revenue)} so far.`
                        : "No completed earnings yet. Your revenue will grow once appointments move into Completed status."}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, note }) => (
  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{note}</p>
  </div>
);

const InfoCard = ({ icon, label, value, note }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="rounded-2xl bg-slate-50 p-3 text-blue-600">{icon}</div>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-sm text-slate-500">{note}</p>
  </div>
);

export default LawyerEarningsPage;
