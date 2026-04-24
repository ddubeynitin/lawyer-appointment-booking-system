import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Video } from "lucide-react";

const ONE_HOUR_MS = 60 * 60 * 1000;

const TIME_SLOT_REGEX = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;

const getAppointmentDateTime = (dateValue, timeSlot) => {
  if (!dateValue || !timeSlot) return null;

  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) return null;

  const match = String(timeSlot).trim().match(TIME_SLOT_REGEX);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  let normalizedHours = hours % 12;
  if (meridiem === "PM") {
    normalizedHours += 12;
  }

  appointmentDate.setHours(normalizedHours, minutes, 0, 0);
  return appointmentDate;
};

const formatCountdown = (durationMs) => {
  const safeDuration = Math.max(0, durationMs);
  const totalSeconds = Math.floor(safeDuration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const MeetingAccessCard = ({ appointment, canJoin, className = "" }) => {
  const [now, setNow] = useState(Date.now());

  const appointmentDateTime = useMemo(
    () => getAppointmentDateTime(appointment?.date, appointment?.timeSlot),
    [appointment?.date, appointment?.timeSlot],
  );

  const isJoinableMeeting =
    appointment?.appointmentMode === "Online" &&
    Boolean(appointment?.meetingLink) &&
    appointment?.status !== "Rejected" &&
    appointment?.status !== "Pending";

  useEffect(() => {
    if (!isJoinableMeeting || !appointmentDateTime) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [appointmentDateTime, isJoinableMeeting]);

  if (!isJoinableMeeting || !appointmentDateTime) {
    return null;
  }

  const timeUntilMeeting = appointmentDateTime.getTime() - now;
  if (timeUntilMeeting > ONE_HOUR_MS) {
    return null;
  }

  const isCountdownVisible = timeUntilMeeting > 0;
  const countdownText = isCountdownVisible ? formatCountdown(timeUntilMeeting) : "";
  
  // Determine if join button should be enabled
  // If canJoin is explicitly provided (for manual control), use that
  // Otherwise, enable if appointment time has passed
  const isJoinEnabled = canJoin !== undefined ? canJoin : timeUntilMeeting <= 0;
  
  const handleJoinMeeting = () => {
    window.open(appointment.meetingLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`rounded-2xl border border-blue-100 bg-blue-50 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Video size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-blue-900">Online meeting</p>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              Jitsi
            </span>
          </div>

          {isCountdownVisible ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-800">
              <Clock3 size={14} />
              <span>Meeting starts in {countdownText}</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-blue-800">
              Countdown complete. Your meeting is ready.
            </p>
          )}

          <div className="mt-3">
            <button
              type="button"
              onClick={handleJoinMeeting}
              disabled={!isJoinEnabled}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <ArrowUpRight size={16} />
              Join Meeting
            </button>
            {!isJoinEnabled && (
              <p className="mt-2 text-xs text-blue-700">
                Join button will be available at appointment time
              </p>
            )}
          </div>

          <p className="mt-3 text-xs text-blue-700/80">
            The meeting room is available for this approved online appointment only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MeetingAccessCard;
