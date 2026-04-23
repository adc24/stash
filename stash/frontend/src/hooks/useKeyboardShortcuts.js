import { useEffect } from "react";

/**
 * Wires global keyboard shortcuts.
 * handlers: { newFolder, newLink, del, escape }
 */
export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const typing = ["input", "textarea", "select"].includes(tag) || e.target?.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        handlers.escape?.();
        return;
      }
      if (typing) return;

      if (mod && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handlers.newFolder?.();
      } else if (mod && e.key.toLowerCase() === "l") {
        e.preventDefault();
        handlers.newLink?.();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (e.metaKey || e.ctrlKey || e.shiftKey) {
          handlers.del?.();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlers]);
}
