// Tailwind CDN configuration (loaded right after the Tailwind script)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: "#0b0805",
        coal: "#15100a",
        gold: "#d6a94a",
        pale: "#f4e1ab",
        deep: "#8a6a24",
        mist: "#b7ab93",
      },
      fontFamily: {
        display: ["Coolvetica", '"Inter Tight"', "system-ui", "sans-serif"],
        body: ['"Inter Tight"', "system-ui", "sans-serif"],
      },
    },
  },
};