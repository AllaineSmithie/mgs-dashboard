/* eslint-disable quote-props */
/* eslint-disable import/no-extraneous-dependencies */
const { createThemes } = require('tw-colors')
const colors = require('tailwindcss/colors')

// Common colors used across all the themes
const brand = {
  50: '#EAE8F2',
  100: '#D8D4E8',
  200: '#B1A9D0',
  300: '#8A7EB9',
  400: '#65569F',
  500: '#483E72',
  600: '#3B325C',
  700: '#2C2645',
  800: '#1D192E',
  900: '#0F0D17',
  950: '#06050A',
}
// Monochrome tinted gray colors
// https://www.tints.dev/red/27252E
const scale = {
  0: '#FFFFFF',
  25: '#F1F1F4',
  50: '#eeeef1',
  100: '#E4E3E8',
  200: '#C6C4CF',
  300: '#ABA7B8',
  400: '#8D889F',
  500: '#736D88',
  600: '#595469',
  700: '#413D4C',
  800: '#27252E',
  900: '#1E1D24',
  950: '#18171C',
  1000: '#131217',
  1100: '#000',
}

// Functional colors
const success = colors.green
const warning = colors.yellow
const danger = colors.red

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Avoid naming conflicts with bootstrap
  // https://tailwindcss.com/docs/configuration#prefix
  prefix: 'tw-',
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
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
            '--tw-prose-code': theme('colors.slate.900'),
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
            '--tw-prose-code': '#e685b5',
            a: {
              color: '#928caa',
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
      },
    }),
    require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
