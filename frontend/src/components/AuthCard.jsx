import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 space-y-6 bg-card-background/60 border border-border-color rounded-2xl shadow-lg backdrop-blur-lg"
    >
      <h1 className="text-3xl font-bold text-center font-heading text-primary">
        {title}
      </h1>
      <div className="mt-6">
        {children}
      </div>
    </motion.div>
  );
};

export default AuthCard;