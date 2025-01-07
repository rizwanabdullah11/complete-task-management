module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      screens: {
        'sm': {'max': '450px'},
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}