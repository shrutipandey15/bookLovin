import { useEffect, useRef, useState } from "react";
import { createParticle } from "../utils/ParticlesFactory";

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const theme = isDark ? "dark" : "light";
      const count = isDark ? 40 : 60;

      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(theme, canvas.width, canvas.height));
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        ctx.fillStyle = particle.color;

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
  }, [isDark]);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
};

export default ParticlesBackground;
