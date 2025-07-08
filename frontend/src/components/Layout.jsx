import React, { useEffect, useState, createContext, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'daydream');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'daydream' ? 'starlight' : 'daydream');
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);

const DaydreamBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background-end"></div>
        <div className="absolute text-yellow-300 text-5xl opacity-50 animate-float" style={{ top: '5%', left: '10%', animationDelay: '0s', animationDuration: '10s' }}>&#10022;</div>
        <div className="absolute text-pink-300 text-3xl opacity-40 animate-float" style={{ top: '25%', right: '10%', animationDelay: '2s', animationDuration: '12s' }}>&#10047;</div>
        <div className="absolute text-blue-300 text-4xl opacity-60 animate-float" style={{ bottom: '10%', left: '15%', animationDelay: '4s', animationDuration: '8s' }}>&#10022;</div>
        <div className="absolute text-yellow-400 text-2xl opacity-50 animate-float" style={{ bottom: '33%', right: '25%', animationDelay: '1s', animationDuration: '15s' }}>&#10038;</div>
    </div>
);

const StarlightCanvasBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let stars = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            const numStars = Math.floor((canvas.width * canvas.height) / 4000);
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.2 + 0.3,
                    alpha: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: Math.random() * 0.015
                });
            }
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0D111C');
            gradient.addColorStop(1, '#1F2937');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                ctx.save();
                ctx.globalAlpha = star.alpha * (0.5 + Math.abs(Math.sin(Date.now() * star.twinkleSpeed * 0.001)));
                ctx.fillStyle = '#E5E7EB';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        draw();

        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};
const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === "starlight";

  const noNavPages = ["/login", "/register"];
  const showNav = !noNavPages.includes(location.pathname);

  return (
    <div className="min-h-screen font-body text-text-primary relative">
        {theme === 'daydream' ? <DaydreamBackground /> : <StarlightCanvasBackground />}

        <div className="relative z-10">
            {showNav && <Navbar />}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 bg-card-background border border-border-color text-primary backdrop-blur-sm"
                aria-label={`Switch to ${isDark ? "Daydream" : "Starlight"} theme`}
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <main>{children}</main>
        </div>
    </div>
  );
};

export default Layout;