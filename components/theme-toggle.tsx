"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * The theme is initialised by a tiny inline script in the document head, so
 * there is no flash of the wrong theme. This button reads the actual class on
 * <html> instead of keeping a second source of truth that could mismatch on
 * hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextIsDark);
    root.style.colorScheme = nextIsDark ? "dark" : "light";
    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextIsDark ? "dark" : "light",
      );
    } catch {
      // Private browsing can block storage; the theme still changes.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        className ?? "icon-btn border-line bg-surface/70 backdrop-blur"
      }
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      <Sun className="hidden size-[18px] dark:block" aria-hidden="true" />
      <Moon className="size-[18px] dark:hidden" aria-hidden="true" />
    </button>
  );
}
