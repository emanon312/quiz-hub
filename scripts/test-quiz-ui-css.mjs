#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/app.css', import.meta.url), 'utf8');

const requiredSnippets = [
  '--surface-paper',
  '--option-state-selected',
  '.opt::before',
  '.opt.selected::before',
  '.opt.correct::before',
  '.opt.wrong::before',
  '.right-panel .rp-divider',
  '.answer-box.show',
  '@media(prefers-reduced-motion:reduce)',
];

for (const snippet of requiredSnippets) {
  assert.ok(css.includes(snippet), `Missing quiz UI CSS marker: ${snippet}`);
}

assert.ok(!/\.opt\{[^}]*border:2px solid/s.test(css), 'Options should not use heavy 2px default borders');

console.log('Quiz UI CSS tests passed');
