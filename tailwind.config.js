/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          link:       '#010080',
          accent:     '#4F39F5',
          navActive:  '#312E81',
          light:      '#E0E7FF',
          xlight:     '#EEF2FE',
          attachGreen:'#EEFCF5',
          tagBg:      '#F3F2FF',
        },
        text: {
          900: '#171727',
          800: '#0F172B',
          700: '#314158',
          600: '#45556C',
          500: '#62748E',
          400: '#696975',
          300: '#90A1B9',
          200: '#BBBFC6',
        },
        bg: {
          page:    '#F9FAFB',
          card:    '#FFFFFF',
          input:   '#F8FAFC',
          subtle:  '#FAFAFA',
          send:    '#F0F0F0',
        },
        border: {
          light:   '#EBEAF2',
          default: '#E2E8F0',
          medium:  '#CBD5E1',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'post-title': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },
      spacing: {
        sidebar: '256px',
        'right-panel': '280px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}