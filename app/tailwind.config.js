/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        ['background-darker']: 'hsl(var(--background-darker))',
        ['background-lighter']: 'hsl(var(--background-lighter))',
        ['background-lightest']: 'hsl(var(--background-lightest))',
        ['background-lightest-hover']: 'hsl(var(--background-lightest-hover))',

        border: 'hsl(var(--border))',
        ['border-light']: 'hsl(var(--border-light))',
        ['border-lighter']: 'hsl(var(--border-lighter))',
        ['border-lighter-hover']: 'hsl(var(--border-lighter-hover))',

        foreground: 'hsl(var(--foreground))',
        ['foreground-inverted']: 'hsl(var(--foreground-inverted))',
        primary: 'hsl(var(--primary))',
        ['primary-muted']: 'hsl(var(--primary-muted))',
        ['foreground-muted']: 'hsl(var(--foreground-muted))'
      },
      borderRadius: {
        md: '0.4rem'
      }
    }
  },
  plugins: []
}
