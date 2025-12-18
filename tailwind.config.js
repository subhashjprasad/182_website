/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
