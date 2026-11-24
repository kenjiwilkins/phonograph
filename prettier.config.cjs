module.exports = {
  semi: true,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'none',
  plugins: ['prettier-plugin-tailwindcss'],
  // Tailwind 4 has no JS config; the plugin reads the theme from the stylesheet
  tailwindStylesheet: './src/index.css'
};
