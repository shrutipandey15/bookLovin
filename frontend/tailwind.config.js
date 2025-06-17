/** @type {import('tailwindcss').Config} */

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // This remains the same
    theme: {
      extend: {
        // Teach Tailwind about our CSS variable-based colors
        colors: {
          // Now we can use classes like `bg-primary`, `text-text-primary`, etc.
          'primary': 'var(--primary)',
          'secondary': 'var(--secondary)',
          'background': 'var(--background)',
          'text-primary': 'var(--text-primary)',
          'text-contrast': 'var(--text-contrast)',
        },
        fontFamily: {
          // We define a single 'body' font that will be changed by our theme
          body: ['var(--font-body)', 'serif'],
        },
      },
    },
    plugins: [],
  }