import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { BookHeart, LogOut } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeLinkStyle = {
    color: "var(--primary)",
    textDecoration: "underline",
    textUnderlineOffset: "4px",
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary/50 bg-background/80 font-body text-text-primary shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-xl font-bold text-primary"
        >
          <BookHeart className="h-7 w-7" />
          <span>Booklovin'</span>
        </NavLink>

        {isAuthenticated && (
          <nav className="hidden items-center space-x-6 md:flex">
            <NavLink
              to="/journal"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Journal
            </NavLink>
            <NavLink
              to="/posts"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Reflections
            </NavLink>
            <NavLink
              to="/confessions"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            >
              Confessions
            </NavLink>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 rounded-lg border border-secondary px-3 py-2 text-sm text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-contrast transition-opacity hover:opacity-90"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
