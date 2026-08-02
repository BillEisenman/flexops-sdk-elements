/// <reference path="./copyright.d.ts" />
// Copyright (c) FlexOps, LLC. All rights reserved.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    dts({ rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FlexOpsElements',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    // Vite 8 no longer bundles esbuild: `minify: 'esbuild'` now fails with
    // "Cannot find package 'esbuild'" unless it is installed separately, and the
    // transformWithEsbuild path it uses is deprecated in favour of oxc. Use the
    // minifier Vite 8 ships with rather than re-adding a dependency Vite removed.
    minify: 'oxc',
  },
});
