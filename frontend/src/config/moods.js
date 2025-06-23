import { Heart, Sparkles, Zap, Sun, Cloud, Star, Coffee, Moon, Smile, Frown, CloudRain, Flame, AlertTriangle, Gift, Mountain } from 'lucide-react';

export const MOOD_CONFIG = Object.freeze({
  heartbroken: {
    label: "Heartbroken",
    emoji: "💔",
    enum: 1,
    description: "Processing difficult emotions",
    font: "'Playfair Display', serif",
    themes: {
      coffee: { "--primary": "#8B5A7C", "--secondary": "#A67E94", "--background": "#f7f3f6", "--text-primary": "#2D1B29", "--text-contrast": "#FFFFFF" },
      dragon: { "--primary": "#B578A3", "--secondary": "#A67E94", "--background": "#1E1A23", "--text-primary": "#E8DCF0", "--text-contrast": "#000000" }
    }
  },
  healing: {
    label: "Healing",
    emoji: "🌸",
    enum: 2,
    description: "Finding strength and growth",
    font: "'Source Serif Pro', serif",
    themes: {
        coffee: { "--primary": "#7FB069", "--secondary": "#A3C585", "--background": "#F0F8EC", "--text-primary": "#2D3E2D", "--text-contrast": "#FFFFFF" },
        dragon: { "--primary": "#8FBC95", "--secondary": "#93BA98", "--background": "#1A2C21", "--text-primary": "#D4E8DA", "--text-contrast": "#000000" }
    }
  },
  joyful: {
    label: "Joyful",
    emoji: "😊",
    enum: 3,
    description: "Feeling happy and content",
    font: "'Poppins', sans-serif",
    themes: {
        coffee: { "--primary": "#FFD60A", "--secondary": "#FFE135", "--background": "#FFFBF0", "--text-primary": "#5C4A00", "--text-contrast": "#FFFFFF" },
        dragon: { "--primary": "#FFEB3B", "--secondary": "#FFF176", "--background": "#1A1A0D", "--text-primary": "#FFF9C4", "--text-contrast": "#000000" }
    }
  },
});

export const THEME_CONFIG = Object.freeze({
  coffee: { label: "Coffee", emoji: "☕" },
  dragon: { label: "Dragon", emoji: "🐉" }
});

export const MOOD_ICONS = Object.freeze({
  heartbroken: Heart,
  healing: Sparkles,
  empowered: Zap,
  joyful: Sun,
});

export const MOOD_KEY_TO_ENUM = Object.fromEntries(
  Object.entries(MOOD_CONFIG).map(([key, { enum: moodEnum }]) => [key, moodEnum])
);

export const MOOD_ENUM_TO_KEY = Object.fromEntries(
  Object.entries(MOOD_CONFIG).map(([key, { enum: moodEnum }]) => [moodEnum, key])
);