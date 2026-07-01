#!/usr/bin/env node

import assert from 'node:assert/strict';

function createNode(value = '') {
  const classes = new Set();
  return {
    value,
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      add(...values) { values.forEach((item) => classes.add(item)); },
      remove(...values) { values.forEach((item) => classes.delete(item)); },
      contains(value) { return classes.has(value); },
    },
    querySelector() {
      return createNode();
    },
  };
}

const nodes = new Map([
  ['fillInput', createNode('near miss')],
  ['shortInput', createNode('my short explanation')],
  ['answerBox', createNode()],
  ['ansContent', createNode()],
  ['ansExplanation', createNode()],
  ['streakNum', createNode()],
]);

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
  setSize: 2,
  questionTypes: [
    { type: 'fill', label: 'Fill', short: 'F', shortLike: false },
    { type: 'short', label: 'Short', short: 'S', shortLike: true },
  ],
  storageKey: 'text_answer_drafts_test',
  legacyStorageKeys: [],
  milestoneMsgs: {},
  breakMsgs: ['break #BEST#'],
  streakMilestones: [],
  streakMilestoneEmoji: {},
};
window.QUIZ_QUESTIONS = [
  { id: 1, type: 'fill', q: 'fill', ansText: 'answer', exp: 'fill exp' },
  { id: 2, type: 'short', q: 'short', ansText: 'short answer', exp: 'short exp' },
];

const state = await import('../js/03-state.js?test=text-answer-drafts');
await import('../js/07-actions.js?test=text-answer-drafts');

const setData = {
  userAnswers: {},
  revealedIds: {},
  wrongBank: {},
  currentIdx: 0,
  fillFeedbackById: {},
  streak: 0,
  bestStreak: 0,
};
const ctx = {
  activeSetData() { return setData; },
  filteredQuestions() { return window.QUIZ_QUESTIONS; },
  saveData() {},
  renderQuestion() {},
};

state.rememberTextAnswerDraft(setData, 1, 'draft before check');
assert.equal(state.getTextAnswerDraft(setData, 1), 'draft before check', 'text drafts should be retrievable before checking');

window.Actions.checkAnswer(ctx);
assert.equal(setData.userAnswers[1], false, 'checked fill answers should keep correctness as a boolean');
assert.equal(state.getTextAnswerDraft(setData, 1), 'near miss', 'checked fill answers should preserve the submitted text draft');

setData.currentIdx = 1;
window.Actions.checkAnswer(ctx);
assert.equal(setData.userAnswers[2], 'submitted', 'checked short answers should keep submitted progress state');
assert.equal(state.getTextAnswerDraft(setData, 2), 'my short explanation', 'checked short answers should preserve the submitted text draft');

state.clearTextAnswerDraft(setData, 2);
assert.equal(state.getTextAnswerDraft(setData, 2), '', 'cleared text drafts should read as empty strings');

console.log('Text answer draft tests passed');
