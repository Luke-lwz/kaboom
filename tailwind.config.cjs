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
      {
        christmas: {

          "primary": "#b11e28",

          "primary-content": "#ffffff",

          "secondary": "#457d23",

          "secondary-content": "#ffffff",

          "accent": "#512026",
          
          "accent-content": "#ffffff",

          "accent-100": "#858585",
          
          "accent-100-content": "#ffffff",

          "neutral": "#2c1114",

          "neutral-content": "#ffffff",

          "base-100": "#FFFFFF",

          "base-content": "#000000",

          "info": "#72c4ff",

          "success": "#28df20",

          "warning": "#FBBD23",

          "error": "#F87272",
        },
      },
      {
        dark: {

          "primary": "#fc021b",

          "primary-content": "#ffffff",

          "secondary": "#0019fd",

          "secondary-content": "#ffffff",

          "accent": "#e0e0e0",
          
          "accent-content": "#000000",

          "accent-100": "#858585",
          
          "accent-100-content": "#ffffff",

          "neutral": "#ffffff",

          "neutral-content": "#000000",

          "base-100": "#212121",
          "base-200": "#424242",
          "base-300": "#616161",

          "base-content": "#ffffff",

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