import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

const ParticleBackground = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: 20 },
      color: { value: theme === "dark" ? "#FDB813" : "#8B4513" }, // Ember orange or ink brown
      shape: { type: "circle" },
      opacity: {
        value: 0.3,
        random: true,
        anim: { enable: true, speed: 0.2, opacity_min: 0.1, sync: false },
      },
      size: {
        value: { min: 1, max: 4 },
        random: true,
        anim: { enable: true, speed: 1, size_min: 0.5, sync: false },
      },
      move: {
        enable: true,
        speed: theme === "dark" ? 1.5 : 0.5,
        direction: theme === "dark" ? "top-right" : "top",
        outModes: "out",
      },
    },
  };

  return <Particles init={particlesInit} options={particlesOptions} />;
};

export default ParticleBackground;
