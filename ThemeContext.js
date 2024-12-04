"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Set initial theme based on `prefers-color-scheme` if available
    const isSystemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(isSystemDark);
    applyTheme(isSystemDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      applyTheme(newMode);
      return newMode;
    });
  };

  function applyTheme(isDark) {
    document.documentElement.style.setProperty(
      "--background",
      isDark ? "#1B1F1D" : "#daf1de"
    );
    document.documentElement.style.setProperty(
      "--foreground",
      isDark ? "#daf1de" : "#0C3B2E"
    );
    document.documentElement.style.setProperty(
      "--card-bg",
      isDark ? "#333333" : "white"
    );
    document.documentElement.style.setProperty(
      "--navbar-bg",
      isDark ? "#222222" : "#0C3B2E"
    );
    document.documentElement.style.setProperty(
      "--text-color",
      isDark ? "#daf1de" : "#0C3B2E"
    );
    document.documentElement.style.setProperty(
      "--feature-bg",
      isDark ? "#333333" : "white"
    );
    document.documentElement.style.setProperty(
      "--feature-text",
      isDark ? "#daf1de" : "black"
    );

    document.documentElement.classList.toggle("dark", isDark); // Adds 'dark' class for Tailwind compatibility
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
