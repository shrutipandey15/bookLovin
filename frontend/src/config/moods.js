import { Heart, Sparkles, Zap, Sun } from 'lucide-react';

export const MOOD_CONFIG = Object.freeze({
  heartbroken: {
    label: "Heartbroken",
    emoji: "💔",
    enum: 1, // Kept for backward compatibility
    description: "Processing difficult emotions",
    // New 'accents' object for the new theme system
    accents: {
      daydream: { primary: "#8B5A7C", secondary: "#A67E94" },
      starlight: { primary: "#D8B4FE", secondary: "#B983FF" }
    }
  },
  healing: {
    label: "Healing",
    emoji: "🌸",
    enum: 2, // Kept for backward compatibility
    description: "Finding strength and growth",
    accents: {
      daydream: { primary: "#7FB069", secondary: "#A3C585" },
      starlight: { primary: "#A3F7B5", secondary: "#8FBC95" }
    }
  },
  joyful: {
    label: "Joyful",
    emoji: "😊",
    enum: 3, // Kept for backward compatibility
    description: "Feeling happy and content",
    accents: {
      daydream: { primary: "#FF8C42", secondary: "#FFB347" },
      starlight: { primary: "#FFD180", secondary: "#FFAB40" }
    }
  },
  empowered: {
    label: "Empowered",
    emoji: "🔥",
    enum: 4, // Kept for backward compatibility
    description: "Feeling strong and capable",
    accents: {
      daydream: { primary: "#F9A826", secondary: "#FBC02D" },
      starlight: { primary: "#FFD60A", secondary: "#FFEA00" }
    }
  },
});

export const MOOD_ICONS = Object.freeze({
  heartbroken: Heart,
  healing: Sparkles,
  empowered: Zap,
  joyful: Sun,
});

// FIX: Re-adding the helper exports that other components depend on.
export const MOOD_KEY_TO_ENUM = Object.fromEntries(
  Object.entries(MOOD_CONFIG).map(([key, { enum: moodEnum }]) => [key, moodEnum])
);

export const MOOD_ENUM_TO_KEY = Object.fromEntries(
  Object.entries(MOOD_CONFIG).map(([key, { enum: moodEnum }]) => [moodEnum, key])
);