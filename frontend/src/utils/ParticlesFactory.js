export const createParticle = (moodColors, theme, canvasWidth, canvasHeight) => {
  const isDark = theme === 'dragon';

  const common = {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    speedX: (Math.random() - 0.5) * (isDark ? 1 : 0.5),
    speedY: -Math.random() * (isDark ? 1 : 0.5),
  };

  const { primary, secondary, text, contrast } = moodColors;

  if (isDark) {
    const shapes = ['wing', 'glyph', 'circle'];
    return {
      ...common,
      size: Math.random() * 2 + 1,
      color: [primary, secondary, text, contrast][Math.floor(Math.random() * 4)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  } else {
    const shapes = ['feather', 'flower', 'quill', 'circle'];
    return {
      ...common,
      size: Math.random() * 2 + 3,
      color: [primary, secondary, text, contrast][Math.floor(Math.random() * 4)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  }
};
