import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaBuilding,
  FaGraduationCap,
} from "react-icons/fa";

const specializationOptions = [
  "Criminal",
  "Civil",
  "Corporate",
  "Family",
  "Property",
];

const CompleteLawyerProfile = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    profileImage: null,
    bio: "",
    experience: "",
    practiceCourt: "",
    specializations: [],
    fees: {},
    education: [
      { degree: "", university: "", passingYear: "" },
    ],
    address: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState({});

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
    const updated = formData.education.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, education: updated });
  };

  // ================= VALIDATION =================
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.profileImage)
        newErrors.profileImage = "Profile image required";

      if (!formData.bio.trim())
        newErrors.bio = "Bio required";
      else if (formData.bio.length < 20)
        newErrors.bio =
          "Bio must be at least 20 characters";

      if (!formData.experience)
        newErrors.experience = "Experience required";
      else if (Number(formData.experience) < 0)
        newErrors.experience =
          "Experience cannot be negative";

      if (!formData.practiceCourt.trim())
        newErrors.practiceCourt =
          "Practice court required";
    }

    if (step === 2) {
      if (formData.specializations.length === 0)
        newErrors.specializations =
          "Select at least one specialization";

      formData.specializations.forEach((spec) => {
        if (!formData.fees[spec])
          newErrors[`fee_${spec}`] =
            "Fee required for " + spec;
        else if (Number(formData.fees[spec]) <= 0)
          newErrors[`fee_${spec}`] =
            "Fee must be positive";
      });
    }

    if (step === 3) {
      if (formData.education.length === 0)
        newErrors.education =
          "At least one education required";

      formData.education.forEach((edu, index) => {
        if (!edu.degree.trim())
          newErrors[`degree_${index}`] =
            "Degree required";

        if (!edu.university.trim())
          newErrors[`university_${index}`] =
            "University required";

        if (!edu.passingYear)
          newErrors[`passingYear_${index}`] = "Passing out year required";
        else {
          const year = Number(edu.passingYear);
          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear)
            newErrors[`passingYear_${index}`] = `Year must be between 1900 and ${currentYear}`;
        }
      });

      if (!formData.address.trim())
        newErrors.address = "Address required";

      if (!formData.city.trim())
        newErrors.city = "City required";

      if (!formData.state.trim())
        newErrors.state = "State required";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log(formData);
    alert("Profile Completed Successfully!");
    navigate("/lawyer/lawyer-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-20 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-12 border border-slate-200">

        <h2 className="text-4xl font-bold text-center mb-4">
          Complete Your Professional Profile
        </h2>
        <p className="text-center text-slate-500 mb-10">
          Step {step} of 3
        </p>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <SectionCard icon={<FaUserTie />} title="Basic Information">

              <FileInput
                label="Profile Image"
                onChange={handleImageChange}
                error={errors.profileImage}
              />

              <TextArea
                label="Bio / About"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                error={errors.bio}
              />

              <Input
                label="Years of Experience"
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                error={errors.experience}
              />

              <Input
                label="Practice Court"
                name="practiceCourt"
                value={formData.practiceCourt}
                onChange={handleChange}
                error={errors.practiceCourt}
              />

              <NextBtn onClick={nextStep} />
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
                        onChange={() =>
                          handleSpecializationChange(spec)
                        }
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
                    onChange={(e) =>
                      handleFeeChange(spec, e.target.value)
                    }
                    error={errors[`fee_${spec}`]}
                  />
                </div>
              ))}

              {/* Step 2 Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-300 py-3 rounded-xl font-semibold text-center"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-center"
                >
                  Next
                </button>
              </div>
            </SectionCard>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <SectionCard icon={<FaGraduationCap />} title="Education & Office Details">

              {/* Education */}
              <div>
                <label className="font-semibold block mb-4">
                  Education
                </label>

                {formData.education.map((edu, index) => (
                  <div key={index} className="border p-4 rounded-xl mb-4">

                    <div className="grid md:grid-cols-3 gap-4">

                      <Input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "degree",
                            e.target.value
                          )
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
                            e.target.value
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
                            e.target.value
                          )
                        }
                        error={errors[`passingYear_${index}`]}
                      />
                    </div>

                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeEducation(index)
                        }
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
              />
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
              />
              <Input
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
              />

              <div className="flex gap-4 mt-8">
                <BackBtn onClick={prevStep} />
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl"
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
  <div className="bg-slate-50 p-8 rounded-2xl shadow-md space-y-6">
    <div className="flex items-center gap-3 text-blue-600 text-xl font-semibold">
      {icon}
      {title}
    </div>
    {children}
  </div>
);

const Input = ({ label, error, ...props }) => (
  <div>
    {label && (
      <label className="font-semibold block mb-2">
        {label}
      </label>
    )}
    <input
      {...props}
      className="w-full bg-gray-100 p-3 rounded-xl"
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const TextArea = ({ label, error, ...props }) => (
  <div>
    <label className="font-semibold block mb-2">
      {label}
    </label>
    <textarea
      {...props}
      rows="4"
      className="w-full bg-gray-100 p-3 rounded-xl"
    />
    {error && (
      <p className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const FileInput = ({ label, error, ...props }) => (
  <div>
    <label className="font-semibold block mb-2">
      {label}
    </label>
    <input type="file" {...props} />
    {error && (
      <p className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

const NextBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl mt-6"
  >
    Next
  </button>
);

const BackBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-1/2 bg-gray-300 py-3 rounded-xl"
  >
    Back
  </button>
);

export default CompleteLawyerProfile;