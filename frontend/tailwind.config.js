/** @type {import('tailwindcss').Config} */

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // This remains the same
    theme: {
      extend: {
        colors: {
          'primary': 'var(--primary)',
          'secondary': 'var(--secondary)',
          'background': 'var(--background)',
          'text-primary': 'var(--text-primary)',
          'text-contrast': 'var(--text-contrast)',
        },
        fontFamily: {
          body: ['var(--font-body)', 'serif'],
        },
      },
    },
    plugins: [],
  }