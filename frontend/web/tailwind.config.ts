import type { Config } from 'tailwindcss';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));

// Tea-party palette. The five brand colours are the client's; the deep
// tones are derived so text keeps 4.5:1 contrast on the light grounds.
export default {
  content: [here + 'student/index.html', here + 'admin/index.html', here + 'src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        strawberry: { DEFAULT: '#F28076', deep: '#B5433A', ink: '#8E2F28' },
        blush: { DEFAULT: '#FFB6AF', soft: '#FFE3DF' },
        cream: { DEFAULT: '#FAE0C7', soft: '#FDF0E3' },
        apricot: { DEFAULT: '#FBC193', deep: '#9A5A1E' },
        mint: { DEFAULT: '#4EB09B', soft: '#D6F0E9', deep: '#22705F' },
        milk: '#FFF9F4',
        cocoa: { DEFAULT: '#4A2C2A', soft: '#7A5249', line: '#E9CDBB' },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: { blob: '2rem', pill: '999px' },
      boxShadow: {
        plate: '0 2px 0 #E9CDBB, 0 10px 24px -12px rgba(142, 47, 40, 0.28)',
        lift: '0 3px 0 #E9CDBB, 0 16px 30px -14px rgba(142, 47, 40, 0.36)',
        press: '0 1px 0 #E9CDBB',
      },
      keyframes: {
        pour: { '0%,100%': { transform: 'rotate(-8deg)' }, '50%': { transform: 'rotate(-26deg)' } },
        steam: { '0%': { opacity: '0', transform: 'translateY(6px) scaleY(.8)' }, '40%': { opacity: '.9' }, '100%': { opacity: '0', transform: 'translateY(-14px) scaleY(1.1)' } },
        fill: { '0%': { transform: 'scaleY(0.15)' }, '100%': { transform: 'scaleY(1)' } },
        wiggle: { '0%,100%': { transform: 'rotate(0)' }, '30%': { transform: 'rotate(-6deg)' }, '60%': { transform: 'rotate(5deg)' } },
        drip: { '0%': { transform: 'scaleY(0)', opacity: '0' }, '20%': { opacity: '1' }, '100%': { transform: 'scaleY(1)', opacity: '1' } },
      },
      animation: {
        pour: 'pour 2.4s ease-in-out infinite',
        steam: 'steam 2.2s ease-out infinite',
        fill: 'fill 2.4s ease-in-out infinite alternate',
        wiggle: 'wiggle .5s ease-in-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
