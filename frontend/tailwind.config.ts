import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          50: '#eef8ff',
          100: '#d9f0ff',
          500: '#0084ff',
          600: '#0066cc',
          900: '#003366',
        }
      }
    },
  },
  plugins: [],
};
export default config;