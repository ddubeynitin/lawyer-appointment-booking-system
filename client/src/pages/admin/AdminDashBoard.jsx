import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell,Settings,Users,ShieldCheck,DollarSign,CalendarDays,Search,Network} from "lucide-react";
import { GoLaw } from "react-icons/go";
import { FaFileAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { IoGitNetwork } from "react-icons/io5";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [downloadedStatement, setDownloadedStatement] = useState(false);
  const [selectedRange, setSelectedRange] = useState("monthly");
  const [verifiedLawyers, setVerifiedLawyers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userPassword, setUserPassword] = useState("");
  const [userConfirmPassword, setUserConfirmPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [userErrors, setUserErrors] = useState({});
  const [lawyerName, setLawyerName] = useState("");
  const [lawyerEmail, setLawyerEmail] = useState("");
  const [lawyerPhone, setLawyerPhone] = useState("");
  const [lawyerLicense, setLawyerLicense] = useState("");
  const [lawyerExperience, setLawyerExperience] = useState("");
  const [lawyerDescription, setLawyerDescription] = useState("");
  const [lawyerPassword, setLawyerPassword] = useState("");
  const [lawyerConfirmPassword, setLawyerConfirmPassword] = useState("");
  const [lawyerSpecializations, setLawyerSpecializations] = useState([]);
  const [lawyerProfileImage, setLawyerProfileImage] = useState("");
  const [lawyerFees, setLawyerFees] = useState([{ category: "", fee: "" }]);                          
  const [lawyerEducation, setLawyerEducation] = useState([{ degree: "", university: "", year: "" }]);
  const [lawyerLocation, setLawyerLocation] = useState({ address: "", city: "", state: "" });
  const [lawyers, setLawyers] = useState([]);
  const [lawyerErrors, setLawyerErrors] = useState({});
  const [formType, setFormType] = useState(null); 
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${VITE_API_BASE_URL}/api/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    if (activeMenu === "users") {
      fetchUsers();
    }
  }, [activeMenu]);

  const handleCreateUser = async () => {
    const errors = {};

    if (!userName.trim()) errors.userName = "User name is required";
    if (!userEmail.trim()) errors.userEmail = "Email is required";
    if (!userPhone.trim()) errors.userPhone = "Phone number is required";
    if (!userRole.trim()) errors.userRole = "Role is required";
    if (!userPassword.trim()) errors.userPassword = "Password is required";
    if (!userConfirmPassword.trim()) errors.userConfirmPassword = "Confirm password is required";

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      return;
    }

    if (userPassword !== userConfirmPassword) {
      setUserErrors({ ...errors, userConfirmPassword: "Passwords do not match!" });
      return;
    }

    try {
      await axios.post(`${VITE_API_BASE_URL}/api/auth/register`, {
        name: userName,
        email: userEmail,
        phone: userPhone,
        password: userPassword,
        role: userRole,
      });

      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setUserRole("user");
      setUserPassword("");
      setUserConfirmPassword("");
      setUserErrors({});

      await fetchUsers();
      alert(`User "${userName}" added successfully!`);
    } catch (error) {
      console.error("Failed to create user:", error);
      const apiError = error?.response?.data?.error || "Failed to create user";
      alert(apiError);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-sans">
      {/* Sidebar */}                       
      <aside className="w-65 bg-white border-r border-gray-200 px-6 py-6 flex flex-col justify-between overflow-y-auto max-h-screen" style={{"scrollbarWidth": "thin", "scrollbarColor": "#d1d5db #f3f4f6"}}>
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
          <div className="space-y-6">
            {/* Toggle Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setFormType(formType === "user" ? null : "user")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  formType === "user"
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Users size={20} />
                Add New User
              </button>
              <button
                onClick={() => setFormType(formType === "lawyer" ? null : "lawyer")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  formType === "lawyer"
                    ? "bg-green-600 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ShieldCheck size={20} />
                Add New Lawyer
              </button>
            </div>

            {/* Add User Form - Animated */}
            {formType === "user" && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-300">
                <h2 className="text-2xl font-semibold mb-6 text-blue-900">Create New User</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">User Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => { setUserName(e.target.value); setUserErrors({...userErrors, userName: ""}); }}
                      placeholder="Enter user name"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userName ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.userName && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userName}</p>}
                    {!userErrors.userName && <p className="text-xs text-gray-600 mt-2">👤 Enter the full name of the client user</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => { setUserEmail(e.target.value); setUserErrors({...userErrors, userEmail: ""});}}
                      placeholder="Enter email address"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userEmail ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.userEmail && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userEmail}</p>}
                    {!userErrors.userEmail && <p className="text-xs text-gray-600 mt-2">✉️ Must be a valid email format (example@domain.com)</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => { setUserPhone(e.target.value); setUserErrors({...userErrors, userPhone: ""}); }}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userPhone ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.userPhone && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userPhone}</p>}
                    {!userErrors.userPhone && <p className="text-xs text-gray-600 mt-2">📱 Enter a valid contact number</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">Role</label>
                    <select
                      value={userRole}
                      onChange={(e) => { setUserRole(e.target.value); setUserErrors({...userErrors, userRole: ""}); }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userRole ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {userErrors.userRole && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userRole}</p>}
                    {!userErrors.userRole && <p className="text-xs text-gray-600 mt-2">Select which role to create</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">Password</label>
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => { setUserPassword(e.target.value); setUserErrors({...userErrors, userPassword: ""}); }}
                      placeholder="Enter password"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userPassword ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.userPassword && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userPassword}</p>}
                    {!userErrors.userPassword && <p className="text-xs text-gray-600 mt-2">🔒 Min 8 chars, uppercase, lowercase, number & special char</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-3">Confirm Password</label>
                    <input
                      type="password"
                      value={userConfirmPassword}
                      onChange={(e) => { setUserConfirmPassword(e.target.value); setUserErrors({...userErrors, userConfirmPassword: ""}); }}
                      placeholder="Confirm password"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        userErrors.userConfirmPassword ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-blue-200 focus:ring-blue-500'
                      }`}
                    />
                    {userErrors.userConfirmPassword && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {userErrors.userConfirmPassword}</p>}
                    {!userErrors.userConfirmPassword && <p className="text-xs text-gray-600 mt-2">🔐 Must match the password above</p>}
                  </div>
                </div>
                <button
                  onClick={handleCreateUser}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold hover:shadow-lg"
                >
                  Add User
                </button>
              </div>
            )}

            {/* Add Lawyer Form - Animated */}
            {formType === "lawyer" && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg border-2 border-green-200 animate-in fade-in slide-in-from-top duration-300">
                <h2 className="text-2xl font-semibold mb-6 text-green-900">Create New Lawyer</h2>
                
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Lawyer Name</label>
                    <input
                      type="text"
                      value={lawyerName}
                      onChange={(e) => { setLawyerName(e.target.value); setLawyerErrors({...lawyerErrors, lawyerName: ""}); }}
                      placeholder="Enter lawyer name"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerName ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerName && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerName}</p>}
                    {!lawyerErrors.lawyerName && <p className="text-xs text-gray-600 mt-2">⚖️ Full name of the lawyer</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Email Address</label>
                    <input
                      type="email"
                      value={lawyerEmail}
                      onChange={(e) => { setLawyerEmail(e.target.value); setLawyerErrors({...lawyerErrors, lawyerEmail: ""}); }}
                      placeholder="Enter email address"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerEmail ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerEmail && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerEmail}</p>}
                    {!lawyerErrors.lawyerEmail && <p className="text-xs text-gray-600 mt-2">✉️ Valid email address for communication</p>}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      value={lawyerPhone}
                      onChange={(e) => { setLawyerPhone(e.target.value); setLawyerErrors({...lawyerErrors, lawyerPhone: ""}); }}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerPhone ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerPhone && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerPhone}</p>}
                    {!lawyerErrors.lawyerPhone && <p className="text-xs text-gray-600 mt-2">📱 Contact phone number with country code</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">License Number</label>
                    <input
                      type="text"
                      value={lawyerLicense}
                      onChange={(e) => { setLawyerLicense(e.target.value); setLawyerErrors({...lawyerErrors, lawyerLicense: ""}); }}
                      placeholder="Enter license number"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerLicense ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerLicense && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerLicense}</p>}
                    {!lawyerErrors.lawyerLicense && <p className="text-xs text-gray-600 mt-2">📜 Bar council or legal license number</p>}
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Specializations</label>
                    <select
                      multiple
                      value={lawyerSpecializations}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions).map(o => o.value);
                        setLawyerSpecializations(options);
                        setLawyerErrors({...lawyerErrors, lawyerSpecializations: ""});
                      }}
                      className={`w-full h-32 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerSpecializations ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    >
                      <option value="Family Law">Family Law</option>
                      <option value="Criminal Law">Criminal Law</option>
                      <option value="Corporate Law">Corporate Law</option>
                      <option value="Real Estate Law">Real Estate Law</option>
                      <option value="Intellectual Property">Intellectual Property</option>
                      <option value="Labor Law">Labor Law</option>
                      <option value="Property Law">Property Law</option>
                    </select>
                    {lawyerErrors.lawyerSpecializations && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerSpecializations}</p>}
                    {!lawyerErrors.lawyerSpecializations && <p className="text-xs text-gray-600 mt-2">Select one or more practice areas (hold Ctrl/Cmd to multi-select)</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Years of Experience</label>
                    <input
                      type="number"
                      value={lawyerExperience}
                      onChange={(e) => { setLawyerExperience(e.target.value); setLawyerErrors({...lawyerErrors, lawyerExperience: ""}); }}
                      placeholder="Enter years of experience"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerExperience ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerExperience && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerExperience}</p>}
                    {!lawyerErrors.lawyerExperience && <p className="text-xs text-gray-600 mt-2">📅 0-70 years of professional experience</p>}
                  </div>
                </div>

                {/* Row 3b - Profile Image & Fees */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Profile Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setLawyerProfileImage(url);
                        } else {
                          setLawyerProfileImage("");
                        }
                      }}
                      className="w-full"
                    />
                    {lawyerProfileImage && <img src={lawyerProfileImage} alt="preview" className="mt-3 w-28 h-28 object-cover rounded-md" />}
                    <p className="text-xs text-gray-600 mt-2">Upload a professional profile photo (optional)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Fees by Category</label>
                    <div className="space-y-2">
                      {lawyerFees.map((f, idx) => (
                        <div key={idx} className="flex gap-2">
                          <select
                            value={f.category}
                            onChange={(e) => {
                              const newFees = [...lawyerFees];
                              newFees[idx].category = e.target.value;
                              setLawyerFees(newFees);
                            }}
                            className="flex-1 px-3 py-2 border rounded"
                          >
                            <option value="">Select category</option>
                            <option value="Family Law">Family Law</option>
                            <option value="Criminal Law">Criminal Law</option>
                            <option value="Corporate Law">Corporate Law</option>
                            <option value="Real Estate Law">Real Estate Law</option>
                            <option value="Intellectual Property">Intellectual Property</option>
                            <option value="Labor Law">Labor Law</option>
                          </select>
                          <input
                            type="number"
                            value={f.fee}
                            onChange={(e) => {
                              const newFees = [...lawyerFees];
                              newFees[idx].fee = e.target.value;
                              setLawyerFees(newFees);
                            }}
                            placeholder="Fee"
                            className="w-28 px-3 py-2 border rounded"
                          />
                          <button
                            onClick={() => setLawyerFees(lawyerFees.filter((_, i) => i !== idx))}
                            className="px-2 bg-red-500 text-white rounded"
                            type="button"
                          >Remove</button>
                        </div>
                      ))}
                      <button
                        onClick={() => setLawyerFees([...lawyerFees, { category: "", fee: "" }])}
                        type="button"
                        className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
                      >Add Fee</button>
                    </div>
                  </div>
                </div>

                {/* Row 3c - Location & Education */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Location</label>
                    <input
                      type="text"
                      value={lawyerLocation.address}
                      onChange={(e) => setLawyerLocation({...lawyerLocation, address: e.target.value})}
                      placeholder="Street address"
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition border-green-200 focus:ring-green-500"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <input
                        type="text"
                        value={lawyerLocation.city}
                        onChange={(e) => setLawyerLocation({...lawyerLocation, city: e.target.value})}
                        placeholder="City"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        value={lawyerLocation.state}
                        onChange={(e) => setLawyerLocation({...lawyerLocation, state: e.target.value})}
                        placeholder="State"
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                    {!lawyerErrors.lawyerLocation && <p className="text-xs text-gray-600 mt-2">Optional: used for display in listings</p>}
                    {lawyerErrors.lawyerLocation && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerLocation}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Education</label>
                    <div className="space-y-2">
                      {lawyerEducation.map((ed, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={ed.degree}
                            onChange={(e) => {
                              const arr = [...lawyerEducation]; arr[idx].degree = e.target.value; setLawyerEducation(arr);
                            }}
                            placeholder="Degree"
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="text"
                            value={ed.university}
                            onChange={(e) => {
                              const arr = [...lawyerEducation]; arr[idx].university = e.target.value; setLawyerEducation(arr);
                            }}
                            placeholder="University"
                            className="px-3 py-2 border rounded"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={ed.year}
                              onChange={(e) => {
                                const arr = [...lawyerEducation]; arr[idx].year = e.target.value; setLawyerEducation(arr);
                              }}
                              placeholder="Year"
                              className="w-24 px-3 py-2 border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => setLawyerEducation(lawyerEducation.filter((_, i) => i !== idx))}
                              className="px-2 bg-red-500 text-white rounded"
                            >Remove</button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setLawyerEducation([...lawyerEducation, { degree: "", university: "", year: "" }])}
                        className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
                      >Add Education</button>
                      {lawyerErrors.lawyerEducation && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerEducation}</p>}
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-green-900 mb-3">Description</label>
                  <textarea
                    value={lawyerDescription}
                    onChange={(e) => { setLawyerDescription(e.target.value); setLawyerErrors({...lawyerErrors, lawyerDescription: ""}); }}
                    placeholder="Enter professional description"
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                      lawyerErrors.lawyerDescription ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                    }`}
                  />
                  {lawyerErrors.lawyerDescription && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerDescription}</p>}
                  {!lawyerErrors.lawyerDescription && <p className="text-xs text-gray-600 mt-2">📝 Brief description of expertise & background (min 10 characters)</p>}
                </div>

                {/* Row 5 - Password */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Password</label>
                    <input
                      type="password"
                      value={lawyerPassword}
                      onChange={(e) => { setLawyerPassword(e.target.value); setLawyerErrors({...lawyerErrors, lawyerPassword: ""}); }}
                      placeholder="Enter password"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerPassword ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerPassword && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerPassword}</p>}
                    {!lawyerErrors.lawyerPassword && <p className="text-xs text-gray-600 mt-2">🔒 Min 8 chars, uppercase, lowercase, number & special char</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-900 mb-3">Confirm Password</label>
                    <input
                      type="password"
                      value={lawyerConfirmPassword}
                      onChange={(e) => { setLawyerConfirmPassword(e.target.value); setLawyerErrors({...lawyerErrors, lawyerConfirmPassword: ""}); }}
                      placeholder="Confirm password"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                        lawyerErrors.lawyerConfirmPassword ? 'border-red-500 ring-2 ring-red-500 bg-red-50' : 'border-green-200 focus:ring-green-500'
                      }`}
                    />
                    {lawyerErrors.lawyerConfirmPassword && <p className="text-red-600 text-xs mt-2 font-semibold">❌ {lawyerErrors.lawyerConfirmPassword}</p>}
                    {!lawyerErrors.lawyerConfirmPassword && <p className="text-xs text-gray-600 mt-2">🔐 Must match the password above</p>}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const errors = {};
                    
                    if (!lawyerName.trim()) errors.lawyerName = "Lawyer name is required";
                    if (!lawyerEmail.trim()) errors.lawyerEmail = "Email is required";
                    if (!lawyerPhone.trim()) errors.lawyerPhone = "Phone number is required";
                    if (!lawyerLicense.trim()) errors.lawyerLicense = "License number is required";
                    if (!lawyerSpecializations || lawyerSpecializations.length === 0) errors.lawyerSpecializations = "Select at least one specialization";
                    if (!lawyerExperience) errors.lawyerExperience = "Years of experience is required";
                    if (!lawyerLocation.address || !lawyerLocation.address.trim()) errors.lawyerLocation = "Address is required";
                    const eduInvalid = !lawyerEducation || lawyerEducation.length === 0 || lawyerEducation.some(e => !e.degree.trim() || !e.university.trim() || !e.year);
                    if (eduInvalid) errors.lawyerEducation = "Provide at least one valid education entry";
                    if (!lawyerDescription.trim()) errors.lawyerDescription = "Description is required";
                    if (!lawyerPassword.trim()) errors.lawyerPassword = "Password is required";
                    if (!lawyerConfirmPassword.trim()) errors.lawyerConfirmPassword = "Confirm password is required";
                    
                    if (Object.keys(errors).length > 0) {
                      setLawyerErrors(errors);
                      return;
                    }

                    if (lawyerPassword !== lawyerConfirmPassword) {
                      setLawyerErrors({ ...errors, lawyerConfirmPassword: "Passwords do not match!" });
                      return;
                    }
                    
                    setLawyers([...lawyers, { 
                      name: lawyerName, 
                      email: lawyerEmail,
                      phone: lawyerPhone,
                      licenseNo: lawyerLicense,
                      specializations: lawyerSpecializations,
                      profileImage: lawyerProfileImage,
                      feesByCategory: lawyerFees,
                      education: lawyerEducation,
                      location: lawyerLocation,
                      experience: lawyerExperience,
                      description: lawyerDescription,
                      password: lawyerPassword
                    }]);
                    setLawyerName("");
                    setLawyerEmail("");
                    setLawyerPhone("");
                    setLawyerLicense("");
                    setLawyerSpecializations([]);
                    setLawyerProfileImage("");
                    setLawyerFees([{ category: "", fee: "" }]);
                    setLawyerEducation([{ degree: "", university: "", year: "" }]);
                    setLawyerLocation({ address: "", city: "", state: "" });
                    setLawyerExperience("");
                    setLawyerDescription("");
                    setLawyerPassword("");
                    setLawyerConfirmPassword("");
                    setLawyerErrors({});
                    alert(`Lawyer "${lawyerName}" added successfully!`);
                  }}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold hover:shadow-lg"
                >
                  Add Lawyer
                </button>
              </div>
            )}

            {/* Users Table */}
            {users.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    Users List  
                    <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">{users.length}</span>
                  </h3>
                </div>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">👤 User Name</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">✉️ Email Address</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">📱 Phone Number</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">🎭 Role</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">⚡ Action</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr 
                          key={index} 
                          className={`transition-all duration-200 border-b border-gray-100 hover:shadow-md hover:scale-[1.01] ${
                            index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                          } hover:bg-blue-100`}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                                {(user.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 flex items-center gap-2">
                              <span className="text-blue-500">📧</span>
                              {user.email}
                            </span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm">{user.phone || "-"}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm capitalize">{user.role || "-"}</span>
                          </td>
                          <td className="py-5 px-6">
                            <button
                              onClick={() => setUsers(users.filter((_, i) => i !== index))}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lawyers Table */}
            {lawyers.length > 0 && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-100 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-green-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <ShieldCheck size={24} className="text-green-600" />
                    </div>
                    Lawyers List
                    <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">{lawyers.length}</span>
                  </h3>
                </div>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-50 to-green-100">
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">⚖️ Lawyer Name</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">✉️ Email</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">📱 Phone</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">📜 License</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">🎯 Specializations</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">📅 Experience</div>
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                          <div className="flex items-center gap-2">⚡ Action</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lawyers.map((lawyer, index) => (
                        <tr 
                          key={index} 
                          className={`transition-all duration-200 border-b border-gray-100 hover:shadow-md hover:scale-[1.01] ${
                            index % 2 === 0 ? 'bg-white' : 'bg-green-50'
                          } hover:bg-green-100`}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-sm">
                                {lawyer.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900">{lawyer.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm">{lawyer.email}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm">{lawyer.phone}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm font-mono">{lawyer.license}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">{(lawyer.specializations || []).join(', ')}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-gray-600 text-sm font-semibold">{lawyer.experience} yrs</span>
                          </td>
                          <td className="py-5 px-6">
                            <button
                              onClick={() => setLawyers(lawyers.filter((_, i) => i !== index))}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
