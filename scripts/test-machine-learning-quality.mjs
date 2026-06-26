#!/usr/bin/env node

import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../subjects/machine-learning/machine-learning-questions.js');

const questions = globalThis.QUIZ_QUESTIONS;
assert.equal(questions.length, 160, 'Machine learning question count should stay at 160');

const seenIds = new Set();
const seenStems = new Set();
const moduleCounts = new Map();

for (const q of questions) {
  assert.ok(!seenIds.has(q.id), `Duplicate question id: ${q.id}`);
  seenIds.add(q.id);

  const stem = q.q.trim();
  assert.ok(!seenStems.has(stem), `Duplicate question stem: ${stem}`);
  seenStems.add(stem);

  moduleCounts.set(q.m, (moduleCounts.get(q.m) || 0) + 1);

  if (q.type === 'single' || q.type === 'multi') {
    assert.equal(new Set(q.opts).size, q.opts.length, `Duplicate options in question ${q.id}`);
    assert.equal(new Set(q.ans).size, q.ans.length, `Duplicate answer indexes in question ${q.id}`);
    assert.deepEqual([...q.ans].sort((a, b) => a - b), q.ans, `Answer indexes should be sorted in question ${q.id}`);
    assert.ok(q.ans.every((idx) => idx >= 0 && idx < q.opts.length), `Answer index out of range in question ${q.id}`);
  }

  if (q.type === 'multi') {
    assert.ok(q.ans.length < q.opts.length, `Multi-choice question ${q.id} should not select every option`);
    assert.ok(q.ans.length >= 2, `Multi-choice question ${q.id} should have at least two correct options`);
  }
}

for (const [moduleName, count] of moduleCounts) {
  assert.ok(count >= 14, `Module "${moduleName}" has too few questions: ${count}`);
}

console.log('Machine learning question quality tests passed');
