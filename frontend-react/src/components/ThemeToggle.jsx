import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme.js";

export default function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
