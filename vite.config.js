import { defineConfig } from 'vite';
import { SUBJECTS } from './subjects/subjects.js';

const subjectInputs = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), subject.html])
);

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ...subjectInputs,
      }
    }
  }
});
