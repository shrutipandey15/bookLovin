import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { BookHeart, Feather, MessageSquare, Book, User, LogOut } from "lucide-react";

const navLinks = [
  { name: 'Journal', path: '/journal', icon: Feather },
  { name: 'Reflections', path: '/posts', icon: MessageSquare }, // Assuming posts are reflections
  { name: 'Confessions', path: '/confessions', icon: MessageSquare },
  { name: 'Books', path: '/books/search', icon: Book },
  { name: 'Profile', path: '/profile/MockUser', icon: User },
];

const Sidebar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeLinkClass = "bg-primary/20 text-primary";
  const inactiveLinkClass = "hover:bg-secondary/50";

  return (
    <aside className="w-64 bg-card-background/50 p-6 flex flex-col justify-between border-r border-border-color backdrop-blur-md">
      <div>
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-2xl font-bold font-heading text-primary mb-12"
        >
          <BookHeart className="h-8 w-8" />
          <span>Booklovin'</span>
        </NavLink>

        {isAuthenticated && (
          <nav>
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 mb-2 ${
                        isActive ? activeLinkClass : inactiveLinkClass
                      }`
                    }
                  >
                    <link.icon size={20} />
                    <span className="font-semibold">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {isAuthenticated && (
        <div>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors duration-200 ${inactiveLinkClass}`}
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;