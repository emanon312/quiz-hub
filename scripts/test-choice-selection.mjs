#!/usr/bin/env node

import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.document = {
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  documentElement: { setAttribute() {} },
  body: { classList: { toggle() {} }, style: {} },
};
globalThis.localStorage = {
  getItem(key) {
    if (key === 'quiz-hub-theme') return null;
    return null;
  },
  setItem() {},
  removeItem() {},
};
globalThis.location = { search: '' };
globalThis.URLSearchParams = URLSearchParams;

window.QUIZ_CONFIG = {
  subjectName: 'Choice Test',
  setNames: ['A'],
  setSize: 2,
  questionTypes: [
    { type: 'single', label: 'Single', short: 'S', shortLike: false },
    { type: 'multi', label: 'Multi', short: 'M', shortLike: false },
  ],
  storageKey: 'choice_selection_test',
  legacyStorageKeys: [],
};
window.QUIZ_QUESTIONS = [
  { id: 1, type: 'single', q: 'single', opts: ['A. One', 'B. Two'], ans: [0] },
  { id: 2, type: 'multi', q: 'multi', opts: ['A. One', 'B. Two'], ans: [0, 1] },
];

const { setChoiceSelection } = await import('../js/11-app.js?test=choice-selection');

const setData = { userAnswers: {} };
setChoiceSelection(setData, window.QUIZ_QUESTIONS[0], 1, true);
assert.deepEqual(setData.userAnswers[1], [1], 'radio input change should select the tapped option');

setChoiceSelection(setData, window.QUIZ_QUESTIONS[1], 0, true);
assert.deepEqual(setData.userAnswers[2], [0], 'checkbox input change should add the tapped option');

setChoiceSelection(setData, window.QUIZ_QUESTIONS[1], 1, true);
assert.deepEqual(setData.userAnswers[2], [0, 1], 'checkbox input change should preserve existing selections');

setChoiceSelection(setData, window.QUIZ_QUESTIONS[1], 0, false);
assert.deepEqual(setData.userAnswers[2], [1], 'checkbox input change should remove an untapped option when unchecked');

setData.userAnswers[1] = true;
setChoiceSelection(setData, window.QUIZ_QUESTIONS[0], 0, true);
assert.equal(setData.userAnswers[1], true, 'checked questions should stay locked');

console.log('Choice selection tests passed');
