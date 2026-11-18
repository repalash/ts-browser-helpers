import {defineConfig} from 'vite'
import {fileURLToPath} from 'node:url'

// The examples page. The library's own build is ../vite.config.js; this one only builds the page, from the library's
// source (not dist), so the page always runs and shows the current code.
export default defineConfig({
    root: fileURLToPath(new URL('.', import.meta.url)),
    base: './',
    resolve: {
        alias: {
            'ts-browser-helpers': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
        },
    },
    server: {
        host: '0.0.0.0',
    },
    build: {
        // npm run docs (TypeDoc) empties docs/ first, so this runs after it
        outDir: fileURLToPath(new URL('../docs/examples', import.meta.url)),
        emptyOutDir: true,
        target: 'es2020',
        sourcemap: false,
    },
})
