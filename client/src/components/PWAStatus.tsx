
import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";

export function PWAStatus() {
  const [isOffline, setIsOffline] = useState(
    () => !navigator.onLine
  );

  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (isOffline && !isDismissed) {
      // Allow the enter transition to run.
      const frame = requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
  }, [isOffline, isDismissed]);

  if (!isOffline && !isVisible) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed bottom-4 left-1/2 z-50
        w-[calc(100%-2rem)] max-w-md
        -translate-x-1/2
        transition-all duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0
        ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="
        relative flex items-center gap-3
        overflow-hidden rounded-2xl
        border border-white/10
        bg-[#18181b] p-4
        text-white
        shadow-2xl shadow-black/20
      ">
        {/* Accent line */}
        <div className="
          absolute inset-x-0 top-0 h-0.5
          bg-gradient-to-r from-transparent via-red-500 to-transparent
        " />

        {/* Icon */}
        <div className="
          flex size-11 shrink-0 items-center justify-center
          rounded-xl bg-red-500/10 text-red-400
          ring-1 ring-red-500/20
        ">
          <WifiOff size={22} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">
              You're offline
            </h3>

            <span className="
              size-2 rounded-full bg-red-500
              shadow-[0_0_8px_rgba(239,68,68,0.7)]
              animate-pulse
            " />
          </div>

          <p className="
            mt-1 text-xs leading-relaxed
            text-zinc-400
          ">
            Your internet connection is unavailable.
            Some features may not work.
          </p>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="
            flex size-8 shrink-0 items-center justify-center
            rounded-lg text-zinc-400
            transition-colors duration-200
            hover:bg-white/10 hover:text-white
            active:scale-90
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-white/50
          "
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
