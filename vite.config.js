import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        electronics: 'subjects/electronics/electronics.html',
        dataviz: 'subjects/dataviz/dataviz.html',
      }
    }
  }
});
