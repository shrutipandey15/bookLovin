/** @type {import('tailwindcss').Config} */

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          coffee: {
            bg: "#f5efe6",
            card: "#fefaf0",
            text: "#4b3621",
            accent: "#d6c3b3",
            button: "#836953",
            hover: "#a67b5b",
            error: "#b33939",
          },
          dragon: {
            bg: "#1b1b2f",
            card: "#2e2e3a",
            text: "#e0e0e0",
            subtext: "#aaaaaa",
            gold: "#d4af37",
            blue: "#3a8fd0",
            blueHover: "#4b91d1",
          },
        },
        fontFamily: {
          serif: ["Merriweather", "serif"],
          fantasy: ["Cinzel Decorative", "serif"],
        },
      },
    },
    plugins: [],
  }
