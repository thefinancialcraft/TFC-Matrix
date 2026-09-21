import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        sans: ["Poppins", "Roboto", "sans-serif"],
      },
      colors: {
        softCanvas: "#F1F5F9",
        cardWhite: "#FFFFFF",
        pineGreen: "#0F4C5C",
        limeGreen: "#84CC16",
        softMint: "#E6F4EA",
        softSky: "#E0F2FE",
        slateDark: "#0F172A",
        slateMuted: "#64748B",
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '26px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft-card': '0 2px 10px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'soft-float': '0 12px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 10px -2px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
};
export default config;
