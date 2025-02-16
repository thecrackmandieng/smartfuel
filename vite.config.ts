import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4200,
    strictPort: true,
  },
  preview: {
    port: 4300,
    strictPort: true,
  },
  build: {
    target: 'es2020',
  },
});
