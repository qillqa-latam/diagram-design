import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import path from 'path';
import fs from 'fs';

function copyIndexAs404(): Plugin {
  return {
    name: 'copy-index-as-404',
    closeBundle() {
      const outDir = path.resolve(__dirname, '../dist-docs');
      const indexPath = path.join(outDir, 'index.html');
      const notFoundPath = path.join(outDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    }
  };
}

export default defineConfig({
  root: path.resolve(__dirname),
  base: '/diagram-design/',
  plugins: [
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
    copyIndexAs404()
  ],
  resolve: {
    alias: {
      'diagram-design': path.resolve(__dirname, '../src/index.ts'),
      '@resvg/resvg-js': path.resolve(__dirname, '../playground/src/mock-resvg.ts'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 5174,
    open: false
  },
  build: {
    outDir: path.resolve(__dirname, '../dist-docs'),
    emptyOutDir: true
  }
});
