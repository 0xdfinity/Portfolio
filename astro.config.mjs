import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://0xdfinity.github.io',
  base: '/Portfolio',
  output: 'static',
  build: { format: 'directory' },
});
