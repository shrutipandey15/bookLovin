import React, { useEffect, useState, createContext, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('daydream');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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

const DaydreamDoodles = () => {
    const doodles = {
        star: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
        ),
        moon: (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        ),
        petal: (
             <svg viewBox="0 0 100 100" fill="currentColor">
                <path d="M50,0 C65,20 80,40 85,60 C90,80 75,95 50,100 C25,95 10,80 15,60 C20,40 35,20 50,0 Z" />
            </svg>
        )
    };

    const doodleConfig = [
        { type: 'petal', className: 'w-6 h-6 text-pink-300 opacity-80', style: { top: '15%', right: '10%' } },
        { type: 'star', className: 'w-8 h-8 text-yellow-300 opacity-90', style: { top: '20%', left: '15%' } },
        { type: 'moon', className: 'w-6 h-6 text-blue-300 opacity-70 -rotate-45', style: { top: '40%', right: '18%' } },
        { type: 'star', className: 'w-5 h-5 text-yellow-300 opacity-80', style: { top: '65%', left: '10%' } },
        { type: 'petal', className: 'w-7 h-7 text-pink-300 opacity-70 rotate-[30deg]', style: { bottom: '10%', right: '12%' } },
        { type: 'moon', className: 'w-8 h-8 text-blue-300 opacity-60 rotate-45', style: { bottom: '15%', left: '18%' } },
    ];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {doodleConfig.map((doodle, index) => (
                <div key={index} className={`absolute animate-pulse ${doodle.className}`} style={{ ...doodle.style, animationDelay: `${index * 0.3}s`, animationDuration: '5s' }}>
                    {doodles[doodle.type]}
                </div>
            ))}
        </div>
    );
};

const StarlightConstellations = () => {
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
            const numStars = Math.floor(canvas.width / 15); // Control star density

            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5, // Varying star sizes
                    alpha: Math.random() * 0.8 + 0.2, // Varying brightness
                });
            }

            stars.forEach(star => {
                const neighbors = stars
                    .map(other => {
                        const distance = Math.hypot(star.x - other.x, star.y - other.y);
                        return { star: other, distance };
                    })
                    .sort((a, b) => a.distance - b.distance);
                
                star.neighbors = neighbors.slice(1, 3); 
            });
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(229, 231, 235, 0.15)'; // Faint line color
            ctx.lineWidth = 0.5;
            stars.forEach(star => {
                star.neighbors.forEach(neighborInfo => {
                    if (neighborInfo.distance < 200) {
                        ctx.beginPath();
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(neighborInfo.star.x, neighborInfo.star.y);
                        ctx.stroke();
                    }
                });
            });

            stars.forEach(star => {
                ctx.save();
                ctx.globalAlpha = star.alpha;
                ctx.fillStyle = '#E5E7EB';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };

        resizeCanvas();
        draw();

        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
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

  const daydreamBg = "bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100";
  const starlightBg = "bg-gradient-to-b from-[#0D111C] to-[#1F2937]";

  return (
    <div className={`min-h-screen font-body text-text-primary relative ${theme === 'daydream' ? daydreamBg : starlightBg}`}>
        
        {theme === 'daydream' ? <DaydreamDoodles /> : <StarlightConstellations />}

        <div className="relative z-10 bg-transparent">
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