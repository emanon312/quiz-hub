// ===== 模块: storage =====
// 职责: 配置桥接（CONFIG/questionTypes/questions 等常量）、题库 schema 校验、套题索引构建、localStorage 数据加载（含多版本迁移）
// 依赖: config.js (window.QUIZ_CONFIG), questions.js (window.QUIZ_QUESTIONS)
// 暴露: window.CONFIG / window.questionTypes / window.questions / window.SET_COUNT
//       window.SETS / window.STORAGE_KEY / window.MILESTONE_MSGS 等配置常量
//       window.Storage = { defaultSetData, loadData }
// 注意: saveData 暂留在 HTML 内联脚本，批次 3（state 模块）建立 QuizState 后移入本模块

// ═══ 配置桥接 ═══
window.CONFIG = window.QUIZ_CONFIG;
window.questionTypes = window.QUIZ_CONFIG.questionTypes;
window.questions = window.QUIZ_QUESTIONS;
window.MILESTONE_MSGS = window.QUIZ_CONFIG.milestoneMsgs;
window.BREAK_MSGS = window.QUIZ_CONFIG.breakMsgs;
window.STREAK_MILESTONES = window.QUIZ_CONFIG.streakMilestones;
window.STREAK_MILESTONE_EMOJI = window.QUIZ_CONFIG.streakMilestoneEmoji;
window.SET_COUNT = window.QUIZ_CONFIG.setNames.length;
// 每套题数：优先用 config.setSizes（适配每卷题数不同的真卷，如 A卷37/B卷35），
// 缺省则按 setSize 等分。长度须与 setNames 一致才生效
window.SET_SIZES = (function () {
  var cfg = window.QUIZ_CONFIG;
  var n = cfg.setNames.length;
  if (Array.isArray(cfg.setSizes) && cfg.setSizes.length === n) return cfg.setSizes.slice();
  var out = [];
  for (var i = 0; i < n; i++) out.push(cfg.setSize);
  return out;
})();

// ═══ localStorage key ═══
window.STORAGE_KEY = window.QUIZ_CONFIG.storageKey;

// ═══ 套题索引 ═══
// 按 SET_SIZES 累积偏移切分：第 i 套占题库中连续的 SET_SIZES[i] 道题，存储 index 引用
window.SETS = (function () {
  var sizes = window.SET_SIZES;
  var result = [];
  var offset = 0;
  for (var i = 0; i < sizes.length; i++) {
    var indices = [];
    for (var k = 0; k < sizes[i]; k++) indices.push(offset + k);
    result.push(indices);
    offset += sizes[i];
  }
  return result;
})();

// ═══ 题库 schema 校验 ═══
(function validateQuestions() {
  var qs = window.questions;
  var types = window.questionTypes;
  if (!Array.isArray(qs) || qs.length === 0) {
    console.error('[题库校验] questions 数组为空或类型错误');
    return;
  }
  var validTypes = new Set(types.map(function (t) { return t.type; }));
  var seenIds = new Set();
  var issues = [];
  qs.forEach(function (q, idx) {
    if (!q || typeof q !== 'object') { issues.push('#' + idx + ' 非对象'); return; }
    if (q.id == null) issues.push('#' + idx + ' 缺少 id');
    else if (seenIds.has(q.id)) issues.push('id=' + q.id + ' 重复');
    else seenIds.add(q.id);
    if (!validTypes.has(q.type)) issues.push('id=' + q.id + ' 未知题型 ' + q.type);
    if (!q.q) issues.push('id=' + q.id + ' 缺少题干');
    if (q.type === 'single' || q.type === 'multi') {
      if (!Array.isArray(q.opts) || q.opts.length === 0) issues.push('id=' + q.id + ' 选择题缺少 opts');
      if (!Array.isArray(q.ans) || q.ans.length === 0) issues.push('id=' + q.id + ' 选择题缺少 ans');
      else if (q.ans.some(function (i) { return i < 0 || i >= (q.opts || []).length; })) issues.push('id=' + q.id + ' ans 越界');
      if (q.type === 'single' && Array.isArray(q.ans) && q.ans.length !== 1) issues.push('id=' + q.id + ' 单选 ans 应为单值');
    } else if (q.type === 'fill') {
      if (!q.ansText) issues.push('id=' + q.id + ' 填空题缺少 ansText');
    } else if (q.type === 'short' || q.type === 'draw' || q.type === 'compre') {
      if (!q.ansText) issues.push('id=' + q.id + ' 简答类缺少 ansText');
    }
  });
  if (issues.length) console.error('[题库校验] ' + issues.length + ' 条问题:\n' + issues.join('\n'));
  var needed = window.SET_SIZES.reduce(function (a, b) { return a + b; }, 0);
  if (qs.length < needed) {
    console.warn('[题库校验] 题数 ' + qs.length + ' 少于各套题数之和 ' + needed + '（' + window.SET_SIZES.join('+') + '）');
  }
})();

// ═══ 套题数据默认值 ═══
function defaultSetData() {
  return {
    userAnswers: {}, revealedIds: {}, currentIdx: 0, typeFilter: 'all',
    stars: {}, expandedTypes: {}, wrongBank: {}, shortAnswerBank: {},
    streak: 0, bestStreak: 0
  };
}

// ═══ 数据加载（含多版本迁移） ═══
function loadData() {
  var STORAGE_KEY = window.STORAGE_KEY;
  var SET_COUNT = window.SET_COUNT;
  var legacyKeys = window.QUIZ_CONFIG.legacyStorageKeys || [];
  var candidates = [];

  function tryParse(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) candidates.push({ key: key, data: JSON.parse(raw) });
    } catch (e) { console.error('[loadData] 解析失败', key, e); }
  }
  tryParse(STORAGE_KEY);
  for (var i = 0; i < legacyKeys.length; i++) tryParse(legacyKeys[i]);

  if (candidates.length === 0) {
    return { activeSet: 0, filter: 'all', sets: Array.from({ length: SET_COUNT }, defaultSetData) };
  }

  function countAnswered(d) {
    if (!d || !Array.isArray(d.sets)) return 0;
    return d.sets.reduce(function (sum, s) {
      return sum + (s && s.userAnswers ? Object.keys(s.userAnswers).length : 0);
    }, 0);
  }
  candidates.sort(function (a, b) { return countAnswered(b.data) - countAnswered(a.data); });
  var best = candidates[0];
  if (best.key !== STORAGE_KEY) {
    console.info('[迁移] 从', best.key, '加载数据（已答', countAnswered(best.data), '题）到', STORAGE_KEY);
  }
  return best.data;
}

// ═══ 暴露 ═══
window.Storage = {
  defaultSetData: defaultSetData,
  loadData: loadData
};
