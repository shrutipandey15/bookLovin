/** @type {import('tailwindcss').Config} */

export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // We use this for the 'starlight' theme
    theme: {
      extend: {
        colors: {
          'primary': 'var(--primary)',
          'secondary': 'var(--secondary)',
          'background': 'var(--background)',
          'background-end': 'var(--background-end)', // For gradients
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-contrast': 'var(--text-contrast)',
          'card-background': 'var(--card-background)',
          'border-color': 'var(--border-color)',
        },
        fontFamily: {
          heading: ['Playfair Display', 'serif'],
          body: ['Source Serif Pro', 'serif'],
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
            '50%': { transform: 'translateY(-25px) rotate(3deg)' },
          }
        },
        animation: {
          float: 'float 8s ease-in-out infinite',
        }
      },
    },
    plugins: [],
}