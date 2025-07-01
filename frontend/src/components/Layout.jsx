import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import DarkLightIcon from "./DarkLightIcon";
import { useMood } from "@components/MoodContext";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const { theme, setTheme } = useMood();
  const location = useLocation();
  const isDark = theme === "dragon";

  const noNavPages = ["/login", "/register"];
  const showNav = !noNavPages.includes(location.pathname);

  const toggleTheme = () => {
    const newTheme = isDark ? "coffee" : "dragon";
    setTheme(newTheme);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background text-text-primary font-body transition-colors duration-500">
      {showNav && <Navbar />}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 rounded-full bg-primary p-2 text-text-contrast shadow-lg transition-all duration-300 hover:scale-110"
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        <DarkLightIcon isDark={isDark} size={24} />
      </button>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
