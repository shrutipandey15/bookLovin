import React, { useEffect, useState, createContext, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('booklovin-theme');
    return savedTheme || 'daydream';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('booklovin-theme', theme);
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
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setOffset({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const doodles = {
        star: ( <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ),
        moon: ( <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> ),
        petal: ( <svg viewBox="0 0 100 100" fill="currentColor"><path d="M50,0 C65,20 80,40 85,60 C90,80 75,95 50,100 C25,95 10,80 15,60 C20,40 35,20 50,0 Z" /></svg> ),
        simpleStar: ( <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2"/></svg> )
    };

    const doodleConfig = [
        { type: 'simpleStar', className: 'w-5 h-5 text-blue-200 opacity-80', style: { top: '10%', left: '8%' }, depth: 0.8, duration: '14s' },
        { type: 'petal', className: 'w-6 h-6 text-pink-300 opacity-70', style: { top: '25%', left: '5%' }, depth: 0.5, duration: '10s' },
        { type: 'moon', className: 'w-5 h-5 text-blue-200 opacity-70', style: { top: '40%', left: '10%' }, depth: 0.6, duration: '12s' },
        { type: 'star', className: 'w-6 h-6 text-yellow-300 opacity-90', style: { top: '55%', left: '6%' }, depth: 0.9, duration: '8s' },
        { type: 'simpleStar', className: 'w-4 h-4 text-blue-200 opacity-80', style: { top: '70%', left: '12%' }, depth: 0.4, duration: '15s' },
        { type: 'petal', className: 'w-5 h-5 text-pink-300 opacity-70', style: { top: '85%', left: '8%' }, depth: 0.7, duration: '11s' },
        { type: 'petal', className: 'w-6 h-6 text-pink-300 opacity-70', style: { top: '15%', right: '6%' }, depth: 0.5, duration: '13s' },
        { type: 'simpleStar', className: 'w-5 h-5 text-blue-200 opacity-80', style: { top: '30%', right: '10%' }, depth: 0.8, duration: '9s' },
        { type: 'moon', className: 'w-5 h-5 text-blue-200 opacity-70', style: { top: '45%', right: '5%' }, depth: 0.6, duration: '14s' },
        { type: 'star', className: 'w-6 h-6 text-yellow-300 opacity-90', style: { top: '60%', right: '12%' }, depth: 0.9, duration: '7s' },
        { type: 'petal', className: 'w-5 h-5 text-pink-300 opacity-70', style: { top: '75%', right: '8%' }, depth: 0.4, duration: '11s' },
        { type: 'simpleStar', className: 'w-4 h-4 text-blue-200 opacity-80', style: { top: '90%', right: '11%' }, depth: 0.7, duration: '16s' },
    ];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {doodleConfig.map((doodle, index) => {
                const transform = `translate(${offset.x * doodle.depth * 30}px, ${offset.y * doodle.depth * 30}px)`;
                return (
                    <div
                        key={index}
                        className={`absolute animate-float ${doodle.className}`}
                        style={{
                            ...doodle.style,
                            transform: transform,
                            transition: 'transform 0.2s ease-out',
                            animationDuration: doodle.duration,
                            animationDelay: `${index * 0.5}s`,
                        }}
                    >
                        {doodles[doodle.type]}
                    </div>
                );
            })}
        </div>
    );
};


const StarlightConstellations = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            const numStars = Math.floor(canvas.width / 15);
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.8 + 0.2,
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
            ctx.strokeStyle = 'rgba(229, 231, 235, 0.15)';
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

  const daydreamBg = "bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200";
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
