#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/app.css', import.meta.url), 'utf8');
const appJs = await readFile(new URL('../js/11-app.js', import.meta.url), 'utf8');
const keyboardJs = await readFile(new URL('../js/09-keyboard.js', import.meta.url), 'utf8');

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
  '.error-state',
  '.tool-notice',
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

assert.ok(
  css.includes('.btn-row{position:sticky;bottom:calc(64px + env(safe-area-inset-bottom))'),
  'Mobile answer actions should stay reachable above the bottom stats bar',
);
assert.ok(
  css.includes('.mobile-bottom-bar{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:250;background:var(--card-bg);border-top:1px solid var(--border);padding:8px 4px;padding-bottom:calc(8px + env(safe-area-inset-bottom))'),
  'Mobile bottom stats bar should respect safe-area insets',
);
assert.ok(
  css.includes('.opt{min-height:50px') && css.includes('.btn{min-height:44px'),
  'Mobile options and buttons should have comfortable touch targets',
);
assert.equal(appJs.includes('scrollIntoView'), false, 'App focus handling should avoid scrollIntoView');
assert.equal(keyboardJs.includes('scrollIntoView'), false, 'Keyboard focus handling should avoid scrollIntoView');

console.log('Quiz UI CSS tests passed');
