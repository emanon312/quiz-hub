import { defineConfig } from 'vite';
import { cpSync, existsSync } from 'node:fs';
import { SUBJECTS } from './subjects/subjects.js';

const subjectInputs = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), subject.html])
);

function copySubjectImages() {
  return {
    name: 'copy-subject-images',
    closeBundle() {
      for (const subject of SUBJECTS) {
        const source = `${subject.dir}/images`;
        if (!existsSync(source)) continue;
        cpSync(source, `dist/${subject.dir}/images`, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  root: '.',
  base: './',
  server: { port: 3000 },
  preview: { port: 3000 },
  plugins: [copySubjectImages()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ...subjectInputs,
      }
    }
  }
});
