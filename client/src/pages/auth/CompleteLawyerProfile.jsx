import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaBuilding,
  FaGraduationCap,
  FaImage,
  FaArrowLeft,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_URL } from "../../utils/api";
import LoadingFallback from "../../components/LoadingFallback.jsx";
import { MdCancel } from "react-icons/md";
const specializationOptions = [
  "Criminal",
  "Civil",
  "Corporate",
  "Family",
  "Property",
];

const CompleteLawyerProfile = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    profileImage: null,
    bio: "",
    experience: "",
    practiceCourt: "",
    specializations: [],
    fees: {},
    education: [{ degree: "", university: "", passingYear: "" }],
    address: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================= BASIC INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
  };

  // ================= SPECIALIZATION =================
  const handleSpecializationChange = (value) => {
    setFormData((prev) => {
      const updated = prev.specializations.includes(value)
        ? prev.specializations.filter((v) => v !== value)
        : [...prev.specializations, value];

      const updatedFees = { ...prev.fees };
      if (!updated.includes(value)) {
        delete updatedFees[value];
      }

      return {
        ...prev,
        specializations: updated,
        fees: updatedFees,
      };
    });
  };

  const handleFeeChange = (spec, value) => {
    setFormData((prev) => ({
      ...prev,
      fees: { ...prev.fees, [spec]: value },
    }));
  };

  // ================= EDUCATION =================
  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: "", university: "", passingYear: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    const updated = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: updated });
  };

  // ================= VALIDATION =================
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.profileImage)
        newErrors.profileImage = "Profile image required";

      if (!formData.bio.trim()) newErrors.bio = "Bio required";
      else if (formData.bio.length < 20)
        newErrors.bio = "Bio must be at least 20 characters";

      if (!formData.experience) newErrors.experience = "Experience required";
      else if (Number(formData.experience) < 0)
        newErrors.experience = "Experience cannot be negative";

      if (!formData.practiceCourt.trim())
        newErrors.practiceCourt = "Practice court required";
    }

    if (step === 2) {
      if (formData.specializations.length === 0)
        newErrors.specializations = "Select at least one specialization";

      formData.specializations.forEach((spec) => {
        if (!formData.fees[spec])
          newErrors[`fee_${spec}`] = "Fee required for " + spec;
        else if (Number(formData.fees[spec]) <= 0)
          newErrors[`fee_${spec}`] = "Fee must be positive";
      });
    }

    if (step === 3) {
      if (formData.education.length === 0)
        newErrors.education = "At least one education required";

      formData.education.forEach((edu, index) => {
        if (!edu.degree.trim())
          newErrors[`degree_${index}`] = "Degree required";

        if (!edu.university.trim())
          newErrors[`university_${index}`] = "University required";

        if (!edu.passingYear)
          newErrors[`passingYear_${index}`] = "Passing out year required";
        else {
          const year = Number(edu.passingYear);
          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear)
            newErrors[`passingYear_${index}`] =
              `Year must be between 1900 and ${currentYear}`;
        }
      });

      if (!formData.address.trim()) newErrors.address = "Address required";

      if (!formData.city.trim()) newErrors.city = "City required";

      if (!formData.state.trim()) newErrors.state = "State required";
    }

    return newErrors;
  };

  const nextStep = () => {
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const validationErrors = validateStep();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (!user?.id && !user?._id) {
        alert("Missing user info. Please log in again.");
        return;
      }

      setIsSubmitting(true);

      const lawyerId = user.id || user._id;
      const payload = new FormData();

      if (formData.profileImage) {
        payload.append("profileImage", formData.profileImage);
      }

      const location = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
      };

      const education = formData.education.map((edu) => ({
        degree: edu.degree,
        university: edu.university,
        year: Number(edu.passingYear),
      }));

      const feesByCategory = formData.specializations.map((spec) => ({
        category: spec,
        fee: Number(formData.fees[spec] || 0),
      }));

      payload.append("location", JSON.stringify(location));
      payload.append("education", JSON.stringify(education));
      payload.append(
        "specializations",
        JSON.stringify(formData.specializations),
      );
      payload.append("feesByCategory", JSON.stringify(feesByCategory));
      payload.append("experience", String(formData.experience || 0));
      payload.append("bio", formData.bio);
      payload.append("practiceCourt", formData.practiceCourt);

      const res = await axios.patch(
        `${API_URL}/lawyers/complete-profile/${lawyerId}`,
        payload,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (res.status === 200) {
        alert("Profile Completed Successfully!");
        navigate("/lawyer/lawyer-dashboard");
      }
    } catch (error) {
      console.log(error, "Error Occurred: Handler Function not working?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[url('./assets/images/bg-white.jpg')] bg-cover bg-center py-5 lg:px-6 px-2 overflow-scroll font-barlow">
      {isSubmitting && (
        <div className="absolute w-full h-screen top-[50%] left-[50%] bg-white/40 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-20">
          <LoadingFallback />
        </div>
      )}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl lg:p-5 pt-3 border border-slate-200">
        <button onClick={() =>navigate(-1)} className="border p-3 hover:transition hover:transform hover:duration-75 hover:after:content-['Home'] border-dashed border-gray-300 rounded-2xl flex items-center gap-2 text-slate-500 hover:text-slate-700">
          <FaArrowLeft />
        </button>
        <h2 className="lg:text-4xl text-lg font-bold text-center mb-2">
          Complete Your Professional Profile
        </h2>
        <p className="text-center text-slate-500 mb-2">Step {step} of 3</p>

        <form onSubmit={handleSubmit} className="lg:space-y-10">
          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <SectionCard icon={<FaUserTie />} title="Basic Information">
              <FileInput
                label="Upload Profile Image"
                onChange={handleImageChange}
                onRemove={removeImage}
                value={formData.profileImage}
                error={errors.profileImage}
              />

              <TextArea
                label="Bio / About"
                placeholder="Write a brief bio about yourself, your legal philosophy, or anything you'd like potential clients to know."
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                error={errors.bio}
              />

              <div className="flex justify-between`">
                <Input
                  label="Years of Experience"
                  placeholder="e.g. 5"
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  error={errors.experience}
                />

                <Input
                  label="Practice Court"
                  placeholder="e.g. Supreme Court, High Court, etc."
                  name="practiceCourt"
                  value={formData.practiceCourt}
                  onChange={handleChange}
                  error={errors.practiceCourt}
                />
              </div>

              <NextBtn onClick={nextStep} disabled={isSubmitting} />
            </SectionCard>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <SectionCard icon={<FaBuilding />} title="Professional Details">
              <div>
                <label className="font-semibold block mb-3">
                  Specializations
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {specializationOptions.map((spec) => (
                    <label key={spec} className="flex gap-2">
                      <input
                        type="checkbox"
                        checked={formData.specializations.includes(spec)}
                        onChange={() => handleSpecializationChange(spec)}
                      />
                      {spec}
                    </label>
                  ))}
                </div>
                {errors.specializations && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.specializations}
                  </p>
                )}
              </div>

              {/* Fees */}
              {formData.specializations.map((spec) => (
                <div key={spec} className="mt-4">
                  <Input
                    label={`${spec} Fee`}
                    type="number"
                    value={formData.fees[spec] || ""}
                    onChange={(e) => handleFeeChange(spec, e.target.value)}
                    error={errors[`fee_${spec}`]}
                  />
                </div>
              ))}

              {/* Step 2 Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-300 py-3 rounded-xl font-semibold text-center disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-center disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Next
                </button>
              </div>
            </SectionCard>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <SectionCard
              icon={<FaGraduationCap />}
              title="Education & Office Details"
            >
              {/* Education */}
              <div>
                <label className="font-semibold block mb-4">Education</label>

                {formData.education.map((edu, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 p-4 rounded-xl mb-4"
                  >
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(index, "degree", e.target.value)
                        }
                        error={errors[`degree_${index}`]}
                      />

                      <Input
                        placeholder="University"
                        value={edu.university}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "university",
                            e.target.value,
                          )
                        }
                        error={errors[`university_${index}`]}
                      />

                      <Input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="Passing Out Year"
                        value={edu.passingYear || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "passingYear",
                            e.target.value,
                          )
                        }
                        error={errors[`passingYear_${index}`]}
                      />
                    </div>

                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-red-500 text-sm mt-3"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEducation}
                  className="text-blue-600 text-sm"
                >
                  + Add Another Education
                </button>
              </div>

              {/* Office */}
              <Input
                label="Office Address"
                placeholder="e.g. 123 Main St, Suite 400"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />
              <div className="flex">
                <Input
                  label="City"
                  placeholder="e.g. Surat"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                />
                <Input
                  label="State"
                  placeholder="e.g. Gujarat"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={errors.state}
                />
              </div>

              <div className="flex gap-4 mt-8">
                <BackBtn onClick={prevStep} disabled={isSubmitting} />
                <button
                  type="submit"
                  className="w-1/2 bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Complete Profile
                </button>
              </div>
            </SectionCard>
          )}
        </form>
      </div>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const SectionCard = ({ icon, title, children }) => (
  <div className="bg-slate-50 lg:p-8 p-3 rounded-2xl shadow-md lg:space-y-6 space-y-3">
    <div className="flex items-center gap-3 text-blue-600 lg:text-xl font-semibold">
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const Input = ({ label, error, placeholder, ...props }) => (
  <div className="w-full mr-3 font-barlow">
    {label && <label className="font-semibold block mb-2">{label}</label>}
    <input
      {...props}
      className="w-full bg-gray-100 p-3 rounded-xl"
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const TextArea = ({ label, error, ...props }) => (
  <div>
    <label className="font-semibold block mb-2">{label}</label>
    <textarea
      {...props}
      rows="4"
      className="w-full bg-gray-100 p-3 rounded-xl"
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const FileInput = ({ label, error, onRemove, value, ...props }) => (
  <div className="bg-[url('./assets/images/pattern-bg.jpg')]  lg:flex items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition overflow-hidden">
    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer bg-gray-50 transition">
      <FaImage className="text-gray-400 text-3xl mb-2" />
      <label className="font-semibold block mb-2 text-center">{label}</label>
      <input
        type="file"
        {...props}
        className="w-50  bg-linear-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-md text-sm cursor-pointer hover:bg-blue-600 transition duration-300"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
    {/* Image Preview Area */}
    <div className=" lg:h-45 relative overflow-hidden flex lg:flex-row flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-2 mt-2 cursor-pointer bg-gray-50 transition">
      {value ? (
        <>
          <img
            src={URL.createObjectURL(value)}
            alt="Preview"
            className="w-full h-full object-cover border border-gray-300 border-dotted rounded-xl"
          />
          <MdCancel 
            className="absolute top-0 right-0 text-2xl text-red-500 cursor-pointer hover:text-red-700 transition-colors "
            onClick={onRemove}
          />
        </>
      ) : (
        <div className="text-gray-400">No image selected for preview</div>
      )}
      {value ? (
        <>
          <img
            src={URL.createObjectURL(value)}
            alt="Preview"
            className="w-40 h-40 rounded-full object-cover border border-gray-300 border-dotted"
          />
          <MdCancel 
            className="absolute top-0 right-0 text-2xl text-red-500 cursor-pointer hover:text-red-700 transition-colors"
            onClick={onRemove}
          />
        </>
      ) : (
        ""
      )}
    </div>
  </div>
);

const NextBtn = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl mt-6 disabled:opacity-60"
    disabled={disabled}
  >
    Next
  </button>
);

const BackBtn = ({ onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-1/2 bg-gray-300 py-3 rounded-xl disabled:opacity-60"
    disabled={disabled}
  >
    Back
  </button>
);

export default CompleteLawyerProfile;
