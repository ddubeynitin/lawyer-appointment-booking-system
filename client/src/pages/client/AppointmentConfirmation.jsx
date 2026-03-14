import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaBalanceScale } from "react-icons/fa";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download,
} from "lucide-react";

export default function AppointmentConfirmation() {
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [confirmation, setConfirmation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const consultationFee = 250;

  const times = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:30 AM",
    "02:00 PM",
    "03:30 PM",
  ];

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!formData.email.trim())
      newErrors.email = "Email required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.phone.trim())
      newErrors.phone = "Phone required";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";

    if (!formData.description.trim())
      newErrors.description = "Case description required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fix form errors");
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const ref = "APT-" + Math.floor(1000 + Math.random() * 9000);

      setConfirmation({
        lawyer: "Sarah Jenkins, Esq.",
        specialty: "Family Law Specialist",
        photo: "https://randomuser.me/api/portraits/women/44.jpg",
        date: "Oct 24, 2023",
        time: selectedTime,
        location: "123 Legal Ave, NY",
        ref,
      });

      setIsProcessing(false);
      toast.success("Appointment booked successfully!");
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= CONFIRMATION SCREEN ================= */

  if (confirmation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center px-6 py-10">

        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-3xl flex flex-col md:flex-row gap-8">

          {/* SUCCESS ICON */}
          <div className="flex flex-col items-center justify-center shrink-0">

            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>

              <div className="relative bg-green-100 p-5 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <span className="mt-4 text-green-700 font-semibold">
              Booking Confirmed!
            </span>
          </div>

          {/* DETAILS */}
          <div className="flex-1 flex flex-col justify-between">

            <div className="flex items-center gap-4 mb-4">
              <img
                src={confirmation.photo}
                alt=""
                className="w-16 h-16 rounded-full border-2 border-blue-600"
              />

              <div>
                <h2 className="text-xl font-semibold">
                  {confirmation.lawyer}
                </h2>

                <p className="text-blue-600 text-sm font-medium">
                  {confirmation.specialty}
                </p>

                <span className="text-green-600 text-xs">
                  ✔ Verified Attorney
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">

              <DetailRow
                icon={<Calendar size={18} />}
                label="Date"
                value={confirmation.date}
              />

              <DetailRow
                icon={<Clock size={18} />}
                label="Time"
                value={confirmation.time}
              />

              <DetailRow
                icon={<MapPin size={18} />}
                label="Location"
                value={confirmation.location}
              />

              <DetailRow
                icon={<FileText size={18} />}
                label="Ref ID"
                value={confirmation.ref}
              />

            </div>

            <div className="flex gap-4">

              <button className="flex-1 bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-xl font-semibold shadow">
                Add to Calendar
              </button>

              <button
                onClick={() => setConfirmation(null)}
                className="flex-1 border border-gray-300 hover:bg-gray-100 py-2 rounded-xl font-semibold"
              >
                Book Another
              </button>

            </div>

            <div className="text-center mt-3">

              <button className="inline-flex items-center gap-2 text-gray-500 text-xs hover:text-gray-700">
                <Download size={14} />
                Download Receipt
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= BOOKING PAGE ================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 text-gray-800">

      <Toaster position="top-right" />

      {/* HEADER (MATCH DASHBOARD) */}

      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2">
          <FaBalanceScale className="text-blue-700 text-xl" />
          <span className="font-bold text-xl text-gray-800">LexLink</span>
        </div>

      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold">
          Schedule Your Consultation
        </h1>

        <p className="text-gray-500 mt-2">
          Secure your appointment with our legal experts
        </p>

        <div className="grid lg:grid-cols-3 gap-10 mt-12">

          {/* LEFT SECTION */}

          <div className="lg:col-span-2 space-y-10">

            {/* ATTORNEY CARD */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-xl font-semibold mb-6">
                1. Select Attorney
              </h2>

              <div className="flex justify-between">

                <div className="flex gap-4 items-center">

                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    className="w-16 h-16 rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold">
                      Sarah Jenkins
                    </h3>

                    <p className="text-sm text-gray-500">
                      Family Law Specialist
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    CONSULTATION FEE
                  </p>

                  <p className="text-2xl font-bold">
                    ${consultationFee}
                  </p>
                </div>
              </div>
            </div>

            {/* TIME SELECTION */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-xl font-semibold mb-6">
                2. Select Time
              </h2>

              <div className="grid grid-cols-3 gap-4">

                {times.map((time) => (

                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-xl transition ${
                      selectedTime === time
                        ? "bg-blue-600 text-white shadow"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>

                ))}

              </div>
            </div>

            {/* FORM */}

            <div className="bg-white rounded-3xl shadow-lg p-8">

              <h2 className="text-xl font-semibold mb-6">
                3. Case Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                {["firstName", "lastName", "email", "phone"].map((field) => (

                  <div key={field}>

                    <input
                      name={field}
                      placeholder={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    {errors[field] && (
                      <p className="text-red-500 text-sm">
                        {errors[field]}
                      </p>
                    )}

                  </div>

                ))}

              </div>

              <textarea
                name="description"
                rows="4"
                placeholder="Describe your case"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-xl mt-6 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description}
                </p>
              )}

            </div>
          </div>

          {/* SUMMARY CARD */}

          <div className="bg-white rounded-3xl shadow-lg p-8 h-fit">

            <h2 className="text-xl font-semibold mb-6">
              Appointment Summary
            </h2>

            <p className="text-sm text-gray-400">
              Attorney
            </p>

            <p className="font-semibold mb-4">
              Sarah Jenkins
            </p>

            <p className="text-sm text-gray-400">
              Time
            </p>

            <p className="font-semibold mb-6">
              {selectedTime}
            </p>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 transition shadow-md text-white py-3 rounded-xl font-semibold"
            >
              Confirm Booking →
            </button>

          </div>
        </div>
      </div>

      {/* PROCESSING LOADER */}

      {isProcessing && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-10 rounded-3xl shadow-xl">

            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

            <p className="mt-4 text-sm">
              Processing your booking...
            </p>

          </div>

        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {

  return (
    <div className="flex items-center gap-2">

      <div className="text-gray-500">
        {icon}
      </div>

      <span className="font-medium">
        {label}:
      </span>

      <span className="ml-auto font-semibold">
        {value}
      </span>

    </div>
  );
}