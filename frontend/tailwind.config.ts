import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          50: '#F4FAF5',   // Very soft mint tint
          100: '#E9F5EA',  // Band 1: Pale Sage / Mint Light
          200: '#C8E8CB',  // Soft pastel green
          300: '#A6D7A8',  // Band 2: Muted Sage Green
          400: '#84C887',  // Medium Sage
          500: '#66BC6A',  // Band 3: Vibrant Emerald / Leaf Green
          600: '#4DA751',  // Deep Leaf Green
          700: '#2E8534',  // Dark Forest Green
          800: '#1B6B21',  // Rich Pine Green
          900: '#145E1A',  // Band 4: Deep Forest / Hunter Green
          950: '#0B380F',  // Obsidian Forest (Darkest contrast)
        },
      },
    },
  },
  plugins: [],
};

export default config;