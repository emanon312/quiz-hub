#!/usr/bin/env node

import assert from 'node:assert/strict';

globalThis.window = globalThis;
window.QUIZ_CONFIG = {
  subjectName: 'Unit Subject',
  pageTitle: 'Unit Subject',
  storageKey: 'unit_subject_quiz_v1',
  setNames: ['A'],
  setSize: 2,
  questionTypes: [{ type: 'single', label: 'Single', short: '单选' }],
  legacyStorageKeys: [],
};
window.QUIZ_QUESTIONS = [
  { id: 1, type: 'single', q: 'Q1', opts: ['A. One'], ans: [0] },
  { id: 2, type: 'single', q: 'Q2', opts: ['A. One'], ans: [0] },
];

const tools = await import('../js/08-tools.js?test=learning-data');

const ctx = {
  activeSet: 0,
  filter: 'wrong',
  practiceSec: 75,
  sets: [
    {
      userAnswers: { 1: true },
      revealedIds: { 1: true },
      currentIdx: 1,
      typeFilter: 'all',
      stars: { 1: true },
      expandedTypes: {},
      wrongBank: {},
      shortAnswerBank: {},
      fillFeedbackById: {},
      streak: 2,
      bestStreak: 3,
    },
  ],
};

const exported = tools.createLearningDataExport(ctx, () => 123456);
assert.equal(exported.app, 'quiz-hub');
assert.equal(exported.version, 1);
assert.equal(exported.exportedAt, 123456);
assert.equal(exported.subject.storageKey, 'unit_subject_quiz_v1');
assert.equal(exported.data.practiceSec, 75);
assert.deepEqual(exported.data.sets[0].userAnswers, { 1: true });

const parsed = tools.parseLearningDataImport(JSON.stringify(exported));
assert.equal(parsed.subject.storageKey, 'unit_subject_quiz_v1');
assert.equal(parsed.data.filter, 'wrong');

assert.throws(
  () => tools.parseLearningDataImport(JSON.stringify({ app: 'quiz-hub', version: 1, subject: { storageKey: 'other' }, data: {} })),
  /storage key mismatch/,
);
assert.throws(() => tools.parseLearningDataImport('{broken'), /valid JSON/);

console.log('Learning data tools tests passed');
