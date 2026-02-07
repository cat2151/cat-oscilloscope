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
  resolve: isLibraryMode ? {} : {
    alias: {
      // demo-simple.js が `import from 'cat-oscilloscope'` で
      // install from github と同じパターンで利用できるようにする
      'cat-oscilloscope': resolve(__dirname, 'src/index.ts')
    }
  },
  plugins: isLibraryMode ? [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/__tests__/**/*', 'src/main.ts'],
      insertTypesEntry: true,
    })
  ] : [],
  build: isLibraryMode ? {
    // Library build configuration - generates ESM/CJS bundles with type definitions
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
        // Provide global variables if needed in future (e.g., for UMD format)
        globals: {}
      }
    },
    // Generate source maps for debugging
    sourcemap: true,
    // Do not clear output directory to avoid removing app build artifacts
    emptyOutDir: false
  } : {
    // Application build configuration (default) - generates static web app for GitHub Pages
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'demo-simple.html'),
      }
    }
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
