import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#07140e",
          900: "#0c1f16",
          800: "#163525",
          700: "#1b4332",
          600: "#2d6a4f",
          500: "#40916c",
          400: "#52b788",
          300: "#95d5b2",
          100: "#d8f3dc",
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
          50: "#fdfcf8",
          100: "#f6f1e7",
          200: "#ebe3d2",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(7, 20, 14, 0.45)",
        glow: "0 0 0 1px rgba(201, 162, 39, 0.25), 0 20px 40px -24px rgba(22, 53, 37, 0.5)",
      },
      backgroundImage: {
        kente:
          "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(45,106,79,0.12), transparent 42%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
