import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme before rendering
const applySavedTheme = () => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
  
  // Remove dark class first to ensure clean state
  document.documentElement.classList.remove("dark");
  
  if (savedTheme) {
    if (savedTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    } else {
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    }
  } else {
    // Default to system preference if no theme is saved
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }
  
  // Listen for system theme changes if theme is set to "system" or not set
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
    const currentTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const isDark = e instanceof MediaQueryListEvent ? e.matches : e.matches;
    
    if (!currentTheme || currentTheme === "system") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };
  
  // Use addEventListener if available (modern browsers)
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", handleSystemThemeChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleSystemThemeChange);
  }
};

// Apply theme immediately before React renders
applySavedTheme();

createRoot(document.getElementById("root")!).render(<App />);
