import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'tokens/index': 'src/tokens/index.ts',
    'layout/index': 'src/layout/index.ts',
    'diagrams/index': 'src/diagrams/index.ts',
    'semantic-patterns/index': 'src/semantic-patterns/index.ts',
    'renderers/index': 'src/renderers/index.ts',
    'linter/index': 'src/linter/index.ts',
    'importers/index': 'src/importers/index.ts',
    'icons/index': 'src/icons/index.ts',
    'cli/index': 'src/cli/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@resvg/resvg-js']
});
