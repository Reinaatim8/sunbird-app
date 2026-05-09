/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        sun: {
          50:  "#fff8ed",
          100: "#ffefd0",
          200: "#ffdb9e",
          300: "#ffc065",
          400: "#ff9a2d",
          500: "#ff7a0a",
          600: "#f05d00",
          700: "#c74302",
          800: "#9e360b",
          900: "#7f2e0c",
        },
        earth: {
          50:  "#f7f3ee",
          100: "#ede3d4",
          200: "#d9c5a8",
          300: "#c2a07a",
          400: "#ae8057",
          500: "#9e6d40",
          600: "#885835",
          700: "#6f452c",
          800: "#5c3926",
          900: "#4e3023",
        },
        ink: "#1a1209",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 122, 10, 0.3)" },
          "50%":       { boxShadow: "0 0 0 12px rgba(255, 122, 10, 0)" },
        },
      },
    },
  },
  plugins: [],
};
