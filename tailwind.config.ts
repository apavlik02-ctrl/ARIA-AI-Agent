import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'aria-bg': '#0F0A07',
        'aria-text': '#EDE0D4',
        'aria-orange': '#C9874F',
        'aria-orange-dark': '#A0522D',
        'aria-brown': '#7B3910',
      },
    },
  },
  plugins: [],
};

export default config;
