import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          950: "#052e16",
          900: "#14532d",
          800: "#166534",
          700: "#15803d",
          600: "#16a34a",
          500: "#22c55e",
          400: "#4ade80",
          300: "#86efac",
          100: "#dcfce7",
        },
        ink: "#17201a",
        muted: "#667085",
        surface: "#ffffff",
        canvas: "#f8faf7",
        line: "#e4e7e5",
        forest: {
          950: "#052e16",
          900: "#14532d",
          800: "#166534",
          700: "#15803d",
          600: "#16a34a",
          500: "#22c55e",
          400: "#4ade80",
          300: "#86efac",
          100: "#dcfce7",
        },
        gold: {
          600: "#a6851d",
          500: "#c9a227",
          400: "#e0b93a",
          200: "#f3e3a3",
        },
        earth: {
          700: "#7f3b14",
          500: "#bc6c25",
          400: "#dda15e",
          200: "#ecd9c0",
        },
        cream: {
          50: "#ffffff",
          100: "#f8faf7",
          200: "#eef4ef",
        },
      },
      fontFamily: {
        display: ["Manrope", "Outfit", "sans-serif"],
        sans: ["Inter", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -32px rgba(20, 83, 45, 0.32)",
        lift: "0 24px 70px -36px rgba(20, 83, 45, 0.48)",
        card: "0 18px 50px -28px rgba(7, 20, 14, 0.45)",
        glow: "0 0 0 1px rgba(201, 162, 39, 0.25), 0 20px 40px -24px rgba(22, 53, 37, 0.5)",
      },
      backgroundImage: {
        kente:
          "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(22,101,52,0.12), transparent 42%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
