#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS } from '../subjects/subjects.js';

const baseUrl = process.env.QUIZ_VISUAL_BASE_URL || 'http://127.0.0.1:3000';
const outDir = new URL('../visual-regression/', import.meta.url);
const require = createRequire(import.meta.url);

const shots = [
  { name: 'home-desktop-theme-orange', path: '/', viewport: '1366,768', theme: 'theme=orange' },
  { name: 'home-mobile-theme-orange', path: '/', viewport: '390,844', theme: 'theme=orange' },
  { name: 'home-desktop-theme-green', path: '/', viewport: '1366,768', theme: 'theme=green' },
  ...SUBJECTS.map((subject) => ({
    name: `${subject.slug}-desktop-theme-orange`,
    path: '/' + subject.homeHref,
    viewport: '1366,768',
    theme: 'theme=orange',
  })),
  ...SUBJECTS.map((subject) => ({
    name: `${subject.slug}-mobile-theme-orange`,
    path: '/' + subject.homeHref,
    viewport: '390,844',
    theme: 'theme=orange',
  })),
];

function joinUrl(base, path, query) {
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `${cleanBase}${cleanPath}?${query}`;
}

function parseViewport(size) {
  const [width, height] = size.split(',').map((value) => Number(value));
  return { width, height };
}

function getBundledPlaywrightCandidates() {
  const roots = [
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules')
      : '',
    process.env.HOME
      ? path.join(process.env.HOME, '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules')
      : '',
  ].filter(Boolean);

  return roots.flatMap((root) => {
    const candidates = [path.join(root, 'playwright')];
    const pnpmRoot = path.join(root, '.pnpm');
    if (existsSync(pnpmRoot)) {
      for (const entry of readdirSync(pnpmRoot, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.startsWith('playwright@')) {
          candidates.push(path.join(pnpmRoot, entry.name, 'node_modules', 'playwright'));
        }
      }
    }
    return candidates;
  });
}

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    const candidates = [
      process.env.QUIZ_PLAYWRIGHT_MODULE,
      ...getBundledPlaywrightCandidates(),
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        try {
          return require(candidate);
        } catch {
          // Keep looking; some package manager layouts expose a partial shim.
        }
      }
    }

    throw new Error('Playwright is not available. Install it with `npm install -D playwright` or set QUIZ_PLAYWRIGHT_MODULE to a local Playwright package path.');
  }
}

await mkdir(outDir, { recursive: true });

const { chromium } = loadPlaywright();
const browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch());

for (const shot of shots) {
  const target = joinUrl(baseUrl, shot.path, shot.theme);
  const file = new URL(`${shot.name}.png`, outDir);
  const context = await browser.newContext({ viewport: parseViewport(shot.viewport) });
  const page = await context.newPage();
  await page.goto(target, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: fileURLToPath(file), fullPage: true });
  await context.close();
}

await browser.close();

console.log(`Captured ${shots.length} visual regression screenshots in ${outDir.pathname}`);
