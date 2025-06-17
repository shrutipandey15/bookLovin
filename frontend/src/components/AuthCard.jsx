// src/components/auth/AuthCard.jsx

import React from 'react';

// This simple component will wrap our login and registration forms,
// ensuring they always have the same beautiful, themed container.
const AuthCard = ({ title, children }) => {
  return (
    <div className="w-full max-w-md">
      <div
        // Using our new Tailwind classes for a clean, consistent look
        className="p-8 rounded-2xl shadow-md transition-colors duration-300 bg-background border border-secondary"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-primary font-body">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;