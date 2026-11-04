import { useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { SHORTCUT_CATEGORIES } from "./shortcutDefinitions";

interface ShortcutHelpDialogProps {
  onClose: () => void;
}

export function ShortcutHelpDialog({ onClose }: ShortcutHelpDialogProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Keyboard className="h-5 w-5" />
            </span>
            <h2
              id="shortcuts-title"
              className="text-xl font-extrabold text-foreground"
            >
              Keyboard shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-8">
            {SHORTCUT_CATEGORIES.map((category) => (
              <section key={category.title}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground-subtle">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {shortcut.label}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {shortcut.description}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-1">
                        {shortcut.sequence ? (
                          shortcut.sequence.map((key, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-border bg-surface px-2 text-xs font-bold uppercase text-foreground shadow-sm">
                                {key}
                              </kbd>
                              {index < shortcut.sequence!.length - 1 && (
                                <span className="text-xs text-muted-foreground">
                                  →
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border border-border bg-surface px-2 text-xs font-bold uppercase text-foreground shadow-sm">
                            {shortcut.key}
                          </kbd>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-6 rounded-xl bg-primary-subtle/50 p-4 text-xs leading-relaxed text-foreground-muted">
            <strong className="font-bold text-foreground">Note:</strong>{" "}
            Shortcuts won't trigger while you're typing in an input field or
            text area.
          </p>
        </div>
      </div>
    </div>
  );
}
