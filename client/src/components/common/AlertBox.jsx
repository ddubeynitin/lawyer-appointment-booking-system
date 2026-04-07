import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const variantStyles = {
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    accent: "bg-emerald-500",
    iconNode: CheckCircle2,
  },
  error: {
    wrapper: "border-rose-200 bg-rose-50 text-rose-900",
    icon: "text-rose-600",
    accent: "bg-rose-500",
    iconNode: AlertCircle,
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    accent: "bg-amber-500",
    iconNode: TriangleAlert,
  },
  info: {
    wrapper: "border-sky-200 bg-sky-50 text-sky-900",
    icon: "text-sky-600",
    accent: "bg-sky-500",
    iconNode: Info,
  },
};

const AlertBox = ({
  variant = "info",
  title,
  message,
  onClose,
  className = "",
  floating = false,
  autoDismissMs = 2000,
}) => {
  const styles = variantStyles[variant] || variantStyles.info;
  const Icon = styles.iconNode;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    const dismissTimer = autoDismissMs
      ? window.setTimeout(() => {
          setIsVisible(false);
          if (onClose) {
            window.setTimeout(() => onClose(), 250);
          }
        }, autoDismissMs)
      : null;

    return () => {
      cancelAnimationFrame(frame);
      if (dismissTimer) {
        window.clearTimeout(dismissTimer);
      }
    };
  }, [autoDismissMs, onClose]);

  if (!message && !title) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border px-4 py-4 shadow-xl backdrop-blur-sm transition-all duration-300 ease-out ${styles.wrapper} ${
        floating ? "pointer-events-auto absolute left-70 right-0 top-0 z-30 w-[50%]" : "relative"
      } ${isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-3 opacity-0 scale-95"} ${className}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.accent}`} />

      <div className="flex items-start gap-3 pl-2">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 ${styles.icon}`}>
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          {message ? <p className={`text-sm ${title ? "mt-1" : ""}`}>{message}</p> : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              window.setTimeout(() => onClose(), 250);
            }}
            className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AlertBox;
