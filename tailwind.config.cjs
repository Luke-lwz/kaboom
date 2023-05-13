/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {

          "primary": "#fc021b",

          "primary-content": "#ffffff",

          "secondary": "#0019fd",

          "secondary-content": "#ffffff",

          "accent": "#4a4a4a",
          
          "accent-content": "#ffffff",

          "accent-100": "#858585",
          
          "accent-100-content": "#ffffff",

          "neutral": "#000000",

          "neutral-content": "#ffffff",

          "base-100": "#FFFFFF",

          "base-content": "#000000",

          "info": "#72c4ff",

          "success": "#28df20",

          "warning": "#FBBD23",

          "error": "#F87272",
        },
      },
      // {
      //   dark: {

      //     "primary": "#0019fd",

      //     "primary-content": "#ffffff",

      //     "secondary": "#fc021b",

      //     "secondary-content": "#ffffff",

      //     "accent": "#6e6d6d",
          
      //     "accent-content": "#ffffff",

      //     "neutral": "#ffffff",

      //     "neutral-content": "#000000",

      //     "base-100": "#000000",

      //     "base-content": "#ffffff",

      //     "info": "#72c4ff",

      //     "success": "#36D399",

      //     "warning": "#FBBD23",

      //     "error": "#F87272",
      //   },
      // },
    ],
  },
}