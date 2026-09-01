import macrosPlugin from 'vite-plugin-babel-macros';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [macrosPlugin(), tsconfigPaths()],
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
});
