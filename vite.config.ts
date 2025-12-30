import { defineConfig } from 'vite'

export default defineConfig({
  base: '/cat-oscilloscope/',
  server: {
    port: 3000
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
