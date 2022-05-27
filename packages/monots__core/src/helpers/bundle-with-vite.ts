import { build } from 'vite';

build({
  plugins: [],
  esbuild: {},
  json: {},
  build: {
    rollupOptions: { plugins: [], input: {} },
    commonjsOptions: {},
  },
});

export {};
