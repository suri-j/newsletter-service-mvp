import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Notion-style color palette
        gray: {
          50: '#f7f6f3',
          100: '#f1f1ef',
          200: '#e9e9e7',
          300: '#ddddda',
          400: '#cdccc8',
          500: '#a8a29e',
          600: '#79716b',
          700: '#5d5449',
          800: '#514a3e',
          900: '#37352f',
        },
        blue: {
          50: '#f0f8ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config 