#!/usr/bin/env node

import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.localStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {},
};

window.QUIZ_CONFIG = {
  setNames: ['A'],
  setSize: 2,
  questionTypes: [
    { type: 'single', shortLike: false },
    { type: 'fill', shortLike: false },
    { type: 'short', shortLike: true },
  ],
  storageKey: 'runtime_state_test',
  legacyStorageKeys: [],
};
window.QUIZ_QUESTIONS = [
  { id: 1, type: 'single', q: 'single', opts: ['A. One'], ans: [0] },
  { id: 2, type: 'fill', q: 'fill', ansText: 'answer' },
];

const state = await import('../js/03-state.js?test=runtime-state');

const setData = {
  userAnswers: {
    1: [0],
    2: true,
    3: false,
    4: 'submitted',
  },
};

assert.equal(state.isAnswered(setData, { id: 1 }), false, 'selected-but-unchecked choice must not count as answered');
assert.equal(state.isAnswered(setData, { id: 2 }), true, 'correct answers should count as answered');
assert.equal(state.isAnswered(setData, { id: 3 }), true, 'wrong answers should count as answered');
assert.equal(state.isAnswered(setData, { id: 4 }), true, 'submitted short answers should count as answered');
assert.equal(
  state.countAnswered(setData, [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]),
  3,
  'progress counts only checked/submitted answers, not selected-but-unchecked choices'
);

state.setFillFeedback(setData, 11, [{ kw: 'alpha', ok: true }]);
state.setFillFeedback(setData, 12, [{ kw: 'beta', ok: false }]);

assert.deepEqual(state.getFillFeedback(setData, 11), [{ kw: 'alpha', ok: true }]);
assert.deepEqual(state.getFillFeedback(setData, 12), [{ kw: 'beta', ok: false }]);

state.clearFillFeedback(setData, 11);
assert.equal(state.getFillFeedback(setData, 11), null);
assert.deepEqual(state.getFillFeedback(setData, 12), [{ kw: 'beta', ok: false }]);

console.log('Runtime state tests passed');
