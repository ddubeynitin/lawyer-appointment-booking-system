import {FaCalendarAlt,FaUsers,FaFileAlt,FaCog,FaSearch,FaPlus,FaGavel,} from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";

const LawyerDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col justify-between">
        <div>
          <div className="px-6 py-6 flex items-center gap-2 text-xl font-bold">
            <FaGavel/>
            Esue
          </div>
          <nav className="px-4 space-y-1 text-sm mr-2 mt-2">
            <MenuItem label="Dashboard" active />
            <MenuItem label="Calendar" />
            <MenuItem label="Requests" badge="3" />
            <MenuItem label="Clients" />
            <MenuItem label="Case Files" />
          </nav>
        </div>

        <div className="border-t border-gray-200 p-4">
          <MenuItem label="Settings" />
          <div className="flex items-center gap-3 mt-4">
            <img
              src="https://i.pravatar.cc/40"
              className="w-11 h-11 rounded-full"
              alt="profile"
            />
            <div>
              <p className="text-sm font-medium">Harvey Specter</p>
              <p className="text-xs text-gray-500">Senior Partner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg w-full max-w-xl">
            <FaSearch className="text-gray-400" />
            <input
              placeholder="Search clients, cases, or documents..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <LuBellRing />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <FaPlus /> New Appointment
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6 space-y-6">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl font-bold">Good Morning, Harvey</h1>
            <p className="text-sm text-gray-500">
              Here’s what’s happening in your practice today, Tuesday Oct 24.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Appointments Today" value="4" icon={<FaCalendarAlt />} />
            <StatCard title="Pending Requests" value="3" sub="+1 new" />
            <StatCard title="Active Clients" value="128" sub="+5%" />
            <StatCard title="Hours Billed" value="32.5" sub="This week" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* Up Next */}
              <Card title="Up Next" badge="Starts in 15m">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://i.pravatar.cc/80"
                      className="w-14 h-14 rounded-lg"
                      alt="client"
                    />
                    <div>
                      <p className="font-semibold">Sarah Jenkins</p>
                      <p className="text-sm text-gray-500">
                        Estate Planning Consultation • Case #23901
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="border border-gray-200 px-4 py-2 rounded-lg text-sm">
                      Details
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                      Join Meeting
                    </button>
                  </div>
                </div>
              </Card>

              {/* Schedule */}
              <Card title="Today’s Schedule" right="Oct 24, 2023">
                <ScheduleItem time="09:00 AM" title="Team Standup" done />
                <ScheduleItem
                  time="10:00 AM"
                  title="Sarah Jenkins - Consultation"
                  sub="Zoom Meeting • ID: 492-392"
                  active
                />
                <ScheduleItem
                  time="01:00 PM"
                  title="Lunch with Partner"
                  sub="Downtown Bistro"
                  purple
                />
                <ScheduleItem
                  time="02:30 PM"
                  title="Michael Ross - Case Review"
                  sub="Office 4B"
                />
              </Card>
            </div>

            {/* RIGHT */}
            <div className="space-y-7 ">
              <Card title="New Requests" action="View All">
                <RequestItem name="Louis M." type="Corporate Law" />
                <RequestItem name="Donna P." type="Contract Review" />
              </Card>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Quick Notes</h4>
                <textarea
                  placeholder="Type a note..."
                  className="w-full bg-transparent outline-none text-sm h-24"
                />
                <button className="text-sm text-blue-600 mt-2">Save</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const MenuItem = ({ label, active, badge }) => (
  <div
    className={`flex justify-between items-center px-4 py-2 rounded-lg cursor-pointer ${
      active ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <span>{label}</span>
    {badge && (
      <span className="text-xs bg-red-500 text-white px-2 rounded-full">
        {badge}
      </span>
    )}
  </div>
);

const StatCard = ({ title, value, sub, icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm text-gray-600">{title}</p>
      {icon && <span className="text-blue-600">{icon}</span>}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-green-600">{sub}</p>}
  </div>
);

const Card = ({ title, badge, action, right, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">{title}</h3>
      {badge && (
        <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      {action && <span className="text-sm text-blue-600">{action}</span>}
      {right && <span className="text-sm text-gray-500">{right}</span>}
    </div>
    {children}
  </div>
);

const ScheduleItem = ({ time, title, sub, active, purple, done }) => (
  <div
    className={`flex gap-4 py-3 pl-4 border-l-4 ${
      active
        ? "border-blue-600 bg-blue-50"
        : purple
        ? "border-purple-500 bg-purple-50"
        : done
        ? "border-green-500"
        : "border-gray-200"
    }`}
  >
    <span className="text-sm text-gray-500 w-20">{time}</span>
    <div>
      <p className="font-medium">{title}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </div>
);

const RequestItem = ({ name, type }) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-xs text-gray-500">{type}</p>
    </div>
    <div className="flex gap-2">
      <button className="border px-3 py-1 rounded-lg text-xs">Decline</button>
      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">
        Accept
      </button>
    </div>
  </div>
);

export default LawyerDashboard;
