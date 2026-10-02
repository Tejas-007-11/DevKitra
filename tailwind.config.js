/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.2)',
      },
      colors: {
        ink: '#0f172a',
        mist: '#f8fafc',
      },
    },
  },
  plugins: [],
};
