/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom blue and sky palettes
        blue: {
          50: '#f5f7ff',
          100: '#e9edff',
          200: '#d7ddff',
          300: '#b7c5ff',
          400: '#94a9ff',
          500: '#7c91f5',
          600: '#6c82e6',
          700: '#5a6fcf',
          800: '#4a5cac',
          900: '#3c4b8c',
        },
        sky: {
          50: '#f2f8ff',
          100: '#e6f0ff',
          200: '#cfe1ff',
          300: '#b6d2ff',
          400: '#9bc2ff',
          500: '#7fb4ff',
          600: '#6aa0e6',
          700: '#5887c7',
          800: '#486da3',
          900: '#3c5a86',
        },
        // LLM brand colors for charts and badges
        'chatgpt': '#10A37F',
        'claude': '#CC9B7A',
        'gemini': '#4285F4',
        'grok': '#000000',
      },
    },
  },
  plugins: [],
}
