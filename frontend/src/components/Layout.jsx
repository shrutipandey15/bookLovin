import React, { useState, createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { CheckCircle } from 'lucide-react';
import Navbar from "./Navbar";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <Notification message={notification} />}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const Notification = ({ message }) => (
  <div className="fixed bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
    <div className="flex items-center gap-3 rounded-full bg-background border border-secondary px-6 py-3 shadow-lg animate-fade-in-up pointer-events-auto">
      <CheckCircle className="h-6 w-6 text-green-500" />
      <p className="font-medium text-text-primary">{message}</p>
    </div>
  </div>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const noNavPages = ["/login", "/register"];
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const showNav = !noNavPages.includes(location.pathname) && isAuthenticated;
  const isHomePage = location.pathname === "/";
  const cozyBeigeBg = "bg-background";

  return (
    <NotificationProvider>
      <div className={`min-h-screen font-body text-text-primary relative ${cozyBeigeBg}`}>
        <div className="relative z-10">
          {showNav && (isHomePage ? <Sidebar /> : <Navbar />)}
          <main className={showNav && isHomePage ? "ml-80" : ""}>
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default Layout;