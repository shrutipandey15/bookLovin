import { useEffect, useRef } from "react";
import { createParticle } from "../utils/ParticlesFactory";
import { useMood, MOOD_CONFIG, MOOD_ENUM_TO_KEY } from '@components/MoodContext';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const { mood, theme } = useMood();
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  const isDark = theme === 'dragon';
  const currentMoodKey = MOOD_ENUM_TO_KEY[mood] || 'healing';
  const currentMoodConfig = MOOD_CONFIG[currentMoodKey];


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const moodColors = {
      primary: `var(--mood-primary)`,
      secondary: `var(--mood-secondary)`,
      bg: `var(--mood-bg)`,
      text: `var(--mood-text)`,
      contrast: `var(--mood-contrast)`,
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = isDark ? 40 : 60;

      const particles = [];
      for (let i = 0; i < count; i++) {
        // moodColors is now accessible here
        particles.push(createParticle(moodColors, theme, canvas.width, canvas.height));
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        const computedColor = getComputedStyle(document.documentElement).getPropertyValue(particle.color.replace('var(', '').replace(')', '').trim());
        ctx.fillStyle = computedColor || particle.color;

        switch (particle.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'feather':
          case 'quill':
            ctx.beginPath();
            ctx.ellipse(
              particle.x,
              particle.y,
              particle.size,
              particle.size * 0.4,
              Math.PI / 4,
              0,
              2 * Math.PI
            );
            ctx.fill();
            break;
          case 'wing':
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle.x + particle.size * 2, particle.y - particle.size * 2);
            ctx.lineTo(particle.x + particle.size / 2, particle.y + particle.size * 2);
            ctx.closePath();
            ctx.fill();
            break;
          case 'glyph':
            ctx.font = `${particle.size * 8}px serif`;
            ctx.fillText('*', particle.x, particle.y);
            break;
          case 'flower': {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.x * 0.01);

            const petalCount = 5;
            const petalRadius = particle.size;
            const innerRadius = particle.size / 2;

            for (let i = 0; i < petalCount; i++) {
              const angle = (2 * Math.PI * i) / petalCount;
              const x = Math.cos(angle) * petalRadius;
              const y = Math.sin(angle) * petalRadius;

              ctx.beginPath();
              ctx.ellipse(x, y, innerRadius, innerRadius / 2, angle, 0, 2 * Math.PI);
              ctx.fill();
            }
            ctx.restore();
            break;
          }
          default:
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        particle.x += particle.speedX;
        particle.y += particle.speedY;

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
  }, [isDark, theme, mood]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};

export default ParticlesBackground;
