module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins'],
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
