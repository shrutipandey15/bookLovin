export const createParticle = (theme, canvasWidth, canvasHeight) => {
  const isDark = theme === 'dragon'; // Check for 'dragon' theme instead of 'dark'

  const common = {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    speedX: (Math.random() - 0.5) * (isDark ? 1 : 0.5),
    speedY: -Math.random() * (isDark ? 1 : 0.5),
  };

  if (isDark) {
    // Dragon theme: wings, glyphs
    const shapes = ['wing', 'glyph', 'circle'];
    return {
      ...common,
      size: Math.random() * 2 + 1,
      color: ['#facc15', '#fb923c', '#38bdf8'][Math.floor(Math.random() * 3)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  } else {
    // Coffee/bookish theme: feather, quill, circle, flower
    const shapes = ['feather', 'flower', 'quill', 'circle'];
    return {
      ...common,
      size: Math.random() * 2 + 3,
      color: ['#d6bfa4', '#ceb18e', '#f1e2c6'][Math.floor(Math.random() * 3)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }
};
