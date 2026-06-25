#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SUBJECTS } from '../subjects/subjects.js';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(pkg.scripts['capture:visuals'], 'node scripts/capture-visuals.mjs');
assert.equal(pkg.scripts['test:learning-data'], 'node scripts/test-learning-data-tools.mjs');

const visualScript = await readFile(new URL('../scripts/capture-visuals.mjs', import.meta.url), 'utf8');
for (const marker of ['desktop', 'mobile', 'theme=orange', 'theme=green', 'playwright']) {
  assert.ok(visualScript.includes(marker), `visual capture script should include ${marker}`);
}

const guide = await readFile(new URL('../docs/new-subject-workflow.md', import.meta.url), 'utf8');
for (const marker of ['<slug>-config.js', '<slug>-questions.js', 'npm run validate', 'storageKey', 'questions.js']) {
  assert.ok(guide.includes(marker), `new subject workflow should mention ${marker}`);
}

for (const subject of SUBJECTS) {
  const html = await readFile(new URL(`../${subject.html}`, import.meta.url), 'utf8');
  assert.ok(html.includes('exportLearningData()'), `${subject.html} should expose learning data export`);
  assert.ok(html.includes('importLearningDataFile'), `${subject.html} should expose learning data import`);
}

console.log('Workflow surface tests passed');
