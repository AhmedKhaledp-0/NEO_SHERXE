/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#7B3FF3',    // Bright cosmic purple
          secondary: '#4CC9F0',  // Bright stellar blue
          background: '#E8ECF7', // Lighter cool background
          surface: '#FFFFFF',    // Pure white
          text: '#2D3748',      // Deep space gray
          accent: '#FF61D3',    // Nebula pink
          success: '#00CF8A',   // Aurora green
          warning: '#FFB84D',   // Solar orange
          danger: '#FF5367'     // Mars red
        },
        dark: {
          primary: '#9D4EDD',    // Deep cosmic purple
          secondary: '#2A9DF4',  // Deep stellar blue
          background: '#080B1A', // Deeper space black
          surface: '#141E3C',    // Rich navy blue surface
          text: '#E2E8F0',      // Starlight silver
          accent: '#FF38BC',    // Deep nebula pink
          success: '#00B377',   // Northern lights
          warning: '#FF9F1C',   // Solar flare
          danger: '#E63946'     // Red giant
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backdropBlur: {
        'lg': '16px',
      }
    }
  },
  plugins: [
    function({ addComponents, addUtilities, theme }) {
      addComponents({
        '.glass-card': {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        },
        '.nav-link': {
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          transition: 'all 0.3s',
          position: 'relative',
          '&:hover': {
            color: theme('colors.light.primary'),
            backgroundColor: 'transparent',
          },
          '&.active': {
            color: theme('colors.light.primary'),
            backgroundColor: 'transparent',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: '-2px',
              left: '10%',
              width: '80%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '2px',
            }
          }
        },
        '.card': {
          backgroundColor: 'var(--color-surface)',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }
        },
        '.btn-primary': {
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          borderRadius: '0.5rem',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'var(--color-primary-dark)',
            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          }
        },
        '.prose': {
          'ul': {
            'listStyleType': 'disc',
            'paddingLeft': '1.5rem',
            'marginTop': '1rem',
            'marginBottom': '1rem',
          },
          'li': {
            'marginTop': '0.5rem',
            'marginBottom': '0.5rem',
          }
        }
      });

      // Add custom utilities
      addUtilities({
        '.backdrop-blur-lg': {
          'backdrop-filter': 'blur(16px)',
        },
        '.antialiased': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        }
      });
    }
  ],
}

