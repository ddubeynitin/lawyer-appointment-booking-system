import { useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Video } from "lucide-react";
import { FaBuilding } from "react-icons/fa";

const DEFAULT_COPY = {
  title: "Appointment Booked Successfully",
  description: "Your consultation has been confirmed and saved to your dashboard.",
  noteTitle: (mode) =>
    mode === "Office" ? "Lawyer Office Location" : "Online Appointment Note",
  noteBody: (mode, bookingDetails) =>
    mode === "Office"
      ? bookingDetails?.lawyerLocation || "Office location not available."
      : "The Online Meeting Link Provided to your registered Email before few minutes to Appointment time.",
};

const REQUESTED_COPY = {
  title: "Appointment Requested Successfully",
  description: "Your request has been sent to the lawyer and is waiting for approval.",
  noteTitle: (mode) =>
    mode === "Office" ? "Lawyer Office Location" : "Next Step",
  noteBody: (mode, bookingDetails) =>
    mode === "Office"
      ? bookingDetails?.lawyerLocation || "Office location not available."
      : "Once the lawyer approves the request, please complete the payment from the Appointments page.",
};

const AppointmentBooked = ({ bookingDetails, variant = "booked" }) => {
  const navigate = useNavigate();

  if (!bookingDetails) {
    return null;
  }

  const copy = variant === "requested" ? REQUESTED_COPY : DEFAULT_COPY;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-white to-blue-500 font-barlow">
      <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-4">
        <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={34} strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {copy.title}
          </h1>
          <p className="mt-2 text-slate-500">
            {copy.description}
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-center gap-2 font-bold rounded-2xl text-center p-2 ">
                    {bookingDetails.appointmentMode == "Office" ? (<FaBuilding/>) : (<Video/>)}
                    {bookingDetails.appointmentMode}
              </div>
              <div className="flex justify-between gap-4">
                <span>Lawyer</span>
                <span className="font-medium text-slate-800">
                  {bookingDetails.lawyerName || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Specialization</span>
                <span className="font-medium text-slate-800">
                  {bookingDetails.lawyerSpecialization || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Date</span>
                <span className="font-medium text-slate-800">
                  {bookingDetails.date || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Time Slot</span>
                <span className="font-medium text-slate-800">
                  {bookingDetails.timeSlot || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Category</span>
                <span className="font-medium text-slate-800">
                  {bookingDetails.caseCategory || "N/A"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Fee</span>
                <span className="font-medium text-slate-800">
                  Rs {bookingDetails.feeCharged || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-2 text-slate-800">
              {bookingDetails.appointmentMode === "Office" ? (
                <MapPin size={18} className="text-blue-600" />
              ) : (
                <Video size={18} className="text-blue-600" />
              )}
              <h3 className="font-semibold">
                {copy.noteTitle(bookingDetails.appointmentMode)}
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {copy.noteBody(bookingDetails.appointmentMode, bookingDetails)}
            </p>
          </div>

          <button
            onClick={() => navigate("/client/client-dashboard")}
            className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go To Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default AppointmentBooked;
