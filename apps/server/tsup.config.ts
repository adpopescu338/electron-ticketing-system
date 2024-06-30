import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  splitting: false,
  sourcemap: false,
  clean: false,
  minify: true,
  noExternal: [/^(?!electron$).+$/],
  external: [/^(?!electron$).*$/],
});
