import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Для GitHub Pages: если сайт открывается по пути https://<user>.github.io/<repo>/,
// base должен быть '/<repo>/' или './' для относительных путей.
export default defineConfig({
  plugins: [react()],
  base: './',
})
