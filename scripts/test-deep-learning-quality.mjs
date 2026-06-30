#!/usr/bin/env node

import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SUBJECTS } from '../subjects/subjects.js';

const expectedTypes = {
  single: 12,
  fill: 18,
  short: 58,
  compre: 24,
  draw: 8,
};

const subject = SUBJECTS.find((entry) => entry.slug === 'deep-learning');
assert.ok(subject, 'Deep learning subject should be registered');
assert.equal(subject.name, '深度学习');
assert.equal(subject.icon, 'deepLearning');
assert.equal(subject.storageKey, 'deep_learning_quiz_v1');
assert.equal(subject.questionCount, 120);
assert.equal(subject.setCount, 4);
assert.deepEqual(subject.setNames, ['神经网络基础', 'CNN与深度学习', 'RNN与循环结构', '注意力与Transformer']);

globalThis.window = globalThis;
await import('../subjects/deep-learning/deep-learning-config.js');
await import('../subjects/deep-learning/deep-learning-questions.js');

const config = globalThis.QUIZ_CONFIG;
const questions = globalThis.QUIZ_QUESTIONS;

assert.equal(config.subjectName, '深度学习');
assert.equal(config.storageKey, 'deep_learning_quiz_v1');
assert.equal(config.setSize, 30);
assert.deepEqual(config.setNames, subject.setNames);

const typeDefs = new Map(config.questionTypes.map((type) => [type.type, type]));
for (const type of ['short', 'compre', 'draw']) {
  assert.equal(typeDefs.get(type)?.shortLike, true, `${type} should be configured as short-like`);
}

assert.equal(questions.length, 120, 'Deep learning question count should be 120');

const typeCounts = {};
const seenIds = new Set();
const seenStems = new Set();
const moduleCounts = new Map();
const imageRefs = [];

for (const q of questions) {
  assert.ok(!seenIds.has(q.id), `Duplicate question id: ${q.id}`);
  seenIds.add(q.id);

  const stem = q.q.trim();
  assert.ok(!seenStems.has(stem), `Duplicate question stem: ${stem}`);
  seenStems.add(stem);

  typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
  moduleCounts.set(q.m, (moduleCounts.get(q.m) || 0) + 1);

  if (q.type === 'single') {
    assert.equal(q.opts.length, 4, `Single-choice question ${q.id} should have 4 options`);
    assert.equal(q.ans.length, 1, `Single-choice question ${q.id} should have one answer`);
  } else if (q.type === 'fill') {
    assert.ok(q.ansText, `Fill question ${q.id} should have ansText`);
  } else {
    assert.ok(q.ansText, `Subjective question ${q.id} should have ansText`);
    assert.ok(q.ansText.length >= 35, `Subjective answer ${q.id} should be useful for exam review`);
  }

  const htmlFields = [q.q, q.exp, q.ansText].filter(Boolean);
  for (const field of htmlFields) {
    const re = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi;
    let match;
    while ((match = re.exec(field))) imageRefs.push({ qid: q.id, src: match[2] });
  }
}

assert.deepEqual(typeCounts, expectedTypes);
assert.deepEqual([...moduleCounts.keys()], ['神经网络基础', 'CNN与深度学习', 'RNN与循环结构', '注意力与Transformer']);
for (const [moduleName, count] of moduleCounts) {
  assert.equal(count, 30, `${moduleName} should have 30 questions`);
}
assert.ok(imageRefs.length >= 8, 'Deep learning should include at least 8 key course images');

for (const ref of imageRefs) {
  const imageUrl = new URL(ref.src, new URL('../subjects/deep-learning/', import.meta.url));
  await access(fileURLToPath(imageUrl), 0).catch(() => {
    throw new Error(`Question ${ref.qid} references missing image ${ref.src}`);
  });
}

console.log('Deep learning question quality tests passed');
