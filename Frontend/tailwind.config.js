/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
        bg4: "var(--bg4)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        border: "var(--border)",
        border2: "var(--border2)",
        text: "var(--text)",
        text2: "var(--text2)",
        text3: "var(--text3)",
        primary: "var(--primary)",
        primary2: "var(--primary2)",
        accent: "var(--accent)",
        red: "var(--red)",
        green: "var(--green)",
        blue: "var(--blue)",
        purple: "var(--purple)",
        gold: "var(--gold)",
        gold2: "var(--gold2)",
      },
      fontFamily: {
        sans: "var(--font)",
        mono: "var(--mono)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        DEFAULT: "var(--shadow)",
      },
    },
  },
  plugins: [],
}
