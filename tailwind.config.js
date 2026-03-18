/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#08080a",
          1: "#0e0e12",
          2: "#141418",
          3: "#1a1a20",
          4: "#222229",
          5: "#2a2a33",
        },
        ink: {
          1: "#fafaf9",
          2: "#b8b8be",
          3: "#7c7c85",
          4: "#4e4e58",
          5: "#35353d",
        },
        accent: {
          blue: "#4f8ff7",
          purple: "#a78bfa",
          green: "#36d399",
          amber: "#fbbf24",
          red: "#f87171",
          cyan: "#22d3ee",
        },
        border: {
          1: "rgba(255,255,255,0.04)",
          2: "rgba(255,255,255,0.07)",
          3: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"SF Pro Text"', "system-ui", "sans-serif"],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          "monospace",
        ],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "14px",
        xl: "18px",
      },
      fontSize: {
        "2xs": "10px",
        xs: "11.5px",
        sm: "13px",
        base: "14px",
        lg: "16px",
        xl: "18px",
        "2xl": "22px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-right": "slideRight 0.25s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideRight: {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
