#!/usr/bin/env node

import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SUBJECTS } from '../subjects/subjects.js';

const projectRootUrl = new URL('../', import.meta.url);

function extractLocalImageRefs(html) {
  if (typeof html !== 'string' || !html.includes('<img')) return [];
  const refs = [];
  const re = /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi;
  let match;
  while ((match = re.exec(html))) {
    const src = match[2].trim();
    if (!src || /^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) continue;
    refs.push(src);
  }
  return refs;
}

async function fileExists(url) {
  try {
    await access(fileURLToPath(url));
    return true;
  } catch {
    return false;
  }
}

async function validateSubjectData(subject, config, questions) {
  const issues = [];
  const prefix = `[${subject.slug}]`;

  if (!config || typeof config !== 'object') {
    return [`${prefix} 配置不存在或格式错误`];
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    issues.push(`${prefix} 题库为空或不是数组`);
    return issues;
  }

  const questionTypes = Array.isArray(config.questionTypes) ? config.questionTypes : [];
  const validTypes = new Set(questionTypes.map((t) => t.type));
  const shortLikeTypes = new Set(questionTypes.filter((t) => t.shortLike).map((t) => t.type));
  const setSizes = Array.isArray(config.setSizes) && config.setSizes.length === config.setNames?.length
    ? config.setSizes
    : Array.from({ length: config.setNames?.length || 0 }, () => config.setSize || 0);
  const needed = setSizes.reduce((sum, n) => sum + n, 0);
  if (needed > questions.length) {
    issues.push(`${prefix} 题数 ${questions.length} 少于配置需要 ${needed}`);
  }
  if (subject.questionCount != null && subject.questionCount !== questions.length) {
    issues.push(`${prefix} 学科清单 questionCount=${subject.questionCount} 与实际题数 ${questions.length} 不一致`);
  }
  if (subject.setCount != null && subject.setCount !== (config.setNames?.length || 0)) {
    issues.push(`${prefix} 学科清单 setCount=${subject.setCount} 与实际套题数 ${config.setNames?.length || 0} 不一致`);
  }

  const seenIds = new Set();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const label = q && q.id != null ? `id=${q.id}` : `#${i}`;
    if (!q || typeof q !== 'object') {
      issues.push(`${prefix} ${label} 不是对象`);
      continue;
    }
    if (q.id == null) issues.push(`${prefix} #${i} 缺少 id`);
    else if (seenIds.has(q.id)) issues.push(`${prefix} id=${q.id} 重复`);
    else seenIds.add(q.id);

    if (!validTypes.has(q.type)) issues.push(`${prefix} ${label} 未声明题型 ${q.type}`);
    if (!q.q) issues.push(`${prefix} ${label} 缺少题干`);

    if (q.type === 'single' || q.type === 'multi') {
      if (!Array.isArray(q.opts) || q.opts.length === 0) {
        issues.push(`${prefix} ${label} 选择题缺少 opts`);
      }
      if (!Array.isArray(q.ans) || q.ans.length === 0) {
        issues.push(`${prefix} ${label} 选择题缺少 ans`);
      } else {
        const optsLength = Array.isArray(q.opts) ? q.opts.length : 0;
        if (q.ans.some((answerIndex) => answerIndex < 0 || answerIndex >= optsLength)) {
          issues.push(`${prefix} ${label} ans 越界`);
        }
        if (q.type === 'single' && q.ans.length !== 1) {
          issues.push(`${prefix} ${label} 单选 ans 应为单值`);
        }
      }
    } else if (q.type === 'fill' || shortLikeTypes.has(q.type)) {
      if (!q.ansText) issues.push(`${prefix} ${label} 缺少 ansText`);
    }

    const imageRefs = [
      ...extractLocalImageRefs(q.q),
      ...extractLocalImageRefs(q.exp),
      ...extractLocalImageRefs(q.ansText),
    ];
    for (const ref of imageRefs) {
      const imageUrl = new URL(ref, subject.rootDir);
      if (!(await fileExists(imageUrl))) {
        issues.push(`${prefix} ${label} 图片不存在 ${ref}`);
      }
    }
  }

  return issues;
}

async function importFresh(url) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set('validate', String(Date.now()) + Math.random().toString(16).slice(2));
  return import(nextUrl.href);
}

async function loadSubject(subject) {
  delete globalThis.QUIZ_CONFIG;
  delete globalThis.QUIZ_QUESTIONS;
  globalThis.window = globalThis;

  await importFresh(new URL(subject.config, projectRootUrl));
  const config = globalThis.QUIZ_CONFIG;
  await importFresh(new URL(subject.questions, projectRootUrl));
  const questions = globalThis.QUIZ_QUESTIONS;

  return {
    subject: {
      ...subject,
      rootDir: new URL(subject.dir.replace(/\/?$/, '/'), projectRootUrl),
    },
    config,
    questions,
  };
}

async function runValidation() {
  const allIssues = [];
  for (const entry of SUBJECTS) {
    const loaded = await loadSubject(entry);
    const issues = await validateSubjectData(loaded.subject, loaded.config, loaded.questions);
    if (issues.length === 0) {
      console.log(`✓ ${entry.name}: ${loaded.questions.length} 题`);
    } else {
      console.log(`✗ ${entry.name}: ${issues.length} 个问题`);
      allIssues.push(...issues);
    }
  }

  if (allIssues.length > 0) {
    console.error('\n题库校验失败：');
    for (const issue of allIssues) console.error('- ' + issue);
    process.exitCode = 1;
    return;
  }
  console.log('\nQuiz data validation passed');
}

async function runSelfTest() {
  const subject = {
    slug: 'fixture',
    name: 'Fixture',
    rootDir: new URL('../subjects/fixture/', import.meta.url),
  };
  const config = {
    setNames: ['A'],
    setSize: 1,
    questionTypes: [
      { type: 'single', shortLike: false },
      { type: 'fill', shortLike: false },
    ],
  };
  const questions = [
    {
      id: 1,
      type: 'single',
      q: '<img src="images/missing.png">',
      opts: ['A. One'],
      ans: [3],
    },
  ];

  const issues = await validateSubjectData(subject, config, questions);
  const text = issues.join('\n');
  if (!text.includes('ans 越界') || !text.includes('图片不存在')) {
    throw new Error('Self-test did not detect expected invalid answer and missing image issues');
  }
  console.log('Self-test passed');
}

async function main() {
  if (process.argv.includes('--self-test')) {
    await runSelfTest();
    return;
  }
  await runValidation();
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
