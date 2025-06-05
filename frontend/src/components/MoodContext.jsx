import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

export const MOOD_CONFIG = {
  heartbroken: {
    label: "Heartbroken",
    emoji: "💔",
    coffee: {
      "--mood-primary": "#8B5A7C",
      "--mood-secondary": "#A67E94",
      "--mood-bg": "#f7f3f6",
      "--mood-text": "#2D1B29",
      "--mood-font": "'Playfair Display', serif",
      "--mood-contrast": "#FFFFFF"
    },
    dragon: {
      "--mood-primary": "#B578A3",
      "--mood-secondary": "#A67E94",
      "--mood-bg": "#1E1A23",
      "--mood-text": "#E8DCF0",
      "--mood-font": "'Playfair Display', serif",
      "--mood-contrast": "#000000"
    }
  },
  healing: {
    label: "Healing",
    emoji: "🌸",
    coffee: {
      "--mood-primary": "#7FB069",
      "--mood-secondary": "#A3C585",
      "--mood-bg": "#F0F8EC",
      "--mood-text": "#2D3E2D",
      "--mood-font": "'Source Serif Pro', serif",
      "--mood-contrast": "#FFFFFF"
    },
    dragon: {
      "--mood-primary": "#8FBC95",
      "--mood-secondary": "#93BA98",
      "--mood-bg": "#1A2C21",
      "--mood-text": "#D4E8DA",
      "--mood-font": "'Source Serif Pro', serif",
      "--mood-contrast": "#000000"
    }
  },
  empowered: {
    label: "Empowered",
    emoji: "⚡",
    coffee: {
      "--mood-primary": "#E63946",
      "--mood-secondary": "#F77F88",
      "--mood-bg": "#FFF0EF",
      "--mood-text": "#3C0507",
      "--mood-font": "'Montserrat', sans-serif",
      "--mood-contrast": "#FFFFFF"
    },
    dragon: {
      "--mood-primary": "#FF5A6B",
      "--mood-secondary": "#F77F88",
      "--mood-bg": "#1B0D0D",
      "--mood-text": "#FFE5E3",
      "--mood-font": "'Montserrat', sans-serif",
      "--mood-contrast": "#000000"
    }
  }
};

export const THEME_CONFIG = {
  coffee: { label: "Coffee", emoji: "☕" },
  dragon: { label: "Dragon", emoji: "🐉" }
};

const isValidMood = (mood) => mood && mood in MOOD_CONFIG;
const isValidTheme = (theme) => theme && theme in THEME_CONFIG;

function applyMoodTheme(mood, theme) {
  if (!isValidMood(mood) || !isValidTheme(theme)) return;
  const config = MOOD_CONFIG[mood][theme];
  Object.entries(config).forEach(([key, value]) =>
    document.documentElement.style.setProperty(key, value)
  );
}

const MoodContext = createContext();

export function MoodProvider({ children }) {
  const [mood, setMoodState] = useState("heartbroken");
  const [theme, setThemeState] = useState("coffee");

  const setMood = useCallback((newMood) => {
    if (isValidMood(newMood)) setMoodState(newMood);
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (isValidTheme(newTheme)) setThemeState(newTheme);
  }, []);

  useEffect(() => {
    applyMoodTheme(mood, theme);
  }, [mood, theme]);

  const value = useMemo(
    () => ({
      mood,
      theme,
      setMood,
      setTheme,
      getMoodConfig: () => MOOD_CONFIG[mood][theme],
      getMoodLabel: () => MOOD_CONFIG[mood]?.label || mood,
      getThemeLabel: () => THEME_CONFIG[theme]?.label || theme
    }),
    [mood, theme, setMood, setTheme]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) throw new Error("useMood must be used within a MoodProvider");
  return context;
}
