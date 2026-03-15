import React, { useState } from "react";
import { DollarSign, CalendarDays } from "lucide-react";
import { FaUser } from "react-icons/fa";
import { IoGitNetwork } from "react-icons/io5";

export default function Overview({
  usersCount = 0,
  lawyersCount = 0,
  activeLawyersCount = 0,
}) {
  const [downloadedStatement, setDownloadedStatement] = useState(false);
  const [selectedRange, setSelectedRange] = useState("monthly");
  const totalUsers = usersCount + lawyersCount;
  const formatNumber = (value) => new Intl.NumberFormat().format(value);

  return (
    <div className="bg-gray-100 p-4 sm:p-6 rounded-xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Registered Users"
          value={formatNumber(totalUsers)}
          badge="+5.2%"
          badgeColor="green"
          icon={<FaUser />}
          tooltip={`Breakdown: ${formatNumber(usersCount)} Clients | ${formatNumber(lawyersCount)} Lawyers`}
        />
        <StatCard
          title="Lawyers Network"
          value={formatNumber(lawyersCount)}
          sub={`${formatNumber(activeLawyersCount)} Active`}
          icon={<IoGitNetwork className="w-7 h-7 text-blue-700 text-7xl font-bold rounded-md bg-blue-100" />}
          tooltip="Verified lawyers in the network"
        />
        <StatCard title="Total Revenue (Monthly)" value="$45,200" badge="+12.4%" badgeColor="green" icon={<DollarSign />} tooltip="Revenue from all consultations & bookings" />
        <StatCard title="Appointments Today" value="156" badge="High Traffic" badgeColor="purple" icon={<CalendarDays />} tooltip="Active bookings for today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="font-semibold">Appointment Volume</h3>
              <p className="text-xs text-gray-400">
                {selectedRange === "monthly"
                  ? "Tracking daily booking requests for the last 30 days"
                  : "Tracking daily booking requests for the last 7 days"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => setSelectedRange("monthly")}
                className={`px-3 py-1 rounded-md transition ${
                  selectedRange === "monthly"
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600 hover:bg-gray-100"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedRange("weekly")}
                className={`px-3 py-1 rounded-md transition ${
                  selectedRange === "weekly"
                    ? "bg-blue-600 text-white"
                    : "border text-gray-600 hover:bg-gray-100"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
          <div className="h-52 rounded-lg bg-linear-to-t from-blue-100 via-blue-50 to-transparent flex items-center justify-center">
            <span className="text-sm text-gray-500">
              {selectedRange === "monthly" ? "Monthly chart placeholder" : "Weekly chart placeholder"}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
          <h3 className="font-semibold mb-4">Revenue Growth</h3>
          <RevenueRow label="Family Law" value="$18,400" width="w-[75%]" tooltip="40% of total revenue" />
          <RevenueRow label="Corporate" value="$12,100" width="w-[55%]" tooltip="27% of total revenue" />
          <RevenueRow label="Real Estate" value="$8,900" width="w-[40%]" tooltip="20% of total revenue" />
          <RevenueRow label="Criminal Defense" value="$5,800" width="w-[30%]" tooltip="13% of total revenue" />
          <button
            onClick={() => {
              setDownloadedStatement(true);
              alert("Statement downloaded successfully!");
              setTimeout(() => setDownloadedStatement(false), 2000);
            }}
            className={`mt-5 w-full border rounded-lg bg-blue-300 text-blue-800 py-2 text-sm transition-all ${
              downloadedStatement
                ? "bg-green-50 border-green-600 text-green-600"
                : "border-gray-200 text-blue-900 hover:bg-blue-50"
            }`}
          >
            {downloadedStatement ? "Downloaded" : "Download Detailed Statement"}
          </button>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, badge, badgeColor, sub, icon, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="bg-gray-50 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        {icon && <div className="text-blue-600 text-xl">{icon}</div>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <h3 className="text-2xl font-semibold">{value}</h3>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              badgeColor === "green"
                ? "bg-green-100 text-green-600"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}

      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

function RevenueRow({ label, value, width, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="mb-3 relative group cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex justify-between text-sm mb-1">
        <span className="group-hover:text-blue-600 transition-colors">{label}</span>
        <span className="group-hover:text-blue-600 transition-colors font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
        <div className={`h-2 bg-blue-600 rounded-full ${width} group-hover:bg-blue-700 transition-colors`} />
      </div>

      {tooltip && showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
