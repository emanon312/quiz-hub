#!/usr/bin/env node

import { Icons } from '../js/icons.js';
import { SUBJECTS } from '../subjects/subjects.js';

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
  'themePaper',
  'themeLeaf',
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

if (issues.length > 0) {
  console.error('UI icon validation failed:');
  for (const issue of issues) console.error('- ' + issue);
  process.exitCode = 1;
} else {
  console.log('UI icon validation passed');
}
