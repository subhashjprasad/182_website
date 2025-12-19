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
