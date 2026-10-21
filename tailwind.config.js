/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#12121A",
        surfaceElevated: "#181824",
        brandIndigo: "#6366F1",
        brandCyan: "#06B6D4",
        brandAmber: "#F59E0B",
        brandEmerald: "#10B981"
      }
    },
  },
  plugins: [],
}
