#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  pickContinueSubject,
  summarizeAllSubjects,
  summarizeSubjectProgress,
} from '../js/home-progress.js';

const subject = {
  slug: 'machine-learning',
  name: '机器学习',
  storageKey: 'machine_learning_quiz_v1',
  questionCount: 160,
  setNames: ['练习1', '练习2', '练习3', '练习4'],
  setSizes: [40, 40, 40, 40],
  homeHref: 'subjects/machine-learning/machine-learning.html',
};

function testCountsOnlyCompletedAnswers() {
  const raw = JSON.stringify({
    activeSet: 1,
    practiceSec: 125,
    updatedAt: 99,
    sets: [
      { currentIdx: 4, userAnswers: { 1: true, 2: false, 3: [1], 4: 'submitted' } },
      { currentIdx: 8, userAnswers: { 41: true, 42: [0], 43: 'draft' } },
    ],
  });

  const summary = summarizeSubjectProgress(subject, raw);

  assert.equal(summary.doneCount, 4);
  assert.equal(summary.totalCount, 160);
  assert.equal(summary.percent, 3);
  assert.equal(summary.activeSetIndex, 1);
  assert.equal(summary.activeSetName, '练习2');
  assert.equal(summary.activeSetDone, 1);
  assert.equal(summary.activeSetTotal, 40);
  assert.equal(summary.currentQuestion, 9);
  assert.equal(summary.practiceLabel, '02:05');
  assert.equal(summary.hasProgress, true);
  assert.equal(summary.updatedAt, 99);
}

function testBrokenStorageIsSafe() {
  const summary = summarizeSubjectProgress(subject, '{broken');

  assert.equal(summary.doneCount, 0);
  assert.equal(summary.percent, 0);
  assert.equal(summary.hasProgress, false);
  assert.equal(summary.activeSetName, '练习1');
  assert.equal(summary.currentQuestion, 1);
}

function testPicksMostRecentProgress() {
  const subjects = [
    { ...subject, slug: 'a', name: 'A', storageKey: 'a' },
    { ...subject, slug: 'b', name: 'B', storageKey: 'b' },
  ];
  const summaries = summarizeAllSubjects(subjects, {
    getItem(key) {
      if (key === 'a') return JSON.stringify({ updatedAt: 10, sets: [{ currentIdx: 0, userAnswers: { 1: true } }] });
      if (key === 'b') return JSON.stringify({ updatedAt: 20, sets: [{ currentIdx: 0, userAnswers: { 1: true } }] });
      return null;
    },
  });

  assert.equal(pickContinueSubject(summaries).slug, 'b');
}

testCountsOnlyCompletedAnswers();
testBrokenStorageIsSafe();
testPicksMostRecentProgress();

console.log('Home progress tests passed');
