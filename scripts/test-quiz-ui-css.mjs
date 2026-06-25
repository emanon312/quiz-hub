#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/app.css', import.meta.url), 'utf8');
const appJs = await readFile(new URL('../js/11-app.js', import.meta.url), 'utf8');

const requiredSnippets = [
  '--surface-paper',
  '--option-state-selected',
  '.opt::before',
  '.opt.selected::before',
  '.opt.correct::before',
  '.opt.wrong::before',
  '.right-panel .rp-divider',
  '.answer-box.show',
  '#autoRevealChip.active',
  '@media(prefers-reduced-motion:reduce)',
];

for (const snippet of requiredSnippets) {
  assert.ok(css.includes(snippet), `Missing quiz UI CSS marker: ${snippet}`);
}

assert.ok(!/\.opt\{[^}]*border:2px solid/s.test(css), 'Options should not use heavy 2px default borders');
assert.ok(
  /\.answer-box\{[^}]*transition:[^}]*max-height \.5s[^}]*opacity \.42s[^}]*transform \.5s/s.test(css),
  'Answer reveal should expand more slowly and include a transform transition',
);
assert.ok(
  /\.answer-box\{[^}]*transform:translateY\(-6px\)/s.test(css) &&
    /\.answer-box\.show\{[^}]*transform:translateY\(0\)/s.test(css),
  'Answer reveal should ease in from a slightly collapsed position',
);
assert.ok(!appJs.includes("答案模式' +"), 'Answer mode label should not change when toggled');
assert.ok(!appJs.includes('已开'), 'Answer mode enabled state should be shown with color, not label text');

console.log('Quiz UI CSS tests passed');
