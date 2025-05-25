import { useNavigate } from "react-router-dom";
import {  useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBackground from "@components/ParticlesBackground";

function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBackContent, setShowBackContent] = useState(false);
  const [_isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowBackContent(true);
      setTimeout(() => {
        navigate(isLoggedIn ? "/posts" : "/login");
      }, 1000);
    }, 500); // Halfway through flip
  };

   return (
    <div className="h-screen w-screen overflow-hidden relative bg-coffee-bg dark:bg-dragon-bg">
      <ParticlesBackground />

      <div className="absolute inset-0 flex items-center justify-center perspective-1000" style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {!showBackContent ? (
            <motion.div
              key="front"
              className="absolute inset-0 bg-coffee-card dark:bg-dragon-card shadow-2xl border-r-8 border-coffee-accent dark:border-dragon-gold overflow-hidden"
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: isFlipping ? 180 : 0,
              }}
              style={{
                transformOrigin: 'right center',
                transformStyle: 'preserve-3d',
                pointerEvents: 'auto',
                backfaceVisibility: 'hidden'
              }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              exit={{ opacity: 0 }}
            >
              {/* Front Cover Content */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] dark:bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 dark:opacity-50" />

              <div className="h-full w-full flex flex-col items-center justify-center text-center p-8 relative z-10">
                <h1 className="text-7xl md:text-8xl font-bold text-coffee-text dark:text-dragon-gold mb-6 font-serif dark:font-cinzel">
                  BookLovin'
                </h1>
                <h2 className="text-2xl md:text-3xl italic text-coffee-text dark:text-dragon-subtext mb-10">
                  A ONCE AND FUTURE GENRE
                </h2>
                <div className="w-1/3 h-1 bg-coffee-accent/80 dark:bg-dragon-gold/80 my-6" />

                <motion.button
                  onClick={handleFlip}
                  className="px-12 py-4 text-xl md:text-2xl rounded-md bg-coffee-accent/90 hover:bg-coffee-hover dark:bg-dragon-blue/90 dark:hover:bg-dragon-blueHover text-white font-serif shadow-lg cursor-pointer relative z-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ pointerEvents: 'auto' }}
                >
                  {isLoggedIn ? "ENTER YOUR LIBRARY" : "BEGIN YOUR JOURNEY"}
                </motion.button>
              </div>

              <div className="absolute left-0 top-0 h-full w-12 bg-coffee-button/90 dark:bg-dragon-bg/90 border-r-2 border-coffee-hover dark:border-dragon-gold">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap text-coffee-text dark:text-dragon-gold font-bold tracking-wider text-lg">
                  BOOKLOVIN'
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="absolute inset-0 bg-coffee-bg dark:bg-dragon-card shadow-2xl border-l-8 border-coffee-accent dark:border-dragon-gold overflow-hidden"
              initial={{ rotateY: -180 }}
              animate={{ rotateY: showBackContent ? 0 : -180 }}
              style={{
                transformOrigin: 'right center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden'
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.4
              }}
            >
              {/* Back Cover Content (Loading state) */}
              <div className="h-full w-full flex flex-col items-center justify-center">
                <motion.div
                  className="w-16 h-16 border-4 border-coffee-accent dark:border-dragon-gold border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                  }}
                />
                <motion.p
                  className="mt-6 text-xl text-coffee-text dark:text-dragon-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {isLoggedIn ? "Opening your library..." : "Preparing your adventure..."}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pages Edge - Enhanced for book effect */}
        <div className="absolute right-0 top-0 h-full w-2 bg-gradient-to-l from-coffee-text/20 via-coffee-text/10 to-transparent dark:from-dragon-gold/20 dark:via-dragon-gold/10 dark:to-transparent" />
        <div className="absolute left-12 top-0 h-full w-3 bg-gradient-to-r from-coffee-text/10 via-coffee-text/20 to-coffee-text/30 dark:from-dragon-gold/10 dark:via-dragon-gold/20 dark:to-dragon-gold/30" />

        {/* Book spine shadow */}
        <motion.div
          className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black/30 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlipping ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

export default LandingPage;
