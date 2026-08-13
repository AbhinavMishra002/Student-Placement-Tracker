/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1424",       // deep navy — sidebar / headings
        slate: {
          850: "#1B2340",
        },
        canvas: "#F5F6FA",    // main background
        surface: "#FFFFFF",
        line: "#E4E6F0",
        placed: "#1FAF6E",    // success / placed
        pending: "#F2A93B",   // in-process / interview
        danger: "#E5484D",    // rejected
        accent: "#4F5DFF",    // primary interactive accent (indigo)
        muted: "#6B7292",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 20, 36, 0.04), 0 8px 24px rgba(15, 20, 36, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
