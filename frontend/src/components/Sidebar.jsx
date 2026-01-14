import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { BookHeart, Feather, MessageSquare, Book, User, LogOut, Info } from "lucide-react";

const CurrentlyReading = () => {
  const book = {
    title: "The Atlas Six",
    author: "by Olivia Blake",
    progress: 67,
    coverUrl: "https://covers.openlibrary.org/b/id/12649399-L.jpg"
  };
  return (
    <div className="bg-card-background/50 p-4 rounded-xl border border-border-color shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-text-primary mb-3">Currently Reading</h3>
      <div className="flex items-center gap-4">
        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md shadow-lg" />
        <div className="flex-1">
          <p className="font-heading font-bold text-text-primary leading-tight">{book.title}</p>
          <p className="font-body text-sm text-text-secondary mb-2">{book.author}</p>
          <div className="w-full bg-secondary/30 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${book.progress}%` }}></div>
          </div>
          <p className='font-body text-xs text-right text-text-secondary mt-1'>{book.progress}%</p>
        </div>
      </div>
    </div>
  );
};

const ConfessionOfTheDay = () => {
    const confession = "Sometimes I judge books by their covers and I'm not sorry about it. A beautiful cover is art, and art deserves appreciation.";
    return (
        <div className="bg-card-background/50 p-4 rounded-xl border border-border-color shadow-sm mt-6">
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">Confession of the Day</h3>
            <p className="font-body text-sm text-text-primary/90 italic">"{confession}"</p>
            <NavLink to="/confessions" className="text-xs font-bold text-primary hover:underline mt-2 inline-block">Share your confession</NavLink>
        </div>
    );
};


const Sidebar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', icon: BookHeart },
    { name: 'Journal', path: '/journal', icon: Feather },
    { name: 'Confessions', path: '/confessions', icon: MessageSquare },
    { name: 'Books', path: '/books/search', icon: Book },
    { name: 'Posts', path: '/posts', icon: Info },
    ...(user && user.name ?
        [{ name: 'User Profile', path: `/profile/${user.name}`, icon: User }]
        : [])
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeLinkClass = "bg-primary text-text-contrast";
  const inactiveLinkClass = "text-text-primary hover:bg-primary/10";

  return (
    <aside className="fixed top-0 left-0 h-full w-80 bg-background/80 p-6 flex flex-col justify-between border-r border-border-color backdrop-blur-lg">
      <div className="flex-grow flex flex-col">
        <NavLink to="/" className="flex items-center space-x-2 text-2xl font-bold font-heading text-primary mb-12">
          <BookHeart className="h-8 w-8" />
          <span>BookLovin'</span>
        </NavLink>

        {/* Render links only when authenticated AND user object exists */}
        {isAuthenticated && user && (
          <nav className="flex-grow">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.path} className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 mb-2 ${ isActive ? activeLinkClass : inactiveLinkClass }`}>
                    <link.icon size={20} />
                    <span className="font-semibold">{link.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-8">
            <CurrentlyReading />
            <ConfessionOfTheDay />
        </div>
      </div>

      {isAuthenticated && user && (
        <div className="mt-auto">
          <button onClick={handleLogout} className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors duration-200 ${inactiveLinkClass}`}>
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
