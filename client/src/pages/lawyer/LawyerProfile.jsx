import React from "react";
import {
  CheckCircle,
  MapPin,
  Globe,
  Award,
  GraduationCap,
  ShieldCheck,
  MessageCircle,
  Share2,
  Calendar,
  Star,
} from "lucide-react";

const LawyerProfile = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen pb-16">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-6 pt-10">

        {/* ===== TOP SECTION ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-8">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition">

              <div className="flex flex-col md:flex-row gap-8">
                
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Lawyer"
                  className="w-40 h-40 rounded-xl object-cover shadow-md"
                />

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800">
                    Sarah J. Mitchell, JD
                  </h1>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-blue-600 font-medium">
                      Senior Partner • 15+ Years Experience
                    </span>
                    <span className="flex items-center text-green-600 text-sm font-medium bg-green-100 px-3 py-1 rounded-full">
                      <CheckCircle size={16} className="mr-1" />
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} /> Los Angeles, CA
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe size={16} /> English, Spanish
                    </div>
                    <div>California Bar No. 123456</div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition">
                      <MessageCircle size={18} /> Message
                    </button>

                    <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition">
                      <Share2 size={18} /> Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Professional Summary
              </h2>
              <p className="text-slate-600 leading-relaxed">
                With over 15 years of dedicated practice in California, Sarah
                J. Mitchell has established herself as a leading expert in
                high-stakes civil litigation and complex family law matters.
                Her approach combines rigorous legal strategy with a
                compassionate understanding of her clients' unique situations.
              </p>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">
                Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {[
                  "Civil Litigation",
                  "Family Law",
                  "Corporate Mediation",
                  "Intellectual Property",
                  "Contract Negotiation",
                ].map((item, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Education & Credentials
              </h2>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <GraduationCap className="text-blue-600" />
                <div>
                  <p className="font-medium">Stanford Law School</p>
                  <p className="text-sm text-slate-500">
                    Juris Doctor (JD), 2008
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <ShieldCheck className="text-green-600" />
                <div>
                  <p className="font-medium">California State Bar</p>
                  <p className="text-sm text-slate-500">
                    Member in Good Standing since 2009
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Award className="text-yellow-600" />
                <div>
                  <p className="font-medium">Super Lawyers® Award</p>
                  <p className="text-sm text-slate-500">
                    Top Rated Civil Litigation Attorney (2020–2023)
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE - BOOKING CARD */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-fit sticky top-8">

            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Book an Appointment
            </h2>

            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <p className="text-blue-600 font-medium flex items-center gap-2">
                <Calendar size={18} /> Next Available Slot
              </p>
              <p className="text-slate-700 mt-2 font-medium">
                Tomorrow at 10:00 AM
              </p>
              <p className="text-sm text-slate-500">
                Pacific Standard Time (PST)
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Consultation Fee</span>
                <span className="font-medium text-slate-800">
                  $150 / 30 min
                </span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="font-medium text-slate-800">
                  Video Call / Office
                </span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition">
              Book Now
            </button>

            <button className="w-full mt-3 border border-slate-300 py-3 rounded-xl font-medium hover:bg-slate-50 transition">
              View Full Calendar
            </button>

            <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl mt-6 flex items-center gap-2">
              <ShieldCheck size={16} />
              Identity Verified
            </div>
          </div>
        </div>

        {/* ===== REVIEWS SECTION ===== */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Client Reviews
            </h2>
            <div className="flex items-center gap-2 text-yellow-500 font-medium">
              <Star size={18} fill="currentColor" />
              4.9 (48 reviews)
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-slate-500 mb-2">
              Reviewed Oct 12, 2023
            </p>
            <p className="text-slate-600 italic">
              "Sarah was incredible during my divorce proceedings. She was
              professional, empathetic, and always one step ahead."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LawyerProfile;
