import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      'diagram-design': path.resolve(__dirname, '../src/index.ts'),
      '@resvg/resvg-js': path.resolve(__dirname, 'src/mock-resvg.ts')
    }
  },
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: path.resolve(__dirname, '../dist-playground'),
    emptyOutDir: true
  }
});
