// ===== 模块: state =====
// 职责: 封装状态初始化逻辑 + 快捷方法（类型判断、活跃数据获取）；实际状态变量暂由 HTML 内联脚本持有（let activeSet/filter/sets 等），后续批次逐步迁移到 QuizState 属性
// 依赖: 02-storage.js (Storage, SET_COUNT, questionTypes)
// 暴露: window.QuizState = { isAnswered, isShortLike, countAnswered, fill feedback helpers, TYPE_ORDER, initSets }

import { SET_COUNT, questionTypes, Storage } from './02-storage.js';

// ═══ 题型排序常量 ═══
export const TYPE_ORDER = {};
questionTypes.forEach((t, i) => { TYPE_ORDER[t.type] = i; });

// ═══ 简答类判断 ═══
const SHORT_LIKE_TYPES = new Set(
  questionTypes.filter(t => t.shortLike).map(t => t.type)
);
export function isShortLike(t) { return SHORT_LIKE_TYPES.has(t); }

// ═══ 判断题目是否已"做完" ═══
// 需要传入 setData 和 question，因为 setData 由调用方持有
export function isAnswered(s, q) {
  const v = s.userAnswers[q.id];
  return v === true || v === false || v === 'submitted';
}

export function countAnswered(s, qs) {
  return qs.filter(q => isAnswered(s, q)).length;
}

export function setFillFeedback(s, qid, feedback) {
  if (!s.fillFeedbackById) s.fillFeedbackById = {};
  s.fillFeedbackById[qid] = feedback;
  delete s._fillFeedback;
}

export function getFillFeedback(s, qid) {
  if (s.fillFeedbackById && s.fillFeedbackById[qid]) return s.fillFeedbackById[qid];
  return null;
}

export function clearFillFeedback(s, qid) {
  if (s.fillFeedbackById) delete s.fillFeedbackById[qid];
  if (s._fillFeedback) delete s._fillFeedback;
}

export function getChoiceSelection(s, qid) {
  const current = s.userAnswers && s.userAnswers[qid];
  if (Array.isArray(current)) return current;
  const checked = s.choiceSelections && s.choiceSelections[qid];
  return Array.isArray(checked) ? checked : [];
}

export function rememberChoiceSelection(s, qid, selected) {
  if (!s.choiceSelections) s.choiceSelections = {};
  s.choiceSelections[qid] = Array.isArray(selected) ? selected.slice() : [];
}

export function clearChoiceSelection(s, qid) {
  if (s.choiceSelections) delete s.choiceSelections[qid];
}

// ═══ 从 localStorage 初始化 sets 数组 ═══
export function initSets() {
  const data = Storage.loadData();
  const sets = data.sets || [];
  // 兼容旧数据：若 sets 少于配置套数则补齐
  while (sets.length < SET_COUNT) sets.push(Storage.defaultSetData());
  // 补充缺失字段
  sets.forEach(s => {
    if (!s.expandedTypes) s.expandedTypes = {};
    if (!s.stars) s.stars = {};
    if (!s.typeFilter) s.typeFilter = 'all';
    if (!s.wrongBank) s.wrongBank = {};
    if (!s.shortAnswerBank) s.shortAnswerBank = {};
    if (!s.fillFeedbackById) s.fillFeedbackById = {};
    if (!s.choiceSelections) s.choiceSelections = {};
    if (typeof s.streak !== 'number' || s.streak < 0) s.streak = 0;
    if (typeof s.bestStreak !== 'number' || s.bestStreak < 0) s.bestStreak = 0;
  });
  return { data, sets };
}

// ═══ 暴露 ═══
window.QuizState = {
  TYPE_ORDER,
  isShortLike,
  isAnswered,
  countAnswered,
  setFillFeedback,
  getFillFeedback,
  clearFillFeedback,
  getChoiceSelection,
  rememberChoiceSelection,
  clearChoiceSelection,
  initSets
};
