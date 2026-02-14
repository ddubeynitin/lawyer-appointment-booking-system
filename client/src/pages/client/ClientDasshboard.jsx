import { FaBell, FaGavel, FaRegBell, FaSearch, FaVideo } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-200">
      <header className="bg-white shadow-sm">
        <div className="w-full mx-auto px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-0">
            <div className="w-8 h-8 text-black flex items-center justify-center rounded font-bold">
              <FaGavel/>
            </div>
            <span className="font-bold text-lg">Esue</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-shadow-2xsm font-medium ml-auto px-5">
            <Link className="text-blue-600">Dashboard</Link>
            <Link to={"/client/lawyer-list"} className="hover:text-blue-600">Search Lawyers</Link>
            <Link to={"/client/appointment-scheduling"} className="hover:text-blue-600">My Appoinments</Link>
            <Link className="hover:text-blue-600">My Profile</Link>
        </nav>

          <div className="flex items-center gap-7">
            <div className="w-9 h-9 bg-gray-200 rounded-md flex items-center justify-center">
                <LuBellRing className="text-black w-5 h-5" />
            </div>
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-9 h-9 rounded-full"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back, Alex</h1>
          <p className="text-gray-600">
            Manage your appointments and find the legal help you need.
          </p>
        </div>
        <div className="bg-gradient-to-b from-blue-700 to-blue-950 rounded-xl p-17 text-white mb-10">
          <h2 className="text-2xl font-bold mb-3 flex justify-center">
            Find the right legal help today
          </h2>
          <p className="text-sm mb-6 flex justify-center">
            Search by specialty, location, or name to book your next consultation.
          </p>
          <div className="flex justify-center">
            <div className="flex bg-white rounded-lg overflow-hidden max-w-xl">
            <div className="flex items-center justify-center px-3 text-gray-400">
            <FaSearch />
            </div>
            <input
                type="text"
                placeholder="Family Law, Corporate, Real Estate..."
                className="flex-glow px-2 w-250 py-2 outline-none text-gray-600"
            />
            <button className="bg-blue-600 px-6 text-white font-medium">
                Search
            </button>
         </div>
        </div>
        </div>

    <section className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">Upcoming Appointment</h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            CONFIRMED
            </span>
        </div>
        <h4 className="font-semibold flex justify-center">Consultation with Sarah Jenkins</h4>
        <p className="text-sm flex justify-center text-blue-600 mb-3">Family Law Specialist</p>
        <div className="text-sm text-gray-600 text-center space-y-1 mb-4">
            <p>📅 Tomorrow, Oct 24, 2023</p>
            <p>⏰ 10:00 AM – 11:00 AM (1 hr)</p>
            <p>🎥 Video Call via Zoom</p>
        </div>
        <div className="flex justify-center gap-4">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            <FaVideo /> Join Video Call
        </button>
         <button className="border px-4 py-2 rounded-lg text-sm">Reschedule</button>
        </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Appointment History</h3>
            <Link className="text-blue-600 text-sm">View All</Link>
            </div>

    <section className="bg-white rounded-xl shadow-sm p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-center py-3 px-2 text-gray-600">DATE</th>
              <th className="text-center py-3 px-2 text-gray-600">LAWYER</th>
              <th className="text-center py-3 px-2 text-gray-600">TYPE</th>
              <th className="text-center py-3 px-2 text-gray-600">STATUS</th>
              <th className="text-center py-3 px-2 text-gray-600">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white hover:bg-gray-50">
              <td className="text-center py-4">Oct 12, 2023</td>
              <td className="text-center">Michael Ross</td>
              <td className="text-center">Estate Planning</td>
              <td className="text-center">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  Completed
                </span>
              </td>
              <td className="text-center text-blue-600 cursor-pointer">View Notes</td>
            </tr>

            <tr className="bg-gray-50 hover:bg-gray-100">
              <td className="text-center py-4">Sept 05, 2023</td>
              <td className="text-center">Jessica Pearson</td>
              <td className="text-center">Contract Review</td>
              <td className="text-center">
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  Completed
                </span>
              </td>
              <td className="text-center text-blue-600 cursor-pointer">Book Again</td>
            </tr>

            <tr className="bg-white hover:bg-gray-50">
              <td className="text-center py-4">Aug 18, 2023</td>
              <td className="text-center">Louis Litt</td>
              <td className="text-center">Real Estate</td>
              <td className="text-center">
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                  Cancelled
                </span>
              </td>
              <td className="text-center text-gray-400 cursor-not-allowed">No Action</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>

    <div className="lg:col-span-3 space-y-6">
        <h3 className="font-semibold text-lg mb-2">Recommended</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((item, i) => (
        <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center"
            >
        <img
          src={`https://i.pravatar.cc/100?img=${i + 3}`}
          className="w-16 h-16 rounded-full mb-4"
          alt=""
        />
        <p className="font-medium text-gray-800">{i === 0 ? "Robert Zane" : "Rachel Zane"}</p>
        <p className="text-xs text-gray-500 mb-2">
          {i === 0 ? "Corporate Law • 15 yrs" : "Intellectual Property"}
        </p>
        <p className="text-sm text-gray-600 mb-4 px-2">
          {i === 0
            ? "Expert in corporate mergers and acquisitions with extensive experience advising multinational clients."
            : "Specializes in intellectual property rights, trademarks, and patent law with a strong track record."}
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          View Profile
        </button>
      </div>
    ))}
  </div>

  <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-xl p-6">
    <h4 className="font-semibold mb-2 flex justify-center">Need urgent help?</h4>
    <p className="text-sm mb-4 flex justify-center">
      Get matched with a lawyer in under 30 minutes.
    </p>
   <div className="flex justify-center">
    <button className="w-40 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
        Try Fast Match
    </button>
    </div>
     </div>
    </div>
    </div>
    </main>
    </div>
  );
};
export default ClientDashboard;
