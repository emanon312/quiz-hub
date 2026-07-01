#!/usr/bin/env node

import assert from 'node:assert/strict';

function createNode() {
  const classes = new Set();
  return {
    style: {},
    textContent: '',
    innerHTML: '',
    offsetWidth: 0,
    classList: {
      add(...values) { values.forEach((value) => classes.add(value)); },
      remove(...values) { values.forEach((value) => classes.delete(value)); },
      contains(value) { return classes.has(value); },
      toggle(value, force) {
        if (force === undefined ? !classes.has(value) : force) classes.add(value);
        else classes.delete(value);
      },
    },
    querySelector() {
      return createNode();
    },
  };
}

const nodes = new Map();
globalThis.window = globalThis;
globalThis.document = {
  getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, createNode());
    return nodes.get(id);
  },
};
globalThis.alert = (message) => {
  throw new Error(`Unexpected alert: ${message}`);
};
globalThis.setTimeout = (fn) => {
  fn();
  return 0;
};
globalThis.localStorage = {
  getItem() { return null; },
  setItem() {},
  removeItem() {},
};

window.QUIZ_CONFIG = {
  setNames: ['A'],
  setSize: 1,
  questionTypes: [{ type: 'single', label: 'Single', short: 'S', shortLike: false }],
  storageKey: 'choice_result_state_test',
  legacyStorageKeys: [],
  milestoneMsgs: {},
  breakMsgs: ['break #BEST#'],
  streakMilestones: [],
  streakMilestoneEmoji: {},
};
window.QUIZ_QUESTIONS = [
  { id: 1, type: 'single', q: 'single', opts: ['A. One', 'B. Two'], ans: [0], exp: 'because' },
];

await import('../js/07-actions.js?test=choice-result-state');

const setData = {
  userAnswers: { 1: [1] },
  revealedIds: {},
  wrongBank: {},
  currentIdx: 0,
  streak: 1,
  bestStreak: 1,
};
const ctx = {
  activeSetData() { return setData; },
  filteredQuestions() { return window.QUIZ_QUESTIONS; },
  saveData() {},
  renderQuestion() {},
};

window.Actions.checkAnswer(ctx);

assert.equal(setData.userAnswers[1], false, 'checked choice answers should still store correctness as a boolean');
assert.deepEqual(
  setData.choiceSelections[1],
  [1],
  'checked choice answers should preserve the original selected option indexes for result rendering',
);

console.log('Choice result state tests passed');
