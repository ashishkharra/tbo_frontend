/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // This is important for class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Your existing theme extensions
    },
  },
  plugins: [],
}