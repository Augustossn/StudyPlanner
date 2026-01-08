/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Importante: ativa o controle manual
  theme: {
    extend: {
      colors: {
        // Criamos cores semânticas que mudam sozinhas
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
      }
    },
  },
  plugins: [],
}