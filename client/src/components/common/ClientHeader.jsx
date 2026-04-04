import React, { useEffect, useRef, useState } from 'react'
import axios from "axios";
import { FaGavel, FaSearch, FaVideo, FaTimes, FaPen, FaCamera } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TfiMenuAlt } from "react-icons/tfi";
import { Link, useNavigate } from 'react-router-dom';
import BookingNotifications from "../BookingNotifications";
import { API_URL } from "../../utils/api";

const ClientHeader = () => {
    // const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileUpdateError, setProfileUpdateError] = useState("");
    const [profileUpdateSuccess, setProfileUpdateSuccess] = useState("");
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [profileForm, setProfileForm] = useState({
      name: "",
      email: "",
      phone: "",
      gender: "",
      city: "",
      state: "",
    });
    const profileRef = useRef(null);

    const { user, token, login, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
    logout();
    navigate("/");
  };

  const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };

  const openProfileModal = (editMode = true) => {
    setShowProfileDropdown(false);
    setShowProfileModal(true);
    setIsEditingProfile(editMode);
  };

  useEffect(() => {
    if (!showProfileModal) return;

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      city: user?.city || "",
      state: user?.state || "",
    });
    setProfileImagePreview(
      user?.profilePicture || user?.profileImage?.url || "/assets/images/user.png",
    );
    setProfileImageFile(null);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");
  }, [showProfileModal, user]);

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim().toLowerCase();
    const trimmedPhone = profileForm.phone.trim();
    const trimmedGender = profileForm.gender.trim();
    const trimmedCity = profileForm.city.trim();
    const trimmedState = profileForm.state.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedGender) {
      setProfileUpdateError("Name, email, phone, and gender are required.");
      setProfileUpdateSuccess("");
      return;
    }

    if (!trimmedCity || !trimmedState) {
      setProfileUpdateError("City and state are required.");
      setProfileUpdateSuccess("");
      return;
    }

    setIsSavingProfile(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");

    try {
      const payload = new FormData();
      payload.append("name", trimmedName);
      payload.append("email", trimmedEmail);
      payload.append("phone", trimmedPhone);
      payload.append("gender", trimmedGender);
      payload.append("city", trimmedCity);
      payload.append("state", trimmedState);

      if (profileImageFile) {
        payload.append("profilePicture", profileImageFile);
      }

      const response = await axios.put(`${API_URL}/users/${user.id}`, payload, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      const updatedUser = response.data;

      login({
        token,
        user: {
          ...user,
          id: updatedUser._id || updatedUser.id || user.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          gender: updatedUser.gender || "",
          city: updatedUser.city || "",
          state: updatedUser.state || "",
          profilePicture: updatedUser.profilePicture || null,
        },
      });

      setProfileForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        gender: updatedUser.gender || "",
        city: updatedUser.city || "",
        state: updatedUser.state || "",
      });
      setProfileImagePreview(updatedUser.profilePicture || "/assets/images/user.png");
      setIsEditingProfile(false);
      setProfileUpdateSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileUpdateError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update profile right now.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };
  return (
    <>
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={showMenu} className="sm:hidden">
            <TfiMenuAlt />
            {isMenuVisible && (
              <div className="absolute top-19 left-0 w-50 rounded-br-2xl rounded-tr-2xl border border-dashed border-gray-300 bg-white pt-5 pb-5">
                <nav className="flex flex-col items-center gap-8 text-sm font-medium text-slate-600 md:hidden">
                  <Link
                    to="/client/lawyer-list"
                    className="flex items-center gap-2 transition hover:text-blue-600"
                  >
                    <FaSearch /> Find Lawyer
                  </Link>
                  {user ? (
                    <Link
                      to={
                        user.role === "lawyer"
                          ? "/lawyer/lawyer-dashboard"
                          : "/client/client-dashboard"
                      }
                      className="transition hover:text-blue-600"
                    >
                      Your Dashboard
                    </Link>
                  ) : null}
                  <Link className="font-semibold text-blue-600">Dashboard</Link>
                  <Link
                    to="/client/appointment-history"
                    className="hover:text-blue-600"
                  >
                    Appointments
                  </Link>
                </nav>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FaGavel className="text-xl text-blue-700" />
            <Link to="/">
              <span className="text-xl font-bold text-gray-800">
                Justif<span className="text-blue-500">Ai</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 font-medium text-gray-600 md:flex">
            <Link to="/client/client-dashboard" className="font-semibold text-blue-600">Dashboard</Link>
            <Link to="/client/lawyer-list" className="hover:text-blue-600">
              Search Lawyers
            </Link>
            <Link
              to="/client/appointment-history"
              className="hover:text-blue-600"
            >
              Appointments
            </Link>
          </nav>

          <div className="relative flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              aria-label="Open messages"
            >
              <MessageCircle size={18} />
            </button>

            {user?.id && (
              <BookingNotifications
                userId={user.id}
                recipientType="user"
              />
            )}

            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold uppercase text-blue-600 ring-2 ring-blue-500"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user?.name?.charAt(0) || "U"}</span>
                )}
              </div>

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl transition-all duration-300 ease-out z-50 ${
                  showProfileDropdown
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                }`}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold uppercase text-blue-600 ring-2 ring-blue-500">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{user?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{user?.name}</h4>
                    <p className="text-sm text-gray-500">
                      {user?.role === "user" ? "Client" : user?.role}
                    </p>
                  </div>
                </div>

                <div className="my-3 border-t border-gray-100"></div>

                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => {
                      openProfileModal(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => openProfileModal(true)}
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="relative w-[min(92vw,48rem)] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowProfileModal(false)}
            >
              <FaTimes />
            </button>

            <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Client Profile
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {isEditingProfile ? "Edit your details" : "Profile overview"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep your contact information current and optionally add a profile image so lawyers can recognize you faster.
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-3xl font-semibold uppercase text-blue-700 ring-4 ring-white">
                      {profileImagePreview &&
                      profileImagePreview !== "/assets/images/user.png" ? (
                        <img
                          src={profileImagePreview}
                          alt="client profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{profileForm.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    {isEditingProfile ? (
                      <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
                        <FaPen className="text-[11px]" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                      </label>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {profileForm.name || user?.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {user?.role === "user" ? "Client" : user?.role}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {isEditingProfile
                        ? "Tap the pen to add or update your photo."
                        : "Open edit mode to update your profile."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Account Details
                    </p>
                    <h4 className="mt-2 text-xl font-bold text-slate-900">
                      {isEditingProfile
                        ? "Update information"
                        : "Saved information"}
                    </h4>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <FaPen className="text-xs" />
                      Edit
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={profileForm.gender}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                    options={["Male", "Female", "Other"]}
                  />
                  <Field
                    label="City"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                  <Field
                    label="State"
                    name="state"
                    value={profileForm.state}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                  />
                </div>

                {profileUpdateError ? (
                  <p className="mt-4 text-sm text-red-600">
                    {profileUpdateError}
                  </p>
                ) : null}

                {profileUpdateSuccess ? (
                  <p className="mt-4 text-sm text-green-600">
                    {profileUpdateSuccess}
                  </p>
                ) : null}

                {isEditingProfile ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleProfileSave}
                      disabled={isSavingProfile}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingProfile ? (
                        <span className="inline-flex items-center gap-2">
                          <FaCamera className="animate-pulse" />
                          Saving...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          gender: user?.gender || "",
                          city: user?.city || "",
                          state: user?.state || "",
                        });
                        setProfileImageFile(null);
                        setProfileImagePreview(
                          user?.profilePicture ||
                            user?.profileImage?.url ||
                            "/assets/images/user.png",
                        );
                        setProfileUpdateError("");
                        setProfileUpdateSuccess("");
                      }}
                      disabled={isSavingProfile}
                      className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

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

export default ClientHeader
