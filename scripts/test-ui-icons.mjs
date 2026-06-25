#!/usr/bin/env node

import { Icons } from '../js/icons.js';
import { SUBJECTS } from '../subjects/subjects.js';
import { readFile } from 'node:fs/promises';

const iconKeyPattern = /^[a-z][A-Za-z0-9]*$/;
const issues = [];

for (const subject of SUBJECTS) {
  if (!iconKeyPattern.test(subject.icon || '')) {
    issues.push(`[${subject.slug}] icon must be a semantic ASCII key, got ${JSON.stringify(subject.icon)}`);
    continue;
  }
  if (!Object.prototype.hasOwnProperty.call(Icons, subject.icon)) {
    issues.push(`[${subject.slug}] icon "${subject.icon}" is not exported by js/icons.js`);
  }
}

const requiredIcons = [
  'brandMark',
  'siteMark',
  'themePaper',
  'themeLeaf',
  'themeCarrot',
  'themeBroccoli',
  'dataviz',
  'electronics',
  'machineLearning',
  'home',
  'filter',
  'sets',
  'types',
  'star',
  'retry',
  'answer',
  'check',
  'menu',
  'prev',
  'next',
  'correct',
  'wrong',
  'submitted',
];

for (const iconName of requiredIcons) {
  if (!Object.prototype.hasOwnProperty.call(Icons, iconName)) {
    issues.push(`required icon "${iconName}" is missing from js/icons.js`);
  }
}

const assetFiles = [
  'assets/icons/site-icon.svg',
  'assets/icons/theme-carrot.svg',
  'assets/icons/theme-broccoli.svg',
];

for (const file of assetFiles) {
  try {
    const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    if (!content.includes('<svg') || !content.includes('viewBox=')) {
      issues.push(`${file} must be an SVG asset with a viewBox`);
    }
  } catch {
    issues.push(`${file} is missing`);
  }
}

const pages = [
  ['index.html', 'assets/icons/site-icon.svg'],
  ...SUBJECTS.map((subject) => [subject.html, '../../assets/icons/site-icon.svg']),
];

for (const [file, href] of pages) {
  const html = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
  const expected = `<link rel="icon" href="${href}" type="image/svg+xml">`;
  if (!html.includes(expected)) {
    issues.push(`${file} must include favicon link ${expected}`);
  }
}

const homepage = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const initJs = await readFile(new URL('../js/10-init.js', import.meta.url), 'utf8');
const appJs = await readFile(new URL('../js/11-app.js', import.meta.url), 'utf8');
for (const [file, content] of [
  ['index.html', homepage],
  ['js/10-init.js', initJs],
  ['js/11-app.js', appJs],
]) {
  if (!content.includes('themeBroccoli') || !content.includes('themeCarrot')) {
    issues.push(`${file} should use carrot/broccoli theme toggle icons`);
  }
}

if (issues.length > 0) {
  console.error('UI icon validation failed:');
  for (const issue of issues) console.error('- ' + issue);
  process.exitCode = 1;
} else {
  console.log('UI icon validation passed');
}
