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
  '.empty-state__icon',
  '.empty-state__actions',
  '.empty-state__btn',
  '#autoRevealChip.active',
  'scrollbar-gutter:stable',
  '::-webkit-scrollbar-thumb',
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
assert.ok(
  /html:not\(\[data-theme="green"\]\)\{[^}]*--scrollbar-thumb:rgba\(184,95,36,\.22\)[^}]*--scrollbar-thumb-hover:rgba\(184,95,36,\.38\)/s.test(css) &&
    /\[data-theme="green"\]\{[^}]*--scrollbar-thumb:rgba\(34,197,94,\.24\)[^}]*--scrollbar-thumb-hover:rgba\(34,197,94,\.42\)/s.test(css),
  'Scrollbar colors should be theme variables for both light and dark themes',
);
assert.ok(
  /\*{[^}]*scrollbar-width:thin[^}]*scrollbar-color:var\(--scrollbar-color\) transparent/s.test(css) &&
    /::-webkit-scrollbar-thumb\{[^}]*background:var\(--scrollbar-thumb\)/s.test(css),
  'Global scrollbars should use the active theme color variables',
);
assert.ok(
  /\.sidebar\{[^}]*scrollbar-color:var\(--sidebar-scrollbar-thumb\) transparent/s.test(css) &&
    /\.sidebar::-webkit-scrollbar-thumb\{[^}]*background:var\(--sidebar-scrollbar-thumb\)/s.test(css) &&
    /\.sidebar::-webkit-scrollbar-thumb:hover\{[^}]*background:var\(--sidebar-scrollbar-thumb-hover\)/s.test(css),
  'Sidebar scrollbars should use theme-aware sidebar scrollbar variables',
);
assert.ok(
  /\.tools-menu\{[^}]*max-height:min\(60vh,320px\)[^}]*overflow-y:auto/s.test(css),
  'Tools menu should scroll internally instead of lengthening the page',
);
assert.ok(
  /\.modal-box\{[^}]*max-height:min\(80vh,640px\)[^}]*overflow-y:auto/s.test(css),
  'Modal content should scroll internally with a viewport-aware height limit',
);
assert.ok(
  /\.empty-state\{[^}]*border:1px solid var\(--border\)[^}]*background:var\(--surface-paper\)/s.test(css),
  'Empty states should look like designed paper surfaces, not inline placeholder text',
);
assert.ok(
  /\.subj-switcher-list\{[^}]*max-height:min\(56vh,360px\)[^}]*overflow-y:auto/s.test(css) &&
    /\.subj-panel-body\{[^}]*scrollbar-gutter:stable/s.test(css),
  'Subject popups and panels should keep their scrolling stable and internal',
);
assert.ok(!appJs.includes("答案模式' +"), 'Answer mode label should not change when toggled');
assert.ok(!appJs.includes('已开'), 'Answer mode enabled state should be shown with color, not label text');

console.log('Quiz UI CSS tests passed');
