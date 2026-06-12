/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10141C',
          surface: '#1A2029',
          raised: '#222A36',
          border: '#2E3947',
        },
        paper: '#EDEEF0',
        muted: '#8C94A3',
        amber: {
          DEFAULT: '#E8A33D',
          dim: '#B8842F',
        },
        sage: {
          DEFAULT: '#7FB685',
          dim: '#5C8A62',
        },
        rust: {
          DEFAULT: '#D9694F',
          dim: '#B0553F',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
}
