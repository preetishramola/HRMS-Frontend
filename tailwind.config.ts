import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: "#f97316",
        manager: "#8b5cf6",
        hr: "#06b6d4",
        employee: "#22c55e",
        ai: "#f59e0b",
        surface: "#111115",
        surface2: "#18181f",
        "dark-border": "#1f1f2e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease both",
        "fade-in": "fadeIn 0.3s ease both",
        "slide-in": "slideIn 0.3s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
