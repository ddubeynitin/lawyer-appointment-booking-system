import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Settings, Users, ShieldCheck, DollarSign, CalendarDays, Search } from "lucide-react";
import { GoLaw } from "react-icons/go";
import UserManagement from "../../components/UserManagement";
import Overview from "../../components/Overview";
import VerificationQueue from "../../components/VerificationQueue";
import Financials from "../../components/Financials";
import Appointments from "../../components/Appointments";
import Reports from "../../components/Reports";
import SettingsPage from "../../components/Settings";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const normalizeBaseUrl = (url = "") => url.trim().replace(/\/+$/, "");

const API_BASE_CANDIDATES = Array.from(
  new Set(
    [
      normalizeBaseUrl(VITE_API_BASE_URL),
      normalizeBaseUrl(window.location.origin),
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    ].filter(Boolean)
  )
);

const requestWithFallback = async (method, path, payload) => {
  let lastError;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${path}`,
        data: payload,
      });
      return response;
    } catch (error) {
      lastError = error;
      const isNetworkError = !error?.response;
      if (!isNetworkError) {
        throw error;
      }
    }
  }

  throw lastError;
};

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("overview");
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
  };  const fetchUsers = async () => {
    try {
      const response = await requestWithFallback("get", "/api/users");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Failed to load users");
    }
  };
  
  const [AllLawyers, setAllLawyers] = useState([]);
  const fetchLawyers = async () => {
    try {         
      const res = await requestWithFallback("get", "/api/lawyers");
      const lawyerList = Array.isArray(res.data) ? res.data : [];
      setAllLawyers(lawyerList);
      setLawyers(lawyerList);
    } catch (error) {
      console.error("Failed to fetch lawyers:", error);
      setAllLawyers([]);
      setLawyers([]);
    }
  };

  useEffect(()=>{
    fetchLawyers();
  },[]);  

  useEffect(() => {
    if (activeMenu === "users") {
      fetchUsers();
      fetchLawyers();
    }
    if (activeMenu === "verification") {
      fetchLawyers();
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
      const response = await requestWithFallback("post", "/api/auth/register", {
        name: userName,
        email: userEmail,
        phone: userPhone,
        password: userPassword,
        role: userRole,
      });

      // Immediate UI update so the new row appears right after clicking Add User
      if (userRole === "user") {
        const createdUser = response?.data?.user;
        setUsers((prev) => [
          ...prev,
          {
            id: createdUser?.id,
            name: createdUser?.name || userName,
            email: createdUser?.email || userEmail,
            phone: userPhone,
            role: "user",
          },
        ]);
      }

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

  const handleCreateLawyer = async () => {
    const errors = {};

    if (!lawyerName.trim()) errors.lawyerName = "Lawyer name is required";
    if (!lawyerEmail.trim()) errors.lawyerEmail = "Email is required";
    if (!lawyerPhone.trim()) errors.lawyerPhone = "Phone number is required";
    if (!lawyerLicense.trim()) errors.lawyerLicense = "License number is required";
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

    try {
      await requestWithFallback("post", "/api/auth/register", {
        name: lawyerName,
        email: lawyerEmail,
        phone: lawyerPhone,
        password: lawyerPassword,
        role: "lawyer",
        licenseNo: lawyerLicense,
      });

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

      await fetchLawyers();
      alert(`Lawyer "${lawyerName}" added successfully!`);
    } catch (error) {
      console.error("Failed to create lawyer:", error);
      const apiError = error?.response?.data?.error || error?.response?.data?.message || "Failed to create lawyer";
      alert(apiError);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      alert("User id not found");
      return;
    }

    try {
      await requestWithFallback("delete", `/api/users/${userId}`);
      await fetchUsers();
      alert("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      const apiError = error?.response?.data?.message || error?.response?.data?.error || "Failed to delete user";
      alert(apiError);
    }
  };

  const handleInactiveUser = async (userId) => {
    if (!userId) {
      alert("User id not found");
      return;
    }

    try {
      await requestWithFallback("put", `/api/users/${userId}`, { isActive: false });
      await fetchUsers();
      alert("User marked as inactive");
    } catch (error) {
      // Backend may still update isActive=false but return 404 for inactive users.
      if (error?.response?.status === 404) {
        await fetchUsers();
        alert("User marked as inactive");
        return;
      }

      console.error("Failed to inactivate user:", error);
      const apiError = error?.response?.data?.message || error?.response?.data?.error || "Failed to inactivate user";
      alert(apiError);
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC] font-sans">
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
      <main className="flex-1 p-8 overflow-x-scroll">
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

        {/* Overview Content */}
        {activeMenu === "overview" && <Overview />}

        {/* User Management Content */}
        {activeMenu === "users" && (
          <UserManagement
            formType={formType}
            setFormType={setFormType}
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
            userRole={userRole}
            setUserRole={setUserRole}
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            userConfirmPassword={userConfirmPassword}
            setUserConfirmPassword={setUserConfirmPassword}
            userErrors={userErrors}
            setUserErrors={setUserErrors}
            handleCreateUser={handleCreateUser}
            handleDeleteUser={handleDeleteUser}
            handleInactiveUser={handleInactiveUser}
            handleCreateLawyer={handleCreateLawyer}
            lawyerName={lawyerName}
            setLawyerName={setLawyerName}
            lawyerEmail={lawyerEmail}
            setLawyerEmail={setLawyerEmail}
            lawyerPhone={lawyerPhone}
            setLawyerPhone={setLawyerPhone}
            lawyerLicense={lawyerLicense}
            setLawyerLicense={setLawyerLicense}
            lawyerSpecializations={lawyerSpecializations}
            setLawyerSpecializations={setLawyerSpecializations}
            lawyerExperience={lawyerExperience}
            setLawyerExperience={setLawyerExperience}
            lawyerProfileImage={lawyerProfileImage}
            setLawyerProfileImage={setLawyerProfileImage}
            lawyerFees={lawyerFees}
            setLawyerFees={setLawyerFees}
            lawyerEducation={lawyerEducation}
            setLawyerEducation={setLawyerEducation}
            lawyerLocation={lawyerLocation}
            setLawyerLocation={setLawyerLocation}
            lawyerDescription={lawyerDescription}
            setLawyerDescription={setLawyerDescription}
            lawyerPassword={lawyerPassword}
            setLawyerPassword={setLawyerPassword}
            lawyerConfirmPassword={lawyerConfirmPassword}
            setLawyerConfirmPassword={setLawyerConfirmPassword}
            lawyerErrors={lawyerErrors}
            setLawyerErrors={setLawyerErrors}
            lawyers={lawyers}
            setLawyers={setLawyers}
            users={users}
            setUsers={setUsers}
          />
        )}
        {/* Verification Queue Content */}
        {activeMenu === "verification" && <VerificationQueue allLawyers={AllLawyers} />}

        {/* Financials Content */}
        {activeMenu === "financials" && <Financials />}

        {/* Appointments Content */}
        {activeMenu === "appointments" && <Appointments />}

        {/* Reports Content */}
        {activeMenu === "reports" && <Reports />}

        {/* Settings Content */}
        {activeMenu === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}


