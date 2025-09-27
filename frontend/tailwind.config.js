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
          'background': '#F5F5DC',      // Parchment Beige
          'text-primary': '#3C3633',   // Charcoal Brown
          'primary': '#A0522D',         // Muted Sienna Brown (for buttons/accents)
          'secondary': '#D2B48C',       // Tan
          'card': 'rgba(255, 255, 255, 0.6)', // White for cards with some transparency
          'border-color': 'rgba(160, 82, 45, 0.3)', // Sienna with transparency
          'text-contrast': '#FFFFFF',
        },
        fontFamily: {
          heading: ['Lora', 'serif'],
          body: ['Lato', 'sans-serif'],
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