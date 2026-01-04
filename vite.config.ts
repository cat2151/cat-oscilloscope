import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// Check if building in library mode
const isLibraryMode = process.env.BUILD_MODE === 'library'

export default defineConfig({
  base: isLibraryMode ? undefined : '/cat-oscilloscope/',
  server: {
    port: 3000
  },
  plugins: isLibraryMode ? [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**/*', 'src/main.ts'],
      insertTypesEntry: true,
    })
  ] : [],
  build: isLibraryMode ? {
    // Library build configuration
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CatOscilloscope',
      formats: ['es', 'cjs'],
      fileName: (format) => `cat-oscilloscope.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [],
      output: {
        // Provide global variables for UMD build (if needed in future)
        globals: {}
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Clear output directory
    emptyOutDir: true
  } : {
    // Application build configuration (default)
    outDir: 'dist',
    sourcemap: true
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
