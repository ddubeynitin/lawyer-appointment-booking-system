import React, { useEffect, useRef, useState } from "react";

export default function UserManagement(props) {
  const { mode } = props;
  const {
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    userPhone,
    setUserPhone,
    userRole,
    setUserRole,
    userPassword,
    setUserPassword,
    userConfirmPassword,
    setUserConfirmPassword,
    userErrors,
    setUserErrors,
    handleCreateUser,
    handleDeleteUser,
    handleInactiveUser,
    handleCreateLawyer,
    lawyerName,
    setLawyerName,
    lawyerEmail,
    setLawyerEmail,
    lawyerPhone,
    setLawyerPhone,
    lawyerLicense,
    setLawyerLicense,
    lawyerSpecializations,
    setLawyerSpecializations,
    lawyerExperience,
    setLawyerExperience,
    lawyerProfileImage,
    setLawyerProfileImage,
    lawyerFees,
    setLawyerFees,
    lawyerEducation,
    setLawyerEducation,
    lawyerLocation,
    setLawyerLocation,
    lawyerDescription,
    setLawyerDescription,
    lawyerPassword,
    setLawyerPassword,
    lawyerConfirmPassword,
    setLawyerConfirmPassword,
    lawyerErrors,
    setLawyerErrors,
    lawyers,
    setLawyers,
    users,
    setUsers,
  } = props;

  const [showForm, setShowForm] = useState(true);
  const userFormRef = useRef(null);
  const lawyerFormRef = useRef(null);
  const [isUserFormAtEnd, setIsUserFormAtEnd] = useState(false);
  const [isLawyerFormAtEnd, setIsLawyerFormAtEnd] = useState(false);

  const handleListView = () => {
    setShowForm(false);
  };

  const checkScrollEnd = (el, setter) => {
    if (!el) return;
    const isAtEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    setter(isAtEnd);
  };

  useEffect(() => {
    if (mode === "users" && showForm) {
      checkScrollEnd(userFormRef.current, setIsUserFormAtEnd);
    }
    if (mode === "lawyers" && showForm) {
      checkScrollEnd(lawyerFormRef.current, setIsLawyerFormAtEnd);
    }
  }, [mode, showForm]);

  useEffect(() => {
    // When switching between users/lawyers, default back to form view.
    setShowForm(true);
  }, [mode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {mode === "users" && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:bg-blue-700"
          >
            Add User Form
          </button>
        )}
        {mode === "lawyers" && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 bg-green-600 text-white shadow-lg hover:bg-green-700"
          >
            Add Lawyer Form
          </button>
        )}
        <button
          onClick={() => handleListView()}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
            mode === "users"
              ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
              : "bg-green-600 text-white shadow-lg hover:bg-green-700"
          }`}
        >
          List
        </button>
      </div>

      {mode === "users" && showForm && (
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-300">
          <div
            ref={userFormRef}
            onScroll={() =>
              checkScrollEnd(userFormRef.current, setIsUserFormAtEnd)
            }
            className="max-h-[70vh] overflow-y-auto px-8 pt-8 pb-4"
            style={{ scrollbarWidth: "thin" }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-blue-900">
              Create New User
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  User Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setUserErrors({ ...userErrors, userName: "" });
                  }}
                  placeholder="Enter user name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userName
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                />
                {userErrors.userName && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    setUserErrors({ ...userErrors, userEmail: "" });
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userEmail
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                />
                {userErrors.userEmail && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userEmail}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => {
                    setUserPhone(e.target.value);
                    setUserErrors({ ...userErrors, userPhone: "" });
                  }}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userPhone
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                />
                {userErrors.userPhone && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userPhone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  Role
                </label>
                <select
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    setUserErrors({ ...userErrors, userRole: "" });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userRole
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {userErrors.userRole && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userRole}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    setUserErrors({ ...userErrors, userPassword: "" });
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userPassword
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                />
                {userErrors.userPassword && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={userConfirmPassword}
                  onChange={(e) => {
                    setUserConfirmPassword(e.target.value);
                    setUserErrors({ ...userErrors, userConfirmPassword: "" });
                  }}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    userErrors.userConfirmPassword
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-blue-200 focus:ring-blue-500"
                  }`}
                />
                {userErrors.userConfirmPassword && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {userErrors.userConfirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 px-8 pb-8 pt-4 bg-blue-50/80 backdrop-blur border-t border-blue-100">
            {!isUserFormAtEnd && (
              <p className="text-xs text-blue-700/70 mb-2">
                Scroll to the bottom to enable Add User
              </p>
            )}
            <button
              onClick={handleCreateUser}
              disabled={!isUserFormAtEnd}
              className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${
                isUserFormAtEnd
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                  : "bg-blue-300 text-white/70 cursor-not-allowed"
              }`}
            >
              Add User
            </button>
          </div>
        </div>
      )}
      {mode === "users" && !showForm && (
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-300">
          <div
            className="max-h-[70vh] overflow-y-auto px-8 py-6"
            style={{ scrollbarWidth: "thin" }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-blue-900">
              User List
            </h2>
            {Array.isArray(users) && users.length > 0 ? (
              <div className="space-y-4">
                {users.map((user, idx) => {
                  const userId = user?._id ?? user?.id;
                  const isActive =
                    user?.isActive === undefined || user?.isActive === null
                      ? true
                      : Boolean(user.isActive);
                  return (
                    <div
                      key={userId || `user-${idx}`}
                      className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            user?.profileImage?.url ||
                            user?.avatar ||
                            "https://i.pravatar.cc/40"
                          }
                          alt={user?.name || user?.userName || "User"}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-blue-900">
                            {user?.name || user?.userName || "Unnamed User"}
                          </p>
                          <p className="text-xs text-blue-800/80">
                            {user?.email || user?.userEmail || "No email"} ·{" "}
                            {user?.phone || user?.userPhone || "No phone"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-blue-900">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5">
                              {user?.role || user?.userRole || "user"}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 ${
                                isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleInactiveUser(userId)}
                          disabled={!userId || !isActive}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            !userId || !isActive
                              ? "cursor-not-allowed bg-gray-200 text-gray-500"
                              : "bg-yellow-500 text-white hover:bg-yellow-600"
                          }`}
                        >
                          Mark Inactive
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(userId)}
                          disabled={!userId}
                          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            !userId
                              ? "cursor-not-allowed bg-gray-200 text-gray-500"
                              : "bg-red-500 text-white hover:bg-red-600"
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-blue-800/80">No users found.</p>
            )}
          </div>
        </div>
      )}
      {mode === "lawyers" && showForm && (
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl shadow-lg border-2 border-green-200 animate-in fade-in slide-in-from-top duration-300">
          <div
            ref={lawyerFormRef}
            onScroll={() =>
              checkScrollEnd(lawyerFormRef.current, setIsLawyerFormAtEnd)
            }
            className="max-h-[70vh] overflow-y-auto px-8 pt-8 pb-4"
            style={{ scrollbarWidth: "thin" }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-green-900">
              Create New Lawyer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Lawyer Name
                </label>
                <input
                  type="text"
                  value={lawyerName}
                  onChange={(e) => {
                    setLawyerName(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerName: "" });
                  }}
                  placeholder="Enter lawyer name"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerName
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerName && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  value={lawyerEmail}
                  onChange={(e) => {
                    setLawyerEmail(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerEmail: "" });
                  }}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerEmail
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerEmail && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerEmail}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={lawyerPhone}
                  onChange={(e) => {
                    setLawyerPhone(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerPhone: "" });
                  }}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerPhone
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerPhone && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerPhone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  License Number
                </label>
                <input
                  type="text"
                  value={lawyerLicense}
                  onChange={(e) => {
                    setLawyerLicense(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerLicense: "" });
                  }}
                  placeholder="Enter license number"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerLicense
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerLicense && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerLicense}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Specializations
                </label>
                <select
                  multiple
                  value={lawyerSpecializations}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    );
                    setLawyerSpecializations(options);
                    setLawyerErrors({
                      ...lawyerErrors,
                      lawyerSpecializations: "",
                    });
                  }}
                  className={`w-full h-32 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerSpecializations
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                >
                  <option value="Criminal">Criminal</option>
                  <option value="Civil">Civil</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Family">Family</option>
                  <option value="Property">Property</option>
                </select>
                {lawyerErrors.lawyerSpecializations && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerSpecializations}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={lawyerExperience}
                  onChange={(e) => {
                    setLawyerExperience(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerExperience: "" });
                  }}
                  placeholder="Enter years of experience"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerExperience
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerExperience && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerExperience}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      setLawyerProfileImage({ file, previewUrl });
                    } else {
                      setLawyerProfileImage({ file: null, previewUrl: "" });
                    }
                  }}
                  className="w-full"
                />
                {lawyerProfileImage?.previewUrl && (
                  <img
                    src={lawyerProfileImage.previewUrl}
                    alt="preview"
                    className="mt-3 w-28 h-28 object-cover rounded-md"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Fees by Category
                </label>
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
                        <option value="Criminal">Criminal</option>
                        <option value="Civil">Civil</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Family">Family</option>
                        <option value="Property">Property</option>
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
                        onClick={() =>
                          setLawyerFees(lawyerFees.filter((_, i) => i !== idx))
                        }
                        className="px-2 bg-red-500 text-white rounded"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setLawyerFees([...lawyerFees, { category: "", fee: "" }])
                    }
                    type="button"
                    className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
                  >
                    Add Fee
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Location
                </label>
                <input
                  type="text"
                  value={lawyerLocation.address}
                  onChange={(e) =>
                    setLawyerLocation({
                      ...lawyerLocation,
                      address: e.target.value,
                    })
                  }
                  placeholder="Street address"
                  className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition border-green-200 focus:ring-green-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <input
                    type="text"
                    value={lawyerLocation.city}
                    onChange={(e) =>
                      setLawyerLocation({
                        ...lawyerLocation,
                        city: e.target.value,
                      })
                    }
                    placeholder="City"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={lawyerLocation.state}
                    onChange={(e) =>
                      setLawyerLocation({
                        ...lawyerLocation,
                        state: e.target.value,
                      })
                    }
                    placeholder="State"
                    className="px-3 py-2 border rounded"
                  />
                </div>
                {lawyerErrors.lawyerLocation && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerLocation}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Education
                </label>
                <div className="space-y-2">
                  {lawyerEducation.map((ed, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                    >
                      <input
                        type="text"
                        value={ed.degree}
                        onChange={(e) => {
                          const arr = [...lawyerEducation];
                          arr[idx].degree = e.target.value;
                          setLawyerEducation(arr);
                        }}
                        placeholder="Degree"
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        value={ed.university}
                        onChange={(e) => {
                          const arr = [...lawyerEducation];
                          arr[idx].university = e.target.value;
                          setLawyerEducation(arr);
                        }}
                        placeholder="University"
                        className="px-3 py-2 border rounded"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={ed.year}
                          onChange={(e) => {
                            const arr = [...lawyerEducation];
                            arr[idx].year = e.target.value;
                            setLawyerEducation(arr);
                          }}
                          placeholder="Year"
                          className="w-24 px-3 py-2 border rounded"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setLawyerEducation(
                              lawyerEducation.filter((_, i) => i !== idx),
                            )
                          }
                          className="px-2 bg-red-500 text-white rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setLawyerEducation([
                        ...lawyerEducation,
                        { degree: "", university: "", year: "" },
                      ])
                    }
                    className="mt-2 px-3 py-2 bg-green-600 text-white rounded"
                  >
                    Add Education
                  </button>
                  {lawyerErrors.lawyerEducation && (
                    <p className="text-red-600 text-xs mt-2 font-semibold">
                      {lawyerErrors.lawyerEducation}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Description
                </label>
                <textarea
                  value={lawyerDescription}
                  onChange={(e) => {
                    setLawyerDescription(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerDescription: "" });
                  }}
                  placeholder="Enter professional description"
                  rows="3"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerDescription
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerDescription && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerDescription}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={lawyerPassword}
                  onChange={(e) => {
                    setLawyerPassword(e.target.value);
                    setLawyerErrors({ ...lawyerErrors, lawyerPassword: "" });
                  }}
                  placeholder="Enter password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerPassword
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerPassword && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-green-900 mb-3">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={lawyerConfirmPassword}
                  onChange={(e) => {
                    setLawyerConfirmPassword(e.target.value);
                    setLawyerErrors({
                      ...lawyerErrors,
                      lawyerConfirmPassword: "",
                    });
                  }}
                  placeholder="Confirm password"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-white transition ${
                    lawyerErrors.lawyerConfirmPassword
                      ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                      : "border-green-200 focus:ring-green-500"
                  }`}
                />
                {lawyerErrors.lawyerConfirmPassword && (
                  <p className="text-red-600 text-xs mt-2 font-semibold">
                    {lawyerErrors.lawyerConfirmPassword}
                  </p>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 mt-6 pb-6 bg-green-50/80 border-t border-green-100">
              {!isLawyerFormAtEnd && (
                <p className="text-xs text-green-700/70 mb-2">
                  Scroll to the bottom to enable Add Lawyer
                </p>
              )}
              <button
                onClick={handleCreateLawyer}
                disabled={!isLawyerFormAtEnd}
                className={`w-full px-6 py-3 rounded-lg transition-all duration-200 font-semibold ${
                  isLawyerFormAtEnd
                    ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                    : "bg-green-300 text-white/70 cursor-not-allowed"
                }`}
              >
                Add Lawyer
              </button>
            </div>
          </div>
        </div>
      )}
      {mode === "lawyers" && !showForm && (
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl shadow-lg border-2 border-green-200 animate-in fade-in slide-in-from-top duration-300">
          <div
            className="max-h-[70vh] overflow-y-auto px-8 py-6"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-green-900">
                Lawyer List
              </h2>
              <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-semibold text-green-800">
                {Array.isArray(lawyers) ? lawyers.length : 0} Lawyers
              </span>
            </div>
            {Array.isArray(lawyers) && lawyers.length > 0 ? (
              <div className="space-y-4">
                {lawyers.map((lawyer, idx) => {
                  const lawyerId = lawyer?._id ?? lawyer?.id;
                  const specializationList = Array.isArray(
                    lawyer?.specializations,
                  )
                    ? lawyer.specializations.filter(Boolean)
                    : [];
                  return (
                    <div
                      key={lawyerId || `lawyer-${idx}`}
                      className="flex flex-col gap-3 rounded-lg border border-green-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            lawyer?.profileImage?.url ||
                            lawyer?.avatar ||
                            "https://i.pravatar.cc/40"
                          }
                          alt={lawyer?.name || lawyer?.lawyerName || "Lawyer"}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-green-900">
                            {lawyer?.name ||
                              lawyer?.lawyerName ||
                              "Unnamed Lawyer"}
                          </p>
                          <p className="text-xs text-green-800/80">
                            {lawyer?.email || lawyer?.lawyerEmail || "No email"} ·{" "}
                            {lawyer?.phone || lawyer?.lawyerPhone || "No phone"}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-green-900">
                            {(lawyer?.licenseNo ||
                              lawyer?.license ||
                              lawyer?.lawyerLicense) && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5">
                                License:{" "}
                                {lawyer?.licenseNo ||
                                  lawyer?.license ||
                                  lawyer?.lawyerLicense}
                              </span>
                            )}
                            {lawyer?.verification && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5">
                                {lawyer.verification}
                              </span>
                            )}
                            {specializationList.length > 0 && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5">
                                {specializationList.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-green-800/80">No lawyers found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

