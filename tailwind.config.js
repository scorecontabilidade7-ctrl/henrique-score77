/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Score brand green (do Instagram)
        brand: {
          50: '#eafff3',
          100: '#ccffe1',
          200: '#9bf7c4',
          300: '#5eec9f',
          400: '#2ad97e',
          500: '#0dbf62',
          600: '#039a4e',
          700: '#067a41',
          800: '#0a6036',
          900: '#0a4f2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
