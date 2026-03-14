import React from "react";
import { ShieldCheck, Users } from "lucide-react";

export default function UserManagement(props) {
  const {
    formType,
    setFormType,
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

  return (
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
              <div className="bg-linear-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg border-2 border-blue-200 animate-in fade-in slide-in-from-top duration-300">
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
              <div className="bg-line ar-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg border-2 border-green-200 animate-in fade-in slide-in-from-top duration-300">
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
                  onClick={handleCreateLawyer}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold hover:shadow-lg"
                >
                  Add Lawyer
                </button>
              </div>
            )}

            {/* Users Table */}
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
                      <tr className="bg-linear-to-r from-blue-50 to-blue-100">
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
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 px-6 text-center text-gray-500">
                            No users yet. Fill the form above and click Add User.
                          </td>
                        </tr>
                      )}
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteUser(user._id || user.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleInactiveUser(user._id || user.id)}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                              >
                                Inactive
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

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
                      <tr className="bg-linear-to-r from-green-50 to-green-100">
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
                            <span className="text-gray-600 text-sm font-mono">{lawyer.licenseNo || lawyer.license || "-"}</span>
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
  );
}

