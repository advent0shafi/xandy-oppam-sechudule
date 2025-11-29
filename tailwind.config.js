/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#FF385C', // Airbnb-ish Red/Pink
          hover: '#D90B3E',
          secondary: '#008489', // Teal
          dark: '#222222',
          gray: '#717171',
          light: '#F7F7F7'
        }
      },
      boxShadow: {
        'card': '0 6px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.15)',
        'floating': '0 8px 28px rgba(0,0,0,0.12)',
      }
    }
  },
  plugins: [],
}
