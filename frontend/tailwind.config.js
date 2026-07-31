/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Material Design 3 Spacing Scale
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
        '5xl': '64px',
      },
      
      // Mobile-first breakpoints
      screens: {
        'xs': '320px',
        'sm': '360px',
        'md': '375px',
        'lg': '390px',
        'xl': '412px',
        '2xl': '430px',
        'tablet': '600px',
        'laptop': '768px',
        'desktop': '1024px',
      },
      
      // Material Design 3 Border Radius
      borderRadius: {
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px',
        'full': '9999px',
      },
      
      // Mobile-optimized typography
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        'xl': ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.5px' }],
      },
      
      // Touch-friendly sizing
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      
      // Material Design 3 Elevation
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.1)',
        'sm': '0 2px 4px rgba(0,0,0,0.1)',
        'md': '0 4px 8px rgba(0,0,0,0.12)',
        'lg': '0 8px 16px rgba(0,0,0,0.14)',
        'xl': '0 12px 24px rgba(0,0,0,0.16)',
        '2xl': '0 20px 40px rgba(0,0,0,0.18)',
      },
      
      // Animation durations
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      
      // Animation curves (Material Design)
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
        'standard': 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
        'decelerated': 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'accelerated': 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
      },
    },
  },
  plugins: [],
}
