import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  Settings,
  Users,
  ShieldCheck,
  DollarSign,
  CalendarDays,
  Search,
  ChevronDown,
  Menu,
  X,
  Flag,
} from "lucide-react";
import { GoLaw } from "react-icons/go";
import UserManagement from "../../components/UserManagement";
import Overview from "../../components/Overview";
import VerificationQueue from "../../components/VerificationQueue";
import Revenue from "../../components/Revenue";
import AdminNotificationBell from "../../components/AdminNotificationBell";
import AdminReportManagement from "../../components/AdminReportManagement";
import UserAppointments from "../../components/UserAppointments";
import LawyerAppointments from "../../components/LawyerAppointments";
import PaymentManagement from "../../components/PaymentManagement";
import SettingsPage from "../../components/Settings";

// Server URL - direct server routes use kar rahe hain
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userGender, setUserGender] = useState("");
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
  const [lawyerGender, setLawyerGender] = useState("");
  const [lawyerPassword, setLawyerPassword] = useState("");
  const [lawyerConfirmPassword, setLawyerConfirmPassword] = useState("");
  const [lawyerSpecializations, setLawyerSpecializations] = useState([]);
  const [lawyerProfileImage, setLawyerProfileImage] = useState({
    file: null,
    previewUrl: "",
  });
  const [lawyerFees, setLawyerFees] = useState([{ category: "", fee: "" }]);
  const [lawyerEducation, setLawyerEducation] = useState([
    { degree: "", university: "", year: "" },
  ]);
  const [lawyerLocation, setLawyerLocation] = useState({
    address: "",
    city: "",
    state: "",
  });
  const [lawyers, setLawyers] = useState([]);
  const [lawyerErrors, setLawyerErrors] = useState({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState({
    id: null,
    action: null,
  });
  const [AllLawyers, setAllLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get logged-in admin data
  const [adminData, setAdminData] = useState({ name: "Admin", email: "" });
  
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setAdminData({
          name: parsedUser.name || "Admin",
          email: parsedUser.email || "",
          role: parsedUser.role || "admin"
        });
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  const pendingVerificationCount = Array.isArray(AllLawyers)
    ? AllLawyers.filter((lawyer) => lawyer?.verification !== "Approved").length
    : 0;

  const menuItems = [
    { id: "overview", label: "Overview", icon: GoLaw },
    {
      id: "verification",
      label: "Verification Queue",
      icon: ShieldCheck,
      badge:
        pendingVerificationCount > 0 ? String(pendingVerificationCount) : null,
    },
  ];

  const operationItems = [
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "payment-management", label: "Payment Management", icon: CalendarDays },
    { id: "report-management", label: "Report Management", icon: Flag },
  ];

  const [isAppointmentMenuOpen, setIsAppointmentMenuOpen] = useState(false);

  const handleMenuClick = (menuId) => {
    if (menuId === "users" || menuId === "lawyers") {
      setIsUserMenuOpen(true);
    } else {
      setIsUserMenuOpen(false);
    }
    if (menuId === "user-appointments" || menuId === "lawyer-appointments") {
      setIsAppointmentMenuOpen(true);
    } else {
      setIsAppointmentMenuOpen(false);
    }
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert("Failed to load users");
    }
  };

  const fetchLawyers = async () => {
    try {
      const res = await axios.get(`${API_URL}/lawyers`);
      const lawyerList = Array.isArray(res.data) ? res.data : [];
      setAllLawyers(lawyerList);
      setLawyers(lawyerList);
    } catch (error) {
      console.error("Failed to fetch lawyers:", error);
      setAllLawyers([]);
      setLawyers([]);
    }
  };
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      try {
        await Promise.all([fetchLawyers(), fetchUsers()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  useEffect(() => {
    if (activeMenu === "users") {
      fetchUsers();
      fetchLawyers();
    }
    if (activeMenu === "lawyers") {
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
    if (!userConfirmPassword.trim())
      errors.userConfirmPassword = "Confirm password is required";

    if (Object.keys(errors).length > 0) {
      setUserErrors(errors);
      return;
    }

    if (userPassword !== userConfirmPassword) {
      setUserErrors({
        ...errors,
        userConfirmPassword: "Passwords do not match!",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: userName,
        email: userEmail,
        phone: userPhone,
        gender: userGender,
        password: userPassword,
        role: userRole,
      });

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
      setUserGender("");
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
    if (!lawyerLicense.trim())
      errors.lawyerLicense = "License number is required";
    if (!lawyerPassword.trim()) errors.lawyerPassword = "Password is required";
    if (!lawyerConfirmPassword.trim())
      errors.lawyerConfirmPassword = "Confirm password is required";

    if (Object.keys(errors).length > 0) {
      setLawyerErrors(errors);
      return;
    }

    if (lawyerPassword !== lawyerConfirmPassword) {
      setLawyerErrors({
        ...errors,
        lawyerConfirmPassword: "Passwords do not match!",
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: lawyerName,
        email: lawyerEmail,
        phone: lawyerPhone,
        gender: lawyerGender,
        password: lawyerPassword,
        role: "lawyer",
        licenseNo: lawyerLicense,
      });

      const createdLawyerId = response?.data?.user?.id;
      const cleanedSpecializations = (lawyerSpecializations || []).filter(
        Boolean,
      );
      const cleanedFees = (lawyerFees || [])
        .map((fee) => ({
          category: fee.category?.trim(),
          fee:
            fee.fee === "" || fee.fee === null || fee.fee === undefined
              ? undefined
              : Number(fee.fee),
        }))
        .filter((fee) => fee.category && Number.isFinite(fee.fee));
      const cleanedEducation = (lawyerEducation || [])
        .map((ed) => ({
          degree: ed.degree?.trim() || "",
          university: ed.university?.trim() || "",
          year:
            ed.year === "" || ed.year === null || ed.year === undefined
              ? undefined
              : Number(ed.year),
        }))
        .filter((ed) => ed.degree || ed.university || Number.isFinite(ed.year));
      const hasLocation =
        lawyerLocation &&
        Object.values(lawyerLocation).some(
          (value) => value && String(value).trim().length > 0,
        );
      const hasProfileDetails =
        !!lawyerProfileImage?.file ||
        cleanedSpecializations.length > 0 ||
        cleanedFees.length > 0 ||
        cleanedEducation.length > 0 ||
        hasLocation ||
        (lawyerDescription && lawyerDescription.trim().length > 0) ||
        (lawyerExperience !== "" &&
          lawyerExperience !== null &&
          lawyerExperience !== undefined);

      if (createdLawyerId && hasProfileDetails) {
        const formData = new FormData();
        if (lawyerProfileImage?.file) {
          formData.append("profileImage", lawyerProfileImage.file);
        }
        if (hasLocation) {
          formData.append("location", JSON.stringify(lawyerLocation));
        }
        if (cleanedEducation.length > 0) {
          formData.append("education", JSON.stringify(cleanedEducation));
        }
        if (cleanedSpecializations.length > 0) {
          formData.append(
            "specializations",
            JSON.stringify(cleanedSpecializations),
          );
        }
        if (cleanedFees.length > 0) {
          formData.append("feesByCategory", JSON.stringify(cleanedFees));
        }
        if (
          lawyerExperience !== "" &&
          lawyerExperience !== null &&
          lawyerExperience !== undefined
        ) {
          formData.append("experience", String(lawyerExperience));
        }
        if (lawyerDescription && lawyerDescription.trim().length > 0) {
          formData.append("bio", lawyerDescription.trim());
        }

        // Complete profile with image upload - server route
        await axios.patch(
          `${API_URL}/lawyers/complete-profile/${createdLawyerId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      setLawyerName("");
      setLawyerEmail("");
      setLawyerPhone("");
      setLawyerLicense("");
      setLawyerSpecializations([]);
      setLawyerProfileImage({ file: null, previewUrl: "" });
      setLawyerFees([{ category: "", fee: "" }]);
      setLawyerEducation([{ degree: "", university: "", year: "" }]);
      setLawyerLocation({ address: "", city: "", state: "" });
      setLawyerExperience("");
      setLawyerDescription("");
      setLawyerGender("");
      setLawyerPassword("");
      setLawyerConfirmPassword("");
      setLawyerErrors({});

      await fetchLawyers();
      alert(`Lawyer "${lawyerName}" added successfully!`);
    } catch (error) {
      console.error("Failed to create lawyer:", error);
      const apiError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to create lawyer";
      alert(apiError);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      alert("User id not found");
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      await fetchUsers();
      alert("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete user";
      alert(apiError);
    }
  };

  const handleInactiveUser = async (userId) => {
    if (!userId) {
      alert("User id not found");
      return;
    }

    try {
      await axios.put(`${API_URL}/users/${userId}`, {
        isActive: false,
      });
      await fetchUsers();
      alert("User marked as inactive");
    } catch (error) {
      if (error?.response?.status === 404) {
        await fetchUsers();
        alert("User marked as inactive");
        return;
      }

      console.error("Failed to inactivate user:", error);
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to inactivate user";
      alert(apiError);
    }
  };

  const handleApproveLawyer = async (lawyerId) => {
    if (!lawyerId) {
      alert("Lawyer id not found");
      return;
    }

    setVerificationLoading({ id: lawyerId, action: "approve" });
    try {
      await axios.put(`${API_URL}/lawyers/update-lawyer/${lawyerId}`, {
        verification: "Approved",
      });
      setAllLawyers((prev) =>
        prev.map((lawyer) =>
          lawyer._id === lawyerId
            ? { ...lawyer, verification: "Approved" }
            : lawyer,
        ),
      );
      setLawyers((prev) =>
        prev.map((lawyer) =>
          lawyer._id === lawyerId
            ? { ...lawyer, verification: "Approved" }
            : lawyer,
        ),
      );
      alert("Lawyer approved successfully");
    } catch (error) {
      console.error("Failed to approve lawyer:", error);
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to approve lawyer";
      alert(apiError);
    } finally {
      setVerificationLoading({ id: null, action: null });
    }
  };

  const handleRejectLawyer = async (lawyerId) => {
    if (!lawyerId) {
      alert("Lawyer id not found");
      return;
    }

    setVerificationLoading({ id: lawyerId, action: "reject" });
    try {
      await axios.delete(`${API_URL}/lawyers/delete-lawyer/${lawyerId}`);
      setAllLawyers((prev) => prev.filter((lawyer) => lawyer._id !== lawyerId));
      setLawyers((prev) => prev.filter((lawyer) => lawyer._id !== lawyerId));
      alert("Lawyer rejected successfully");
    } catch (error) {
      console.error("Failed to reject lawyer:", error);
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to reject lawyer";
      alert(apiError);
    } finally {
      setVerificationLoading({ id: null, action: null });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F9FC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#F7F9FC] lg:flex-row overflow-auto lg:overflow-hidden font-barlow">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 px-6 py-6 flex flex-col justify-between transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:w-65 lg:border-b-0 lg:max-h-screen lg:overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db #f3f4f6" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-6 lg:mb-10">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold">
              <GoLaw />
            </div>
            <div>
              <p className="font-semibold leading-none text-2xl">
                Justif
                <span className="text-blue-500">Ai</span>
              </p>
              <span className="text-xs text-gray-400">Admin Controller</span>
            </div>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
            >
              <X size={18} />
            </button>
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
                <li>
                  <div
                    onClick={() =>
                      setIsUserMenuOpen((prev) => {
                        const next = !prev;
                        if (
                          next &&
                          activeMenu !== "users" &&
                          activeMenu !== "lawyers"
                        ) {
                          setActiveMenu("users");
                        }
                        return next;
                      })
                    }
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      activeMenu === "users" || activeMenu === "lawyers"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users size={18} /> Management
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  {isUserMenuOpen && (
                    <ul className="mt-2 space-y-1">
                      <li
                        onClick={() => handleMenuClick("users")}
                        className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          activeMenu === "users"
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        User Management
                      </li>
                      <li
                        onClick={() => handleMenuClick("lawyers")}
                        className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          activeMenu === "lawyers"
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Lawyer Management
                      </li>
                    </ul>
                  )}
                </li>
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
                <li>
                  <div
                    onClick={() =>
                      setIsAppointmentMenuOpen((prev) => {
                        const next = !prev;
                        if (
                          next &&
                          activeMenu !== "user-appointments" &&
                          activeMenu !== "lawyer-appointments"
                        ) {
                          setActiveMenu("user-appointments");
                        }
                        return next;
                      })
                    }
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      activeMenu === "user-appointments" ||
                      activeMenu === "lawyer-appointments"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays size={18} /> Appointments
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${isAppointmentMenuOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  {isAppointmentMenuOpen && (
                    <ul className="mt-2 space-y-1">
                      <li
                        onClick={() => handleMenuClick("user-appointments")}
                        className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          activeMenu === "user-appointments"
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        User Appointments
                      </li>
                      <li
                        onClick={() => handleMenuClick("lawyer-appointments")}
                        className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                          activeMenu === "lawyer-appointments"
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Lawyer Appointments
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-6 lg:mt-0">
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
          <p className="text-xs text-green-600 mt-2">
            ● All systems operational
          </p>
        </div>
      </aside>

      <main
        className={`flex-1 p-4 sm:p-6 lg:p-8 pb-10 ${
          activeMenu === "lawyers"
            ? "overflow-hidden"
            : activeMenu === "users"
              ? "overflow-visible"
              : "overflow-auto"
        }`}
      >
        <div className="flex flex-col gap-4 mb-6 lg:mb-8 lg:flex-row lg:justify-between lg:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold">
              {activeMenu === "overview" && "Dashboard Overview"}
              {activeMenu === "users" && "User Management"}
              {activeMenu === "lawyers" && "Lawyer Management"}
              {activeMenu === "verification" && "Verification Queue"}
              {activeMenu === "revenue" && "Revenue"}
              {activeMenu === "user-appointments" && "User Appointments"}
              {activeMenu === "lawyer-appointments" && "Lawyer Appointments"}
              {activeMenu === "payment-management" && "Payment Management"}
              {activeMenu === "report-management" && "Report Management"}
              {activeMenu === "settings" && "Settings"}
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <AdminNotificationBell />
            </div>
            <div className="relative w-full sm:w-auto">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition"
              />
              <input
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full sm:w-[320px] hover:border-blue-500 hover:ring-2 hover:ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Search for clients, lawyers or invoices"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src="/assets/images/profile.png"
                className="rounded-full w-9 h-9 cursor-pointer hover:shadow-lg hover:scale-110 transition-all duration-200"
              />
              <div className="text-sm">
                <p className="font-medium leading-none">{adminData.name}</p>
                <span className="text-xs text-gray-400">{adminData.role === "admin" ? "Admin" : "Super Admin"}</span>
              </div>
            </div>
          </div>
        </div>

        {activeMenu === "overview" && (
          <Overview
            usersCount={Array.isArray(users) ? users.length : 0}
            lawyersCount={Array.isArray(lawyers) ? lawyers.length : 0}
            activeLawyersCount={
              Array.isArray(lawyers)
                ? lawyers.filter(
                    (lawyer) => lawyer?.verification === "Approved",
                  ).length
                : 0
            }
            todayAppointmentsCount={0}
            users={users}
            lawyers={lawyers}
          />
        )}

        {activeMenu === "users" && (
          <UserManagement
            mode="users"
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
            userRole={userRole}
            setUserRole={setUserRole}
            userGender={userGender}
            setUserGender={setUserGender}
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
            lawyerGender={lawyerGender}
            setLawyerGender={setLawyerGender}
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
        {activeMenu === "lawyers" && (
          <UserManagement
            mode="lawyers"
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
            userRole={userRole}
            setUserRole={setUserRole}
            userGender={userGender}
            setUserGender={setUserGender}
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
            lawyerGender={lawyerGender}
            setLawyerGender={setLawyerGender}
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
        {activeMenu === "verification" && (
          <VerificationQueue
            allLawyers={AllLawyers}
            onApprove={handleApproveLawyer}
            onReject={handleRejectLawyer}
            processingId={verificationLoading.id}
            processingAction={verificationLoading.action}
          />
        )}

        {activeMenu === "revenue" && <Revenue />}

        {activeMenu === "user-appointments" && <UserAppointments />}

        {activeMenu === "lawyer-appointments" && <LawyerAppointments />}

        {activeMenu === "payment-management" && <PaymentManagement />}

        {activeMenu === "report-management" && <AdminReportManagement />}

        {activeMenu === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}
