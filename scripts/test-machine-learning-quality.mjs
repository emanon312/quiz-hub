#!/usr/bin/env node

import assert from 'node:assert/strict';

globalThis.window = globalThis;
await import('../subjects/machine-learning/machine-learning-config.js');
await import('../subjects/machine-learning/machine-learning-questions.js');
const storage = await import(`../js/02-storage.js?ml-quality=${Date.now()}`);

const config = globalThis.QUIZ_CONFIG;
const questions = globalThis.QUIZ_QUESTIONS;
assert.equal(questions.length, 160, 'Machine learning question count should stay at 160');
assert.deepEqual(
  config.setNames,
  [
    '机器学习概述与数据基础',
    '模型评估与泛化能力',
    '回归模型与逻辑回归',
    'SVM、神经网络与集成学习',
  ],
  'Machine learning set names should match the thematic grouping',
);

const expectedModulesBySet = [
  new Set(['机器学习概述', '数据基础', '实验与综合应用']),
  new Set(['模型评估与选择', '实验与综合应用']),
  new Set(['回归模型', '逻辑回归', '实验与综合应用']),
  new Set(['支持向量机', '神经网络', '集成学习', '实验与综合应用']),
];

const seenIds = new Set();
const seenStems = new Set();
const moduleCounts = new Map();
const bannedTopicFragments = ['AdaBoost', 'KKT', '局部加权', '强化学习', '关联规则', '人工智能和深度学习'];

for (const q of questions) {
  assert.ok(!seenIds.has(q.id), `Duplicate question id: ${q.id}`);
  seenIds.add(q.id);

  const stem = q.q.trim();
  assert.ok(!seenStems.has(stem), `Duplicate question stem: ${stem}`);
  seenStems.add(stem);
  assert.ok(
    bannedTopicFragments.every((fragment) => !stem.includes(fragment)),
    `Question ${q.id} should avoid de-emphasized topic fragments`,
  );

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

for (let setIndex = 0; setIndex < expectedModulesBySet.length; setIndex += 1) {
  const block = (storage.SETS[setIndex] || []).map((questionIndex) => questions[questionIndex]);
  const allowedModules = expectedModulesBySet[setIndex];
  assert.equal(block.length, 40, `Set ${setIndex + 1} should contain exactly 40 questions`);

  for (const q of block) {
    assert.ok(
      allowedModules.has(q.m),
      `Question ${q.id} in set ${setIndex + 1} should stay within the expected thematic modules`,
    );
    if (q.ansText) {
      assert.ok(
        bannedTopicFragments.every((fragment) => !q.ansText.includes(fragment)),
        `Question ${q.id} answer text should avoid de-emphasized topic fragments`,
      );
    }
    if (q.exp) {
      assert.ok(
        bannedTopicFragments.every((fragment) => !q.exp.includes(fragment)),
        `Question ${q.id} explanation should avoid de-emphasized topic fragments`,
      );
    }
  }
}

for (const moduleName of [
  '机器学习概述',
  '数据基础',
  '模型评估与选择',
  '回归模型',
  '逻辑回归',
  '支持向量机',
  '神经网络',
  '集成学习',
]) {
  assert.ok(moduleCounts.has(moduleName), `Required module "${moduleName}" should exist`);
}

console.log('Machine learning question quality tests passed');
