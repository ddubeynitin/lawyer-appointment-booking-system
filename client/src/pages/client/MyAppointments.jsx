import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download,
} from "lucide-react";

export default function MyAppointment() {
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [showModal, setShowModal] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!formData.description.trim())
      newErrors.description = "Case description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const ref = "REF-" + Math.floor(1000 + Math.random() * 9000);
      setBookingRef(ref);
      setShowModal(true);
      toast.success("Appointment booked successfully!");
    } else {
      toast.error("Please fix form errors");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">
          Schedule Your Consultation
        </h1>
        <p className="text-gray-500 mt-2">
          Secure your appointment with our legal experts in just a few steps.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <div className="flex-1 h-2 bg-blue-600 rounded-full"></div>
          <div className="flex-1 h-2 bg-blue-400 rounded-full"></div>
          <div className="flex-1 h-2 bg-gray-300 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">

            {/* Attorney Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 transition hover:shadow-2xl">
              <h2 className="text-xl font-semibold mb-4">
                1. Select Attorney
              </h2>

              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt=""
                    className="w-16 h-16 rounded-full border-2 border-blue-500"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">
                      Sarah Jenkins
                    </h3>
                    <p className="text-sm text-gray-500">
                      Family Law Specialist • 12 Years Experience
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    CONSULTATION FEE
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    $250
                  </p>
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                2. Select Time
              </h2>

              <div className="grid grid-cols-3 gap-4">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : "bg-gray-100 hover:bg-blue-100"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Case Details */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                3. Case Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {["firstName", "lastName", "email", "phone"].map(
                  (field, i) => (
                    <div key={i}>
                      <input
                        type="text"
                        name={field}
                        placeholder={field.replace(/([A-Z])/g, " $1")}
                        value={formData[field]}
                        onChange={handleChange}
                        className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 transition ${
                          errors[field]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="mt-4">
                <textarea
                  name="description"
                  placeholder="Please briefly describe your legal situation..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold mb-6">
              Appointment Summary
            </h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-400">Attorney</p>
                <p className="font-semibold">Sarah Jenkins</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="font-semibold">{selectedTime}</p>
              </div>

              <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                <span>Consultation Fee</span>
                <span>${consultationFee}.00</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                Confirm Booking →
              </button>

              <p className="text-xs text-gray-400 text-center">
                🔒 Secure SSL Booking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION POPUP */}
{/* SUCCESS MODAL */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl flex flex-col md:flex-row gap-6">

      {/* Left Icon */}
      <div className="flex flex-col items-center justify-center flex-shrink-0">
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

      {/* Right Side */}
      <div className="flex-1">

        {/* Attorney Photo */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Attorney"
            className="w-16 h-16 rounded-full border-2 border-blue-500 shadow"
          />
          <div>
            <h2 className="text-xl font-semibold">
              Sarah Jenkins, Esq.
            </h2>
            <p className="text-blue-600 text-sm">
              Family Law Specialist
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <DetailRow icon={<Calendar size={18} />} label="Date" value="Oct 24, 2023" />
          <DetailRow icon={<Clock size={18} />} label="Time" value={selectedTime} />
          <DetailRow icon={<MapPin size={18} />} label="Location" value="123 Legal Ave, NY" />
          <DetailRow icon={<FileText size={18} />} label="Ref ID" value={bookingRef} />
        </div>

        <button
          onClick={() => setShowModal(false)}
          className="w-full bg-blue-600 text-white py-2 rounded-xl"
        >
          Close
        </button>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-500">{icon}</div>
      <span className="font-medium">{label}:</span>
      <span className="ml-auto font-semibold">{value}</span>
    </div>
  );
}