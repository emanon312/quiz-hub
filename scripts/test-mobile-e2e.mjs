#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const server = await createServer({
  logLevel: 'silent',
  server: {
    host: '127.0.0.1',
    port: 0,
  },
});

let browser;

function localUrl(path) {
  const base = server.resolvedUrls?.local?.[0];
  if (!base) throw new Error('Vite did not expose a local URL');
  return new URL(path, base).toString();
}

async function selectedAnswers(page) {
  return page.evaluate(() => {
    const app = window.QuizApp;
    const q = app.filteredQuestions()[app.activeSetData().currentIdx];
    return {
      id: q.id,
      type: q.type,
      answer: app.activeSetData().userAnswers[q.id],
    };
  });
}

async function assertNoDialogs(dialogs, label) {
  assert.deepEqual(dialogs, [], `${label} should not trigger a validation dialog`);
}

async function expectChoiceClass(page, index, className, label) {
  assert.equal(
    await page.locator('#qOptions .opt').nth(index).evaluate((node, value) => node.classList.contains(value), className),
    true,
    label,
  );
}

try {
  await server.listen();

  browser = await chromium.launch({ channel: 'msedge' }).catch(() => chromium.launch());
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const dialogs = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto(localUrl('/subjects/machine-learning/machine-learning.html?theme=orange'), { waitUntil: 'networkidle' });
  await page.locator('#qOptions input[type="radio"]').first().waitFor({ state: 'visible' });

  const radioIndex = await page.evaluate(() => {
    const q = window.QuizApp.filteredQuestions()[window.QuizApp.activeSetData().currentIdx];
    const wrongIndex = q.opts.findIndex((_, index) => !q.ans.includes(index));
    return wrongIndex >= 0 ? wrongIndex : 0;
  });
  await page.locator('#qOptions input[type="radio"]').nth(radioIndex).tap();
  assert.deepEqual((await selectedAnswers(page)).answer, [radioIndex], 'tapping a mobile radio input should update quiz state');
  await page.locator('#btnCheck').tap();
  await assertNoDialogs(dialogs, 'checking a selected radio answer');
  assert.equal(
    typeof (await selectedAnswers(page)).answer,
    'boolean',
    'checking a selected radio answer should mark the question as evaluated',
  );
  await expectChoiceClass(page, radioIndex, 'selected', 'checked radio answer should keep selected styling');
  await expectChoiceClass(page, radioIndex, 'wrong', 'checked wrong radio answer should keep wrong styling');

  await page.evaluate(() => {
    const app = window.QuizApp;
    const idx = app.filteredQuestions().findIndex((q) => q.type === 'multi');
    if (idx < 0) throw new Error('No multi-choice question found');
    app.activeSetData().currentIdx = idx;
    app.renderQuestion();
  });
  await page.locator('#qOptions input[type="checkbox"]').nth(0).tap();
  await page.locator('#qOptions input[type="checkbox"]').nth(1).tap();
  assert.deepEqual((await selectedAnswers(page)).answer, [0, 1], 'tapping mobile checkbox inputs should update quiz state');
  await page.locator('#btnCheck').tap();
  await assertNoDialogs(dialogs, 'checking a selected checkbox answer');
  assert.equal(
    typeof (await selectedAnswers(page)).answer,
    'boolean',
    'checking a selected checkbox answer should mark the question as evaluated',
  );
  await expectChoiceClass(page, 0, 'selected', 'checked checkbox answer should keep first selected styling');
  await expectChoiceClass(page, 1, 'selected', 'checked checkbox answer should keep second selected styling');

  await page.evaluate(() => window.showResetModal());
  const modalState = await page.evaluate(() => ({
    modalShown: document.querySelector('#resetModal')?.classList.contains('show'),
    bodyLocked: document.body.classList.contains('is-overlay-open'),
    modalZ: getComputedStyle(document.querySelector('#resetModal')).zIndex,
    bottomZ: getComputedStyle(document.querySelector('.mobile-bottom-bar')).zIndex,
  }));
  assert.equal(modalState.modalShown, true, 'reset modal should open');
  assert.equal(modalState.bodyLocked, true, 'reset modal should lock background scrolling');
  assert.ok(Number(modalState.modalZ) > Number(modalState.bottomZ), 'reset modal should layer above mobile fixed bars');

  await page.locator('#resetModal .btn-nav').tap();
  const closedModalState = await page.evaluate(() => ({
    modalShown: document.querySelector('#resetModal')?.classList.contains('show'),
    bodyLocked: document.body.classList.contains('is-overlay-open'),
  }));
  assert.equal(closedModalState.modalShown, false, 'closing reset modal should hide the modal overlay');
  assert.equal(closedModalState.bodyLocked, false, 'closing reset modal should unlock background scrolling');

  await context.close();
} finally {
  if (browser) await browser.close();
  await server.close();
}

console.log('Mobile E2E tests passed');
