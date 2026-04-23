/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: "#FEF7E6",
        sand: "#FFF9EF",
        ink: "#0B3B3A",
        accent: "#E6A817",
        nightBg: "#1A1C1E",
        nightSidebar: "#25282B",
        nightCard: "#2E3135",
        nightPrimary: "#4DB6AC",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(11, 59, 58, 0.18)",
      },
    },
  },
  plugins: [],
};
