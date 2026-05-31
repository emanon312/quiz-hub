// ===== 模块: pool =====
// 职责: 题目池获取与筛选 —— 按套题索引构建题池、按题型/错题/收藏/搜索/乱序过滤
// 依赖: 02-storage (SETS, questions), 03-state (window.QuizState.TYPE_ORDER)
// 暴露: window.Pool = { getQuestionPool, filteredQuestions, invalidateShuffle, matchesSearch }

import { SETS, questions } from './02-storage.js';

const TYPE_ORDER = window.QuizState.TYPE_ORDER;

const shuffleCache = { key: '', order: null };

function buildFilterKey(activeSet, filter, typeFilter, searchQuery) {
  return activeSet + '|' + filter + '|' + typeFilter + '|' + (searchQuery || '');
}

function shuffleIds(ids) {
  const order = ids.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  return order;
}

function matchesSearch(q, searchQuery) {
  if (!searchQuery) return true;
  const qLower = searchQuery.toLowerCase();
  if (q.q.toLowerCase().indexOf(qLower) !== -1) return true;
  if (q.opts && q.opts.some(o => o.toLowerCase().indexOf(qLower) !== -1)) return true;
  return false;
}

// ═══ 获取当前套题的全部题目（按题型排序） ═══
function getQuestionPool(activeSet) {
  const indices = SETS[activeSet] || [];
  return indices.map(i => questions[i])
    .filter(Boolean)
    .sort((a, b) => (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0));
}

// ═══ 应用筛选 + 乱序（乱序结果缓存，避免每次 render 重洗） ═══
// 参数: activeSet, filter, randomMode, activeSetData(fn), searchQuery
function filteredQuestions(activeSet, filter, randomMode, activeSetData, searchQuery) {
  const s = activeSetData ? activeSetData() : { typeFilter: 'all', wrongBank: {}, stars: {} };
  let pool = getQuestionPool(activeSet);

  if (s.typeFilter !== 'all') pool = pool.filter(q => q.type === s.typeFilter);
  if (filter === 'wrong') pool = pool.filter(q => s.wrongBank[q.id]);
  if (filter === 'star') pool = pool.filter(q => s.stars[q.id]);
  if (filter === 'origin') pool = pool.filter(q => q.yq);
  if (searchQuery) pool = pool.filter(q => matchesSearch(q, searchQuery));

  if (randomMode && pool.length > 1) {
    const key = buildFilterKey(activeSet, filter, s.typeFilter, searchQuery);
    if (shuffleCache.key !== key || !shuffleCache.order) {
      shuffleCache.key = key;
      shuffleCache.order = shuffleIds(pool.map(q => q.id));
    }
    const rank = {};
    shuffleCache.order.forEach((id, i) => { rank[id] = i; });
    pool = pool.slice().sort((a, b) => {
      return (rank[a.id] !== undefined ? rank[a.id] : 9999) - (rank[b.id] !== undefined ? rank[b.id] : 9999);
    });
  } else if (!randomMode) {
    shuffleCache.key = '';
    shuffleCache.order = null;
  }

  return pool;
}

function invalidateShuffle() {
  shuffleCache.key = '';
  shuffleCache.order = null;
}

// ═══ 暴露 ═══
window.Pool = {
  getQuestionPool,
  filteredQuestions,
  invalidateShuffle,
  matchesSearch
};
