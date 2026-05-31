// ===== 模块: state =====
// 职责: 封装状态初始化逻辑 + 快捷方法（类型判断、活跃数据获取）；实际状态变量暂由 HTML 内联脚本持有（let activeSet/filter/sets 等），后续批次逐步迁移到 QuizState 属性
// 依赖: 02-storage.js (window.Storage, window.SET_COUNT, window.questionTypes)
// 暴露: window.QuizState = { isAnswered, isShortLike, TYPE_ORDER, initSets }

(function () {
  var SET_COUNT = window.SET_COUNT;
  var questionTypes = window.questionTypes;

  // ═══ 题型排序常量 ═══
  var TYPE_ORDER = {};
  questionTypes.forEach(function (t, i) { TYPE_ORDER[t.type] = i; });

  // ═══ 简答类判断 ═══
  var SHORT_LIKE_TYPES = new Set(
    questionTypes.filter(function (t) { return t.shortLike; }).map(function (t) { return t.type; })
  );
  function isShortLike(t) { return SHORT_LIKE_TYPES.has(t); }

  // ═══ 判断题目是否已"做完" ═══
  // 需要传入 setData 和 question，因为 setData 由调用方持有
  function isAnswered(s, q) {
    var v = s.userAnswers[q.id];
    return v === true || v === false || v === 'submitted';
  }

  // ═══ 从 localStorage 初始化 sets 数组 ═══
  function initSets() {
    var data = window.Storage.loadData();
    var sets = data.sets || [];
    // 兼容旧数据：若 sets 少于配置套数则补齐
    while (sets.length < SET_COUNT) sets.push(window.Storage.defaultSetData());
    // 补充缺失字段
    sets.forEach(function (s) {
      if (!s.expandedTypes) s.expandedTypes = {};
      if (!s.stars) s.stars = {};
      if (!s.typeFilter) s.typeFilter = 'all';
      if (!s.wrongBank) s.wrongBank = {};
      if (!s.shortAnswerBank) s.shortAnswerBank = {};
      if (s.streak === undefined) s.streak = 0;
      if (s.bestStreak === undefined) s.bestStreak = 0;
    });
    return { data: data, sets: sets };
  }

  // ═══ 暴露 ═══
  window.QuizState = {
    TYPE_ORDER: TYPE_ORDER,
    isShortLike: isShortLike,
    isAnswered: isAnswered,
    initSets: initSets
  };
})();
