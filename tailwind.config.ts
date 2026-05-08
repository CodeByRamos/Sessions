import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#061012",
          900: "#0a1719",
          850: "#0d2022",
          800: "#10282a",
          700: "#173337",
        },
        tide: {
          500: "#20d4b5",
          400: "#47e0c6",
          300: "#7cf0dc",
        },
        coral: {
          500: "#ff725c",
          400: "#ff947f",
        },
        sun: {
          400: "#f6c85f",
        },
        sand: {
          100: "#f2ead8",
          300: "#cdbd96",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(32, 212, 181, 0.16)",
        card: "0 24px 80px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      opacity: {
        4: "0.04",
        6: "0.06",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        24: "0.24",
        28: "0.28",
        32: "0.32",
        35: "0.35",
        38: "0.38",
        45: "0.45",
        55: "0.55",
        58: "0.58",
        62: "0.62",
        65: "0.65",
        68: "0.68",
        72: "0.72",
        78: "0.78",
        82: "0.82",
        86: "0.86",
        94: "0.94",
        96: "0.96",
        98: "0.98",
      },
    },
  },
  plugins: [],
};

export default config;
