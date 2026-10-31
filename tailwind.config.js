
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      keyframes: {
        awning: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },

        chartRise: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },

        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        drawLine: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },

        markerReveal: {
          "0%": {
            opacity: "0",
            transform: "scale(0)",
          },
          "70%": {
            opacity: "1",
            transform: "scale(1.3)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },

        logoReveal: {
          "0%": {
            opacity: "0",
            transform: "translateY(15px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      animation: {
        awning:
          "awning 1s cubic-bezier(.2,.9,.25,1) .1s both",

        "chart-rise":
          "chartRise .95s cubic-bezier(.2,.85,.25,1) both",

        "fade-in":
          "fadeIn .3s ease both",

        "draw-line":
          "drawLine 1.1s cubic-bezier(.45,0,.2,1) 1.45s forwards",

        "marker-reveal":
          "markerReveal .2s cubic-bezier(.2,.8,.2,1) both",

        "logo-reveal":
          "logoReveal .7s ease .3s both",
      },
    },
  },

  plugins: [],
};
