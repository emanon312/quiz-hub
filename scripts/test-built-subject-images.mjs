#!/usr/bin/env node

import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SUBJECTS } from '../subjects/subjects.js';

const projectRootUrl = new URL('../', import.meta.url);
const distRootUrl = new URL('../dist/', import.meta.url);

function extractLocalImageRefs(html) {
  if (typeof html !== 'string' || !html.includes('<img')) return [];
  const refs = [];
  const re = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi;
  let match;
  while ((match = re.exec(html))) {
    const src = match[2].trim();
    if (!src || /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) continue;
    refs.push(src);
  }
  return refs;
}

async function exists(url) {
  try {
    await access(fileURLToPath(url));
    return true;
  } catch {
    return false;
  }
}

async function importFresh(url) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set('builtImages', String(Date.now()) + Math.random().toString(16).slice(2));
  return import(nextUrl.href);
}

const missing = [];

for (const subject of SUBJECTS) {
  delete globalThis.QUIZ_CONFIG;
  delete globalThis.QUIZ_QUESTIONS;
  globalThis.window = globalThis;

  await importFresh(new URL(subject.config, projectRootUrl));
  await importFresh(new URL(subject.questions, projectRootUrl));
  const questions = globalThis.QUIZ_QUESTIONS || [];
  const subjectDistDir = new URL(subject.dir.replace(/\/?$/, '/'), distRootUrl);

  for (const q of questions) {
    const refs = [
      ...extractLocalImageRefs(q.q),
      ...extractLocalImageRefs(q.exp),
      ...extractLocalImageRefs(q.ansText),
    ];
    for (const ref of refs) {
      const imageUrl = new URL(ref, subjectDistDir);
      if (!(await exists(imageUrl))) {
        missing.push(`[${subject.slug}] id=${q.id} missing ${ref}`);
      }
    }
  }
}

if (missing.length > 0) {
  console.error('Built subject image validation failed:');
  for (const item of missing) console.error('- ' + item);
  process.exit(1);
}

console.log('Built subject image validation passed');
