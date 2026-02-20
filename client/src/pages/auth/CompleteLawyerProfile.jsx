import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaMapMarkerAlt, FaUniversity } from "react-icons/fa";
import { MdLocationCity, MdDescription } from "react-icons/md";
import { IoCashOutline } from "react-icons/io5";

const CompleteLawyerProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    court: "",
    address: "",
    city: "",
    state: "",
    about: "",
    consultationFee: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ CORRECT HANDLE CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // remove error while typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    let newErrors = {};

    for (let key in formData) {
      if (!formData[key]) {
        newErrors[key] = "This field is required";
      }
    }

    if (formData.experience && Number(formData.experience) < 0) {
      newErrors.experience = "Experience must be positive";
    }

    if (formData.consultationFee && Number(formData.consultationFee) <= 0) {
      newErrors.consultationFee = "Fee must be greater than 0";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    alert("Profile Completed Successfully!");
    navigate("/lawyer/lawyer-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center px-4 py-12">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl p-12">

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-black">
            Complete Your Professional Profile
          </h2>
          <p className="text-gray-500 mt-2">
            Add your professional information to activate your lawyer dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Professional */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600 mb-6">
              Professional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <FaBriefcase className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Specialization"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.specialization && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.specialization}
                  </p>
                )}
              </div>

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <FaBriefcase className="text-gray-500 mr-3" />
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years of Experience"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.experience && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.experience}
                  </p>
                )}
              </div>

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <FaUniversity className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="court"
                    value={formData.court}
                    onChange={handleChange}
                    placeholder="Practicing Court"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.court && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.court}
                  </p>
                )}
              </div>

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <IoCashOutline className="text-gray-500 mr-3" />
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    placeholder="Consultation Fee (₹)"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.consultationFee && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.consultationFee}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Office */}
          <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600 mb-6">
              Office Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <FaMapMarkerAlt className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Office Address"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.address && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <MdLocationCity className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.city && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
                  <MdLocationCity className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                {errors.state && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.state}
                  </p>
                )}
              </div>

            </div>

            <div className="mt-6">
              <div className="flex items-start bg-gray-100 rounded-xl px-4 py-4">
                <MdDescription className="text-gray-500 mr-3 mt-1" />
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                  placeholder="About yourself..."
                  className="w-full bg-transparent outline-none resize-none"
                />
              </div>
              {errors.about && (
                <p className="text-blue-600 text-sm mt-1">
                  {errors.about}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            Complete Profile & Go to Dashboard
          </button>

        </form>
      </div>
    </div>
  );
};

export default CompleteLawyerProfile;
