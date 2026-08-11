/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        space: {
          900: '#060B19',
          800: '#0F172A',
          700: '#1E293B',
        },
        quantum: {
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        trajectory: {
          classical: '#EF4444',
          quantum: '#10B981',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      }
    },
  },
  plugins: [],
}
