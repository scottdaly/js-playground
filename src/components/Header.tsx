import React, { useState, useEffect } from "react";
import { Code, Sun, Moon, PanelLeft, PanelTop } from "lucide-react";

// Define props including optional layout props
interface HeaderProps {
  layoutDirection?: "horizontal" | "vertical";
  onToggleLayout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ layoutDirection, onToggleLayout }) => {
  // Check localStorage first, then system preference, default to dark
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply the theme class on initial load and when isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // The useEffect hook will handle class toggling and saving
  };

  return (
    <header className="bg-gray-100 dark:bg-teal-700/15 px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Code size={24} className="text-teal-600 dark:text-teal-400" />
        <h1 className="text-gray-800 dark:text-white font-semibold text-lg">
          JSPlayground
        </h1>
      </div>

      {/* Button Group for Toggles */}
      <div className="flex items-center space-x-3">
        {/* Layout Toggle Button (only render if props are provided) */}
        {onToggleLayout && layoutDirection && (
          <button
            onClick={onToggleLayout}
            className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            title={
              layoutDirection === "horizontal"
                ? "Switch to vertical layout"
                : "Switch to horizontal layout"
            }
          >
            {/* Show icon for the *next* layout */}
            {layoutDirection === "horizontal" ? (
              <PanelTop size={18} />
            ) : (
              <PanelLeft size={18} />
            )}
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
