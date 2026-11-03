// components/layout/ThemeToggle.jsx

"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "erp-theme";
const THEME_EVENT = "erp-theme-change";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const handleThemeChange = (event) => {
      setTheme(event.detail === "dark" ? "dark" : "light");
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        setTheme(event.newValue === "dark" ? "dark" : "light");
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    // Read the live DOM state so every toggle instance stays in sync,
    // even if its React state has not re-rendered yet.
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    applyTheme(next);
    setTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable; the toggle still works for the session.
    }

    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#0A2E66] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white ${className}`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          size={19}
          className={`absolute transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          }`}
        />
        <Moon
          size={19}
          className={`absolute transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
      </span>
    </button>
  );
};

export default ThemeToggle;
