/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beam Brand Colors - Official Palette
        beam: {
          // Primary Colors
          pink: {
            50: '#fff0f4',
            100: '#ffe0e9',
            200: '#ffc7d8',
            300: '#ff9ebc',
            400: '#ff6699',
            500: '#FF2069', // Primary Pink - Main Brand Color
            600: '#e61a5e',
            700: '#cc1653',
            800: '#b31248',
            900: '#990e3d',
          },
          charcoal: {
            50: '#f0f4f5',
            100: '#e1e9eb',
            200: '#c3d3d7',
            300: '#a5bdc3',
            400: '#87a7af',
            500: '#06303A', // Primary Charcoal - Main Brand Color
            600: '#052a32',
            700: '#04242a',
            800: '#031e22',
            900: '#02181a',
          },
          // Secondary Colors
          teal: {
            50: '#f0fdfb',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#54D9C9', // Secondary Teal - Partners Context
            600: '#4bc3b5',
            700: '#42ada1',
            800: '#39978d',
            900: '#308179',
          },
          yellow: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#F6C838', // Secondary Yellow
            600: '#ddb432',
            700: '#c4a02c',
            800: '#ab8c26',
            900: '#927820',
          },
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#5030E2', // Secondary Purple - Merchants/Businesses Context
            600: '#482bcb',
            700: '#4026b4',
            800: '#38219d',
            900: '#301c86',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#191919', // Secondary Grey
          },
        },
        // Semantic Colors using Beam Palette
        primary: {
          50: '#fff0f4',
          100: '#ffe0e9',
          200: '#ffc7d8',
          300: '#ff9ebc',
          400: '#ff6699',
          500: '#FF2069', // Beam Pink
          600: '#e61a5e',
          700: '#cc1653',
          800: '#b31248',
          900: '#990e3d',
        },
        secondary: {
          50: '#f0f4f5',
          100: '#e1e9eb',
          200: '#c3d3d7',
          300: '#a5bdc3',
          400: '#87a7af',
          500: '#06303A', // Beam Charcoal
          600: '#052a32',
          700: '#04242a',
          800: '#031e22',
          900: '#02181a',
        },
        accent: {
          teal: '#54D9C9',    // Partners context
          yellow: '#F6C838',  // General accent
          purple: '#5030E2',  // Merchants/Businesses context
        },
      },
      fontFamily: {
        'beam': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        'sans': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
        'nunito': ['Nunito', 'Helvetica', 'Arial', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'nunito-extra-bold': '800',  // For H1 and H2
        'nunito-bold': '700',        // For H3 and Big paragraph
        'nunito-regular': '400',     // For regular paragraph text
      },
      backgroundImage: {
        'gradient-beam': 'linear-gradient(135deg, #FF2069 0%, #5030E2 100%)',
        'gradient-beam-reverse': 'linear-gradient(135deg, #5030E2 0%, #FF2069 100%)',
        'gradient-beam-vertical': 'linear-gradient(180deg, #FF2069 0%, #5030E2 100%)',
      },
      boxShadow: {
        'beam': '0 10px 25px -3px rgba(255, 32, 105, 0.1), 0 4px 6px -2px rgba(255, 32, 105, 0.05)',
        'beam-lg': '0 20px 25px -5px rgba(255, 32, 105, 0.1), 0 10px 10px -5px rgba(255, 32, 105, 0.04)',
        'beam-xl': '0 25px 50px -12px rgba(255, 32, 105, 0.25)',
      },
      letterSpacing: {
        'beam-tight': '-0.02em',    // 80% of font size for tight kerning
        'beam-normal': '-0.01em',   // 85% of font size for normal kerning
        'beam-wide': '0.01em',      // 90% of font size for wide kerning
      },
      fontSize: {
        // Official Beam Typography Scale (converted from pt to rem)
        'beam-h1': ['1.75rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],        // 28pt / 32pt
        'beam-h2': ['1.25rem', { lineHeight: '1.625rem', letterSpacing: '-0.02em' }],    // 20pt / 26pt
        'beam-h3': ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em' }],   // 15pt / 20pt
        'beam-big': ['0.6375rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],     // 10.2pt / 16pt
        'beam-para': ['0.5875rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],    // 9.4pt / 16pt
        
        // Additional sizes for flexibility
        'beam-xs': ['0.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'beam-sm': ['0.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'beam-base': ['1rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'beam-lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'beam-xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'beam-2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'beam-3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'beam-4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'beam-5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'beam-6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'beam-7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [],
}

