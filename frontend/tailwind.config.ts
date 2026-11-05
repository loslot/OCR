import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080B0A",
          secondary: "#0D1210",
          card: "#111816",
          cardHover: "#16201D",
          border: "#1A2720",
          borderBright: "rgba(57, 255, 20, 0.35)",
          neon: "#39FF14",
          neonSoft: "rgba(57, 255, 20, 0.15)",
          accent: "#00E676",
          text: "#F5F7F5",
          muted: "#8B9690",
          dark: "#050706",
          danger: "#FF4D4D",
          warning: "#FFB020",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "neon-sm": "0 0 10px rgba(57, 255, 20, 0.2)",
        neon: "0 0 20px rgba(57, 255, 20, 0.35)",
        "neon-lg": "0 0 35px rgba(57, 255, 20, 0.5)",
        "neon-inset": "inset 0 0 15px rgba(57, 255, 20, 0.15)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        scanline: "scanline 2.5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
