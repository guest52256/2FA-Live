/**
 * Tailwind configuration.
 *
 * Mirrors the design tokens of the source project (https://2fa.co.com/), which
 * configures Tailwind inline via the CDN with the following theme extension:
 *
 *   colors.brand.dark   #0B0F19   page background
 *   colors.brand.card   #151C2C   card / panel surface
 *   colors.brand.border #2A344A   hairline borders
 *   colors.brand.neon   #00F0FF   primary accent (cyan)
 *   colors.brand.accent #7000FF   secondary accent (violet)
 *
 *   fontFamily.sans  'Space Grotesk', sans-serif
 *   fontFamily.mono  'JetBrains Mono', monospace
 *
 *   animation.pulse-slow  pulse 3s cubic-bezier(.4,0,.6,1) infinite
 *   animation.float       float 6s ease-in-out infinite
 *   animation.data-stream dataStream 2.5s ease-in-out infinite
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          dark: '#0B0F19',
          card: '#151C2C',
          border: '#2A344A',
          neon: '#00F0FF',
          accent: '#7000FF',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'data-stream': 'dataStream 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dataStream: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
