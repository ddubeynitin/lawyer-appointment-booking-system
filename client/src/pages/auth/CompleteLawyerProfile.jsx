import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaMapMarkerAlt, FaUniversity } from "react-icons/fa";
import { MdLocationCity, MdDescription } from "react-icons/md";
import { IoCashOutline } from "react-icons/io5";

const CompleteLawyerProfile = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    court: "",
    consultationFee: "",
    education: "",
    languages: [], // ✅ Array for multiple languages
    address: "",
    city: "",
    state: "",
    about: "",
  });

  const [errors, setErrors] = useState({});

  const languageOptions = [
    "English",
    "Hindi",
    "Marathi",
    "Gujarati",
    "Tamil",
    "Telugu",
  ];

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle language checkbox
  const handleLanguageChange = (language) => {
    setFormData((prev) => {
      const updatedLanguages = prev.languages.includes(language)
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language];

      return { ...prev, languages: updatedLanguages };
    });

    if (errors.languages) {
      setErrors((prev) => ({ ...prev, languages: "" }));
    }
  };

  // Step-wise validation
  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      if (!formData.specialization) newErrors.specialization = "Required";
      if (!formData.experience) newErrors.experience = "Required";
      if (!formData.court) newErrors.court = "Required";
      if (!formData.consultationFee) newErrors.consultationFee = "Required";
      if (!formData.education) newErrors.education = "Required";
      if (formData.languages.length === 0)
        newErrors.languages = "Select at least one language";

      if (formData.experience && Number(formData.experience) < 0)
        newErrors.experience = "Must be positive";

      if (formData.consultationFee && Number(formData.consultationFee) <= 0)
        newErrors.consultationFee = "Must be greater than 0";
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = "Required";
      if (!formData.city) newErrors.city = "Required";
      if (!formData.state) newErrors.state = "Required";
      if (!formData.about) newErrors.about = "Required";
    }

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log("Final Data:", formData);
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
            Step {step} of 2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-600 mb-6">
                Professional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <InputField name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} error={errors.specialization} />

                <InputField type="number" name="experience" placeholder="Years of Experience" value={formData.experience} onChange={handleChange} error={errors.experience} />

                <InputField name="court" placeholder="Practicing Court" value={formData.court} onChange={handleChange} error={errors.court} />

                <InputField type="number" name="consultationFee" placeholder="Consultation Fee (₹)" value={formData.consultationFee} onChange={handleChange} error={errors.consultationFee} />

                <InputField name="education" placeholder="Education (e.g. LLB - Delhi University)" value={formData.education} onChange={handleChange} error={errors.education} />

              </div>

              {/* Languages */}
              <div className="mt-6">
                <label className="font-semibold text-gray-700">
                  Languages Spoken
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  {languageOptions.map((lang) => (
                    <label key={lang} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={() => handleLanguageChange(lang)}
                      />
                      {lang}
                    </label>
                  ))}
                </div>

                {errors.languages && (
                  <p className="text-blue-600 text-sm mt-2">
                    {errors.languages}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold"
              >
                Next
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-600 mb-6">
                Office Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <InputField name="address" placeholder="Office Address" value={formData.address} onChange={handleChange} error={errors.address} />

                <InputField name="city" placeholder="City" value={formData.city} onChange={handleChange} error={errors.city} />

                <InputField name="state" placeholder="State" value={formData.state} onChange={handleChange} error={errors.state} />

              </div>

              <div className="mt-6">
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                  placeholder="About yourself..."
                  className="w-full bg-gray-100 rounded-xl px-4 py-4 outline-none resize-none"
                />
                {errors.about && (
                  <p className="text-blue-600 text-sm mt-1">
                    {errors.about}
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/2 bg-gray-300 py-4 rounded-xl font-semibold"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

const InputField = ({ type = "text", name, placeholder, value, onChange, error }) => (
  <div>
    <div className="h-12 flex items-center bg-gray-100 rounded-xl px-4">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none"
      />
    </div>
    {error && <p className="text-blue-600 text-sm mt-1">{error}</p>}
  </div>
);

export default CompleteLawyerProfile;
