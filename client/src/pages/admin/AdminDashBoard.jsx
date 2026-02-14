import React, { useState } from "react";
import { Bell,Settings,Users,ShieldCheck,DollarSign,CalendarDays,Search,Network} from "lucide-react";
import { GoLaw } from "react-icons/go";
import { FaFileAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoGitNetwork } from "react-icons/io5";


export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [downloadedStatement, setDownloadedStatement] = useState(false);
  const [selectedRange, setSelectedRange] = useState("monthly");
  const [verifiedLawyers, setVerifiedLawyers] = useState([]);
  const menuItems = [
    { id: "overview", label: "Overview", icon: GoLaw },
    { id: "users", label: "User Management", icon: Users }, 
    { id: "verification", label: "Verification Queue", icon: ShieldCheck, badge: "12" },
  ];  

  const operationItems = [
    { id: "financials", label: "Financials", icon: DollarSign },
    { id: "appointments", label: "Appointments", icon: CalendarDays },
    { id: "reports", label: "Reports", icon: CalendarDays },
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleVerifyLawyer = (lawyerName) => {
    setVerifiedLawyers([...verifiedLawyers, lawyerName]);
    alert(`${lawyerName} has been verified successfully!`);
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-sans">
      {/* Sidebar */}
      <aside className="w-65 bg-white border-r border-gray-200 px-6 py-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
             <GoLaw />
            </div>
            <div>
              <p className="font-semibold leading-none">EsueBook</p>
              <span className="text-xs text-gray-400">Admin Controller</span>
            </div>
          </div>

          <nav className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 mb-3">MAIN MENU</p>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`flex items-center ${
                        item.badge ? "justify-between" : "gap-3"
                      } px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        activeMenu === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={18} /> {item.label}
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-3">OPERATIONS</p>
              <ul className="space-y-2">
                {operationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        activeMenu === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <IconComponent size={18} /> {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        <div>
          <div
            onClick={() => handleMenuClick("settings")}
            className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg transition-all ${
              activeMenu === "settings"
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Settings size={16} /> Settings
          </div>
          <p className="text-xs text-green-600 mt-2">● All systems operational</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">
            {activeMenu === "overview" && "Dashboard Overview"}
            {activeMenu === "users" && "User Management"}
            {activeMenu === "verification" && "Verification Queue"}
            {activeMenu === "financial" && "Financial"}
            {activeMenu === "appointments" && "Appointments"}
            {activeMenu === "reports" && "Reports"}
            {activeMenu === "settings" && "Settings"}
          </h1>

          <div className="flex items-center gap-4 ">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition" />
              <input
                className="pl-9 pr-4 py-2 text-sm border  border-gray-200 rounded-lg w-[320px] hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"     
                placeholder="Search for clients, lawyers or invoices"
              />
            </div>
              <div className="relative">
                <div className="bg-blue-100 p-2 rounded-full inline-flex items-center justify-center">
                  <Bell className="text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
              <img
                src="https://i.pravatar.cc/40"
                className="rounded-full w-9 h-9 cursor-pointer hover:shadow-lg hover:scale-110 transition-all duration-200"
              />
              <div className="text-sm">
                <p className="font-medium leading-none">Alex Sterling</p>
                <span className="text-xs text-gray-400">Super Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        {activeMenu === "overview" && (
          <div className="bg-gray-100 p-4 rounded-xl space-x-6">
        <div className="grid grid-cols-4 gap-6 mb-8 ">
          <StatCard title="Total Registered Users" value="12,450" badge="+5.2%" badgeColor="green" icon={<FaUser />} tooltip="Breakdown: 8,200 Clients | 4,250 Lawyers"/>
          <StatCard title="Lawyers Network" value="952" sub="840 Active" icon={<IoGitNetwork className="w-7 h-7 text-blue-700  text-7xl font-bold rounded-md bg-blue-100"  />} tooltip="Verified lawyers in the network"/>
          <StatCard title="Total Revenue (Monthly)" value="$45,200" badge="+12.4%" badgeColor="green" icon={<DollarSign />} tooltip="Revenue from all consultations & bookings"/>
          <StatCard title="Appointments Today" value="156" badge="High Traffic" badgeColor="purple" icon={<CalendarDays />} tooltip="Active bookings for today"/>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-3 gap-6">    
          <div className="col-span-2 bg-gray-50 p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Appointment Volume</h3>
                <p className="text-xs text-gray-400">
                  {selectedRange === "monthly"
                    ? "Tracking daily booking requests for the last 30 days"
                    : "Tracking daily booking requests for the last 7 days"}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
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

          <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
            <h3 className="font-semibold mb-4">Revenue Growth</h3>
            <RevenueRow label="Family Law" value="$18,400" width="w-[75%]" tooltip="40% of total revenue"/>
            <RevenueRow label="Corporate" value="$12,100" width="w-[55%]" tooltip="27% of total revenue"/>
            <RevenueRow label="Real Estate" value="$8,900" width="w-[40%]" tooltip="20% of total revenue"/>
            <RevenueRow label="Criminal Defense" value="$5,800" width="w-[30%]" tooltip="13% of total revenue"/>
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
              {downloadedStatement ? "✓ Downloaded" : "Download Detailed Statement"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-50 mt-8 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Pending Lawyer Verifications</h3>
            <button
              onClick={() => setShowAllApplications(!showAllApplications)}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              {showAllApplications ? "Hide All Applications" : "View All Applications"}
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-gray-400 bg-gray-100">
              <tr>
                <th className="text-left py-2">Lawyer Profile</th>
                <th>Specialization</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="py-3 flex items-center gap-3">
                  <img src="  " className="rounded-full" />
                  <div>
                    <p className="font-medium">Sarah Jenkins</p>
                    <span className="text-xs text-gray-400">s.jenkins@legalmail.com</span>
                  </div>
                </td>
                <td>Intellectual Property</td>
                <td>Oct 28, 2023</td>
                <td className="text-green-600">Validated</td>
                <td>
                  <button 
                    onClick={() => handleVerifyLawyer('Sarah Jenkins')}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 cursor-pointer transition"
                  >
                    ✓ Verified
                  </button>
                </td>
              </tr>
              {showAllApplications && (
                <>
                  <tr className="bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <img src="https://i.pravatar.cc/33" className="rounded-full" />
                      <div>
                        <p className="font-medium">John Anderson</p>
                        <span className="text-xs text-gray-400">j.anderson@legalmail.com</span>
                      </div>
                    </td>
                    <td>Corporate Law</td>
                    <td>Oct 27, 2023</td>
                    <td className="text-yellow-600">Pending Review</td>
                    <td>
                      <button 
                        onClick={() => handleVerifyLawyer('John Anderson')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 cursor-pointer transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <img src="https://i.pravatar.cc/34" className="rounded-full" />
                      <div>
                        <p className="font-medium">Emily Watson</p>
                        <span className="text-xs text-gray-400">e.watson@legalmail.com</span>
                      </div>
                    </td>
                    <td>Family Law</td>
                    <td>Oct 26, 2023</td>
                    <td className="text-red-600">Rejected</td>
                    <td>
                      <button 
                        onClick={() => handleVerifyLawyer('Emily Watson')}
                        className="px-3 py-1 bg-gray-400 text-white rounded-md text-xs hover:bg-gray-500 cursor-pointer transition"
                      >
                        Resubmit
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-blue-50 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <img src="https://i.pravatar.cc/35" className="rounded-full" />
                      <div>
                        <p className="font-medium">Michael Brown</p>
                        <span className="text-xs text-gray-400">m.brown@legalmail.com</span>
                      </div>
                    </td>
                    <td>Criminal Defense</td>
                    <td>Oct 25, 2023</td>
                    <td className="text-yellow-600">Pending Review</td>
                    <td>
                      <button 
                        onClick={() => handleVerifyLawyer('Michael Brown')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 cursor-pointer transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        </div>
        )}

        {/* User Management Content */}
        {activeMenu === "users" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-500">User management content will be displayed here.</p>
          </div>
        )}

        {/* Verification Queue Content */}
        {activeMenu === "verification" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Verification Queue</h2>
            <p className="text-gray-500">Verification queue content will be displayed here.</p>
          </div>
        )}

        {/* Financials Content */}
        {activeMenu === "financials" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Financials</h2>
            <p className="text-gray-500">Financial reports and data will be displayed here.</p>
          </div>
        )}

        {/* Appointments Content */}
        {activeMenu === "appointments" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Appointments</h2>
            <p className="text-gray-500">Appointment details and scheduling will be displayed here.</p>
          </div>
        )}

        {/* Reports Content */}
        {activeMenu === "reports" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p className="text-gray-500">Reports and analytics will be displayed here.</p>
          </div>
        )}

        {/* Settings Content */}
        {activeMenu === "settings" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-500">System settings and configurations will be displayed here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, badge, badgeColor, sub, icon, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`bg-gray-50 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer relative`}
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
