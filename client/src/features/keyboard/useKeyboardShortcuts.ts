import { useEffect, useRef } from "react";

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onCreateTodo?: () => void;
  onFocusSearch?: () => void;
  onShowHelp?: () => void;
  onGoToBoard?: () => void;
}

const SEQUENCE_TIMEOUT = 800; // ms

/**
 * Returns true if the event target is an input-like element where shortcuts should be disabled
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Hook to register global keyboard shortcuts
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {},
) {
  const {
    enabled = true,
    onCreateTodo,
    onFocusSearch,
    onShowHelp,
    onGoToBoard,
  } = options;

  const pendingKeyRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts with modifier keys (except for the specific combos we handle elsewhere)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      // Don't trigger shortcuts while typing in inputs
      if (isInputElement(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle two-key sequences (g → b)
      if (pendingKeyRef.current === "g") {
        if (key === "b") {
          event.preventDefault();
          pendingKeyRef.current = null;
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          onGoToBoard?.();
        } else {
          // Invalid sequence, reset
          pendingKeyRef.current = null;
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
        return;
      }

      // Start a sequence with 'g'
      if (key === "g") {
        event.preventDefault();
        pendingKeyRef.current = "g";
        timeoutRef.current = window.setTimeout(() => {
          pendingKeyRef.current = null;
          timeoutRef.current = null;
        }, SEQUENCE_TIMEOUT);
        return;
      }

      // Single-key shortcuts
      switch (key) {
        case "c":
          event.preventDefault();
          onCreateTodo?.();
          break;
        case "/":
          event.preventDefault();
          onFocusSearch?.();
          break;
        case "?":
          event.preventDefault();
          onShowHelp?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, onCreateTodo, onFocusSearch, onShowHelp, onGoToBoard]);
}
