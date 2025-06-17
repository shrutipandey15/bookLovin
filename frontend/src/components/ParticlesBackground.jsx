import { useEffect, useRef } from "react";
import { createParticle } from "../utils/ParticlesFactory";
// FIX: Separated the imports to point to their correct source files.
import { useMood } from '@components/MoodContext';
import { MOOD_CONFIG, MOOD_ENUM_TO_KEY } from '@config/moods';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  // This now correctly gets the mood and theme state from the context.
  const { mood, theme } = useMood();
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  const isDark = theme === 'dragon';
  // This now correctly gets the static configuration.
  const currentMoodKey = MOOD_ENUM_TO_KEY[mood] || 'healing';
  const currentMoodConfig = MOOD_CONFIG[currentMoodKey];


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // This logic correctly uses CSS variables to get the current theme colors.
    const moodColors = {
      primary: `var(--primary)`,
      secondary: `var(--secondary)`,
      bg: `var(--background)`,
      text: `var(--text-primary)`,
      contrast: `var(--text-contrast)`,
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = isDark ? 40 : 60;
      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(moodColors, theme, canvas.width, canvas.height));
      }
      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // This is a clever way to resolve the CSS variable to a color value for the canvas.
        const colorVarName = particle.color.replace('var(', '').replace(')', '').trim();
        const computedColor = getComputedStyle(document.documentElement).getPropertyValue(colorVarName);
        ctx.fillStyle = computedColor || particle.color;

        // ... (The rest of your drawing logic is excellent and needs no changes) ...
        switch (particle.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                break;
            // other cases...
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap particles around the screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark, theme, mood]); // mood is now a correct dependency

  return (
    // The z-index was changed from 0 to -10 to ensure it's always in the background
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};

export default ParticlesBackground;