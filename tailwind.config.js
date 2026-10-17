/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        juve: {
          DEFAULT: '#631426',
          grena: '#631426',
          dark: '#4A0D1B',
          light: '#7F1A31',
          subtle: '#FDF2F4',
          border: '#F3CCD3',
          gold: '#C59B27',
          'gold-light': '#FDF9EF',
        }
      },
      fontFamily: {
        sans: ['KoHo', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        koho: ['KoHo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
