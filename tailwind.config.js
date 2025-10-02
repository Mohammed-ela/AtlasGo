/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#0A66C2',
          600: '#08539A',
          700: '#064073',
          800: '#042C4D',
          900: '#021926',
        },
        accent: {
          50: '#FDF7E6',
          100: '#FBEFCC',
          200: '#F7DF99',
          300: '#F3CF66',
          400: '#EFBF33',
          500: '#D4A017',
          600: '#A88012',
          700: '#7C600E',
          800: '#504009',
          900: '#242005',
        },
        light: {
          bg: '#F7F9FC',
          text: '#0B1220',
        },
        dark: {
          bg: '#0B1220',
          text: '#E6EAF2',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'urbanist': ['Urbanist', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      }
    },
  },
  plugins: [],
}
