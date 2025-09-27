import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { BookHeart, Feather, MessageSquare, Book, User, LogOut, Sun } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', icon: BookHeart },
  { name: 'Journal', path: '/journal', icon: Feather },
  { name: 'Confessions', path: '/confessions', icon: MessageSquare },
  { name: 'Books', path: '/books/search', icon: Book },
  { name: 'Art Studio', path: '/studio/create/some-book-id', icon: User },
];

const Navbar = () => {
  const { user } = useAuth();

  const activeLinkClass = "bg-primary text-text-contrast";
  const inactiveLinkClass = "text-text-primary hover:bg-primary/10";

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border-color bg-background/80 px-6 backdrop-blur-lg">
      <div className="flex items-center gap-6">
        <NavLink to="/" className="flex items-center space-x-2 text-xl font-bold font-heading text-primary">
          <BookHeart />
          <span className="hidden sm:inline">BookLovin'</span>
        </NavLink>
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <link.icon size={16} />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
         <button className="p-2 rounded-full hover:bg-primary/10">
            <Sun size={20} className="text-text-secondary" />
        </button>
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center font-bold text-primary">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <span className="text-sm font-semibold text-text-primary hidden sm:inline">Welcome back!</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;