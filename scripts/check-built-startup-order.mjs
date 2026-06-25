#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SUBJECTS } from '../subjects/subjects.js';

const subjectPages = SUBJECTS.map((subject) => 'dist/' + subject.html);

function extractEntryAsset(html) {
  const match = html.match(/<script type="module"[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

function resolveAssetPath(pagePath, assetHref) {
  const pageDir = pagePath.split('/').slice(0, -1).join('/');
  const output = [];
  for (const part of (pageDir + '/' + assetHref).split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') output.pop();
    else output.push(part);
  }
  return output.join('/');
}

let failures = 0;

for (const pagePath of subjectPages) {
  const html = await readFile(pagePath, 'utf8');
  const assetHref = extractEntryAsset(html);
  if (!assetHref) {
    console.error(`${pagePath}: missing module entry script`);
    failures++;
    continue;
  }

  const assetPath = resolveAssetPath(pagePath, assetHref);
  const content = await readFile(join(process.cwd(), assetPath), 'utf8');
  const configIndex = content.indexOf('window.QUIZ_CONFIG');
  const staticAppImportIndex = content.indexOf('from"./11-app-');

  if (configIndex === -1) {
    console.error(`${pagePath}: entry asset does not assign window.QUIZ_CONFIG`);
    failures++;
    continue;
  }

  if (staticAppImportIndex !== -1 && staticAppImportIndex < configIndex) {
    console.error(`${pagePath}: app chunk is statically imported before QUIZ_CONFIG is assigned`);
    failures++;
  }
}

if (failures > 0) process.exit(1);
console.log('Built subject startup order is safe');
