/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brut: {
          cream:  '#FFF8E7',
          black:  '#111111',
          yellow: '#FFD23F',
          pink:   '#FF6B9D',
          blue:   '#4D96FF',
          green:  '#6BCB77',
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        brut:    '4px 4px 0 #111111',
        'brut-lg': '6px 6px 0 #111111',
        'brut-xl': '8px 8px 0 #111111',
        'brut-sm': '2px 2px 0 #111111',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
