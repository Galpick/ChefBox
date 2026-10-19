/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Arial', 'sans-serif'],
      },
      colors: {
        chef: {
          ink: '#1f2b25',
          green: '#315c49',
          sage: '#e8eee8',
          canvas: '#f7f8f5',
          muted: '#78827b',
          line: '#e8ebe6',
          orange: '#e9a66c',
        },
      },
      boxShadow: {
        soft: '0 8px 28px rgba(27, 44, 33, 0.055)',
        pop: '0 18px 55px rgba(27, 44, 33, 0.16)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
