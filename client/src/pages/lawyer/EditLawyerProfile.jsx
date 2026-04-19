import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  ImageUp,
  Plus,
  Save,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import { API_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import LawyerHeader from "../../components/common/LawyerHeader";
import LoadingFallback from "../../components/LoadingFallback";

const specializationOptions = ["Criminal", "Civil", "Corporate", "Family", "Property"];

const defaultEducation = () => [{ degree: "", university: "", passingYear: "" }];

const emptyLocation = { address: "", city: "", state: "" };

const normalizeEducation = (education = []) =>
  Array.isArray(education) && education.length > 0
    ? education.map((item) => ({
        degree: item?.degree || "",
        university: item?.university || "",
        passingYear: item?.passingYear || item?.year || "",
      }))
    : defaultEducation();

const normalizeFees = (feesByCategory = []) => {
  const byCategory = {};
  (Array.isArray(feesByCategory) ? feesByCategory : []).forEach((row) => {
    if (row?.category) {
      byCategory[row.category] = String(row.fee ?? "");
    }
  });
  return byCategory;
};

const EditLawyerProfile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const lawyerId = user?.id || user?._id || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    practiceCourt: "",
    specializations: [],
    fees: {},
    education: defaultEducation(),
    location: emptyLocation,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (user.role !== "lawyer") {
      navigate("/client/client-dashboard");
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!lawyerId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_URL}/lawyers/${lawyerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const profile = response.data || {};
        setFormData({
          bio: profile.bio || "",
          experience: profile.experience ?? "",
          practiceCourt: profile.practiceCourt || "",
          specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
          fees: normalizeFees(profile.feesByCategory),
          education: normalizeEducation(profile.education),
          location: {
            address: profile.location?.address || "",
            city: profile.location?.city || "",
            state: profile.location?.state || "",
          },
        });
        setProfileImagePreview(profile.profileImage?.url || "");
      } catch (fetchError) {
        console.error("Failed to load profile for editing:", fetchError);
        setError("Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [lawyerId, token]);

  const selectedSpecializations = useMemo(
    () => formData.specializations || [],
    [formData.specializations],
  );

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      location: { ...current.location, [field]: value },
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      education: current.education.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addEducationRow = () => {
    setFormData((current) => ({
      ...current,
      education: [...current.education, { degree: "", university: "", passingYear: "" }],
    }));
  };

  const removeEducationRow = (index) => {
    setFormData((current) => ({
      ...current,
      education:
        current.education.length > 1
          ? current.education.filter((_, rowIndex) => rowIndex !== index)
          : defaultEducation(),
    }));
  };

  const toggleSpecialization = (specialization) => {
    setFormData((current) => {
      const updatedSpecializations = current.specializations.includes(specialization)
        ? current.specializations.filter((item) => item !== specialization)
        : [...current.specializations, specialization];

      const nextFees = { ...current.fees };
      if (!updatedSpecializations.includes(specialization)) {
        delete nextFees[specialization];
      }

      return {
        ...current,
        specializations: updatedSpecializations,
        fees: nextFees,
      };
    });
  };

  const handleFeeChange = (specialization, value) => {
    setFormData((current) => ({
      ...current,
      fees: { ...current.fees, [specialization]: value },
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.bio.trim()) nextErrors.bio = "Bio is required";
    if (!formData.practiceCourt.trim()) nextErrors.practiceCourt = "Practice court is required";
    if (!String(formData.experience).trim()) {
      nextErrors.experience = "Experience is required";
    } else if (Number(formData.experience) < 0) {
      nextErrors.experience = "Experience cannot be negative";
    }

    if (selectedSpecializations.length === 0) {
      nextErrors.specializations = "Select at least one specialization";
    }

    selectedSpecializations.forEach((spec) => {
      const fee = Number(formData.fees[spec]);
      if (!formData.fees[spec]) {
        nextErrors[`fee_${spec}`] = `Fee required for ${spec}`;
      } else if (!Number.isFinite(fee) || fee <= 0) {
        nextErrors[`fee_${spec}`] = "Fee must be positive";
      }
    });

    if (!formData.location.address.trim()) nextErrors.address = "Address is required";
    if (!formData.location.city.trim()) nextErrors.city = "City is required";
    if (!formData.location.state.trim()) nextErrors.state = "State is required";

    formData.education.forEach((item, index) => {
      if (!item.degree.trim()) nextErrors[`degree_${index}`] = "Degree is required";
      if (!item.university.trim()) nextErrors[`university_${index}`] = "University is required";
      if (!item.passingYear) {
        nextErrors[`passingYear_${index}`] = "Passing year is required";
      } else {
        const year = Number(item.passingYear);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          nextErrors[`passingYear_${index}`] = `Year must be between 1900 and ${currentYear}`;
        }
      }
    });

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    if (!lawyerId) {
      toast.error("Missing lawyer profile");
      return;
    }

    setSaving(true);
    try {
      const sharedPayload = {
        location: {
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
        },
        education: formData.education.map((item) => ({
          degree: item.degree,
          university: item.university,
          year: Number(item.passingYear),
        })),
        specializations: formData.specializations,
        feesByCategory: formData.specializations.map((spec) => ({
          category: spec,
          fee: Number(formData.fees[spec]),
        })),
        experience: Number(formData.experience || 0),
        bio: formData.bio,
        practiceCourt: formData.practiceCourt,
      };

      const response = profileImageFile
        ? await (() => {
            const payload = new FormData();
            payload.append("profileImage", profileImageFile);
            payload.append("location", JSON.stringify(sharedPayload.location));
            payload.append("education", JSON.stringify(sharedPayload.education));
            payload.append("specializations", JSON.stringify(sharedPayload.specializations));
            payload.append("feesByCategory", JSON.stringify(sharedPayload.feesByCategory));
            payload.append("experience", String(sharedPayload.experience));
            payload.append("bio", sharedPayload.bio);
            payload.append("practiceCourt", sharedPayload.practiceCourt);

            return axios.patch(`${API_URL}/lawyers/complete-profile/${lawyerId}`, payload, {
              headers: token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : undefined,
            });
          })()
        : await axios.patch(`${API_URL}/lawyers/update-lawyer/${lawyerId}`, sharedPayload, {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          });

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        navigate(`/lawyer/lawyer-profile/${lawyerId}`);
      }
    } catch (saveError) {
      console.error("Failed to update profile:", saveError);
      toast.error(saveError?.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LawyerHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-slate-800">{error}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => navigate("/lawyer/lawyer-dashboard")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <LawyerHeader />
      <Toaster position="top-right" />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
                  <BadgeCheck size={14} />
                  Lawyer profile
                </div>
                <h1 className="text-3xl font-bold sm:text-4xl">Edit your profile</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Update your biography, education, specializations, fees, and office details.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="submit"
                  form="edit-lawyer-profile-form"
                  disabled={saving}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>

          <form id="edit-lawyer-profile-form" onSubmit={handleSubmit} className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <UserRoundPen size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Basic details
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Profile summary</h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Years of experience</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(event) => handleFieldChange("experience", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">Practice court</span>
                    <input
                      type="text"
                      value={formData.practiceCourt}
                      onChange={(event) => handleFieldChange("practiceCourt", event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Bio</span>
                  <textarea
                    rows="5"
                    value={formData.bio}
                    onChange={(event) => handleFieldChange("bio", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    placeholder="Write a short professional bio"
                  />
                </label>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Specializations
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Areas of practice</h2>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {specializationOptions.map((specialization) => {
                    const isSelected = selectedSpecializations.includes(specialization);
                    return (
                      <button
                        key={specialization}
                        type="button"
                        onClick={() => toggleSpecialization(specialization)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        {specialization}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  {formData.specializations.length === 0 ? (
                    <p className="text-sm text-slate-500">Select at least one specialization to show fee fields.</p>
                  ) : (
                    <div className="space-y-4">
                      {formData.specializations.map((specialization) => (
                        <div key={specialization} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <label className="block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                              {specialization} fee
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={formData.fees[specialization] || ""}
                              onChange={(event) => handleFeeChange(specialization, event.target.value)}
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                              placeholder="Enter fee"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-50 p-3 text-green-600">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Education
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Academic credentials</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {formData.education.map((item, index) => (
                    <div key={`${item.degree || "education"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          type="text"
                          value={item.degree}
                          onChange={(event) => handleEducationChange(index, "degree", event.target.value)}
                          placeholder="Degree"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={item.university}
                          onChange={(event) => handleEducationChange(index, "university", event.target.value)}
                          placeholder="University"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={item.passingYear}
                          onChange={(event) => handleEducationChange(index, "passingYear", event.target.value)}
                          placeholder="Passing year"
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeEducationRow(index)}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEducationRow}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Plus size={16} />
                  Add education row
                </button>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Office details
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Location</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(event) => handleLocationChange("address", event.target.value)}
                    placeholder="Office address"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={formData.location.city}
                      onChange={(event) => handleLocationChange("city", event.target.value)}
                      placeholder="City"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.location.state}
                      onChange={(event) => handleLocationChange("state", event.target.value)}
                      placeholder="State"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                    <ImageUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Profile image
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">Update photo</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setProfileImageFile(file);
                      setProfileImagePreview(file ? URL.createObjectURL(file) : profileImagePreview);
                    }}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  <div className="w-72 h-72 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Current profile"
                        className=" w-full object-fit"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                        No profile image uploaded yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-green-100 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 text-green-600" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Update saved profile</p>
                    <p className="mt-1 text-sm leading-6 text-green-800">
                      Your changes will be reflected on your public lawyer profile and dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditLawyerProfile;
