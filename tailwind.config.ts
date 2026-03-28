import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      colors: {
        teal: {
          50: "#E0FAF5",
          100: "#A7F0E3",
          200: "#4DD9C7",
          400: "#00B8A5",
          600: "#008C7C",
          800: "#006058",
          900: "#00332E",
        },
        slate: {
          50: "#F7F8F9",
          100: "#EAECEF",
          200: "#C8CDD6",
          400: "#8492A8",
          600: "#4A556B",
          800: "#222D3F",
          900: "#0F1724",
        },
        amber: {
          50: "#FFF8E6",
          100: "#FFE9A0",
          200: "#FFD147",
          400: "#F5A623",
          600: "#B87209",
          800: "#7A4A00",
          900: "#3D2400",
        },
      },
      borderRadius: {
        input: "12px",
        search: "14px",
        card: "20px",
        stat: "16px",
        modal: "24px",
        icon: "12px",
        pill: "100px",
      },
      spacing: {
        "ac-1": "4px",
        "ac-2": "8px",
        "ac-3": "12px",
        "ac-4": "16px",
        "ac-5": "20px",
        "ac-6": "24px",
        "ac-8": "32px",
        "ac-12": "48px",
        "ac-16": "64px",
      },
    },
  },
  plugins: [],
};

export default config;
