export const createParticle = (theme, canvasWidth, canvasHeight) => {
    const isDark = theme === 'dark';

    const common = {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      speedX: (Math.random() - 0.5) * (isDark ? 1 : 0.5),
      speedY: -Math.random() * (isDark ? 1 : 0.5),
    };

    if (isDark) {
      // Dragon-inspired theme
      return {
        ...common,
        size: Math.random() * 2 + 1,
        color: ['#facc15', '#fb923c', '#38bdf8'][Math.floor(Math.random() * 3)],
      };
    } else {
      // Coffee-stained theme
      return {
        ...common,
        size: Math.random() * 2 + 3,
        color: ['#d6bfa4', '#ceb18e', '#f1e2c6'][Math.floor(Math.random() * 3)], // parchmenty tones
      };
    }
  };
