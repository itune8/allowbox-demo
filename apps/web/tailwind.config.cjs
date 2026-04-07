/* eslint-disable */
/* eslint-env node */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInSmooth: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInTop: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blobDriftA: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(40px, -30px) scale(1.1)' },
          '66%':      { transform: 'translate(-20px, 40px) scale(0.95)' },
        },
        blobDriftB: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(-30px, 20px) scale(1.08)' },
          '66%':      { transform: 'translate(25px, -35px) scale(0.97)' },
        },
        blobDriftC: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(20px, 30px) scale(1.05)' },
          '66%':      { transform: 'translate(-30px, -20px) scale(1.0)' },
        },
        cardFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        cardEnterZoom: {
          '0%':   { transform: 'scale(1)',     opacity: '1' },
          '100%': { transform: 'scale(1.5)',   opacity: '0' },
        },
      },
      animation: {
  fadeIn: 'fadeInSmooth 0.5s ease-in-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-in-700': 'fadeIn 700ms ease-out',
  'fade-in-up': 'fadeInUp 500ms ease-in-out',
        'pulse-slow': 'pulseSlow 2.5s ease-in-out infinite',
        'zoom-in': 'zoomIn 150ms ease-out',
        'slide-in-top': 'slideInTop 200ms ease-out',
        'slide-in-right': 'slideInRight 200ms ease-out',
        'slide-in-left': 'slideInLeft 200ms ease-out',
        'slide-in-bottom': 'slideInBottom 200ms ease-out',
        'blob-a': 'blobDriftA 20s ease-in-out infinite',
        'blob-b': 'blobDriftB 25s ease-in-out infinite',
        'blob-c': 'blobDriftC 30s ease-in-out infinite',
        'card-float': 'cardFloat 4s ease-in-out infinite',
        'card-enter': 'cardEnterZoom 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      transitionTimingFunction: {
        'ease-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
