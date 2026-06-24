import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        lyra: {
          dark: '#040810',
          navy: '#0B1428',
          steel: '#4A6FA5',
          gold: '#C9A961',
          goldlight: '#D4AF37',
          cream: '#F5F5F0',
          card: 'rgba(255,255,255,0.03)',
          bordercard: 'rgba(255,255,255,0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(201,169,97,0.2)' }, '100%': { boxShadow: '0 0 20px rgba(201,169,97,0.4)' } },
      }
    }
  },
  plugins: []
}
export default config
