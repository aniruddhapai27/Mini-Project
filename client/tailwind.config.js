module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        addictive: [
          'Addictive',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        black: '#111111',
        white: '#fafafa',
      },
    },
  },
  plugins: [],
};
