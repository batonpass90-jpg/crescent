import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      colors: {
        crescent: {
          DEFAULT: "#137A4D",
          light: "#1E9E5A",
        },
        navy: "#0F1B2D",
        highlight: "#F5C842",
      },
    },
  },
  plugins: [],
};

export default config;
