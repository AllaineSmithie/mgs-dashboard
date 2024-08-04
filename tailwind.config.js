/* eslint-disable quote-props */
/* eslint-disable import/no-extraneous-dependencies */
const { createThemes } = require('tw-colors')
const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

// Common colors used across all the themes
const brand = {
  50: '#f2e8e8',
  100: '#e8d4d4',
  200: '#d0a9a9',
  300: '#ba9c9c',
  400: '#9f5656',
  500: '#722929',
  600: '#383232',
  700: '#452626',
  800: '#391616',
  900: '#0f0c0c',
  950: '#0a0505',
}
// Monochrome tinted gray colors
// https://www.tints.dev/red/27252E
const scale = {
  0: '#FFFFFF',
  25: '#F4F1F1',
  50: '#f1eeee',
  100: '#e8e6e6',
  200: '#cfcdcc',
  300: '#b8b3b2',
  400: '#aeacab',
  500: '#878483',
  600: '#696563',
  700: '#4d4948',
  800: '#2e2c2b',
  900: '#242221',
  950: '#1c1a1a',
  1000: '#171515',
  1100: '#000',
}

// Functional colors
const success = colors.green
const warning = colors.yellow
const danger = colors.red

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      colors: {
        // Common colors used across all the themes
        brand,
        scale,
        // Functional colors
        success,
        warning,
        danger,
      },
      boxShadow: {
        light: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--prose-code': theme('colors.slate.900'),
            // Headings
            h1: {
              marginTop: '1em',
              marginBottom: '0.2em',
              fontWeight: '700',
              lineHeight: '1.2',
            },
            h2: {
              marginTop: '1em',
              marginBottom: '0.2em',
              fontWeight: '500',
              lineHeight: '1.2',
            },
            h3: {
              marginTop: '1em',
              marginBottom: '0.2em',
              fontWeight: '600',
              lineHeight: '1.2',
            },
            // Paragraph
            p: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              lineHeight: '1.4',
            },
            // Lists
            ul: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            ol: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            li: {
              marginTop: '0.1em',
              marginBottom: '0.1em',
              lineHeight: '1.4',
            },
            // Image
            img: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
            },
            // Blockquote
            blockquote: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              fontWeight: '500',
              fontStyle: 'italic',
            },
            // Code
            code: {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              fontWeight: '500',
            },
            a: {
              color: '#493F72',
            },
          },
        },
        invert: {
          // https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
          css: {
            '--prose-code': '#e68585',
            a: {
              color: '#aa8c8c',
            },
          },
        },
      }),
    },
  },
  /* eslint-disable import/no-extraneous-dependencies */
  /* eslint-disable global-require */
  plugins: [
    createThemes({
      light: {
        // Text colors
        'foreground': scale[900], // Default text
        'foreground-secondary': scale[700], // Subtitles and other less-important content
        'foreground-muted': scale[600], // Placeholders and help text
        'foreground-emphasized': scale[1100], // Bold and other emphasized text
        // Backgrounds
        'background': scale[25], // Main body background color
        'surface-100': scale[0],
        'surface-200': scale[50],
        'surface-300': scale[100],
        'surface-400': scale[200],
        'overlay': scale[0], // For tooltips and other floating elements
        'control': scale[0], // Inputs and text areas
        // Borders
        'border': scale[100], // Default border color
        'border-secondary': scale[50], // For less prominent borders
        // Scrollbars
        'scrollbar-thumb': '#C1C1C1',
        'scrollbar-track': '#FAFAFA',
        // Link
        'link': '#727c7f',
      },
      dark: {
        // Text colors
        'foreground': scale[100], // Default text
        'foreground-secondary': scale[200], // Subtitles and other less-important content
        'foreground-muted': scale[500], // Placeholders and help text
        'foreground-emphasized': scale[0], // Bold and other emphasized text
        // Backgrounds
        'background': scale[900], // Main body background color
        'surface-100': scale[800],
        'surface-200': scale[700],
        'surface-300': scale[600],
        'surface-400': scale[500],
        'overlay': scale[900], // For tooltips and other floating elements
        'control': scale[950], // '#18171A', // scale[900], // '#151B2A', // scale[900], // Inputs and text areas
        // Borders
        'border': scale[700], // Default border color
        'border-secondary': scale[800], // For less prominent borders
        // Scrollbars
        'scrollbar-thumb': '#6B6B6B',
        'scrollbar-track': '#2C2C2C',
        // Link
        'link': '#727c7f',
      },
    }),
    require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
