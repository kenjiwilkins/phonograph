/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      "gray-100": "#F2F2F2",
      "gray-800": "#B3B3B3",
      "gray-900": "#282828",
      "black-700": "#181818",
      "black-800": "#121212",
      "black-900": "#000000",
      green: "#53E659",
      white: "#FFFFFF",
    },
    fontSize: {
      logo: "32px",
      h1: "48px",
      h6: "14px",
      primary: "14px",
      secondary: "11px",
    },
    extend: {},
  },
  plugins: [],
};
