// ===== 模块: pool =====
// 职责: 题目池获取与筛选 —— 按套题索引构建题池、按题型/错题/收藏/搜索/乱序过滤
// 依赖: 02-storage (window.SETS, window.questions), 03-state (window.QuizState.TYPE_ORDER)
// 暴露: window.Pool = { getQuestionPool, filteredQuestions }

(function () {
  var SETS = window.SETS;
  var questions = window.questions;
  var TYPE_ORDER = window.QuizState.TYPE_ORDER;

  // ═══ 获取当前套题的全部题目（按题型排序） ═══
  function getQuestionPool(activeSet) {
    var indices = SETS[activeSet] || [];
    return indices.map(function (i) { return questions[i]; })
      .filter(Boolean)
      .sort(function (a, b) { return (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0); });
  }

  // ═══ 应用筛选 + 乱序 ═══
  // 参数: activeSet(int), filter(str), randomMode(bool), activeSetData(fn→setData)
  function filteredQuestions(activeSet, filter, randomMode, activeSetData) {
    var s = activeSetData ? activeSetData() : { typeFilter: 'all', wrongBank: {}, stars: {} };
    var pool = getQuestionPool(activeSet);

    // 题型筛选
    if (s.typeFilter !== 'all') pool = pool.filter(function (q) { return q.type === s.typeFilter; });

    // 错题 / 收藏筛选
    if (filter === 'wrong') pool = pool.filter(function (q) { return s.wrongBank[q.id]; });
    if (filter === 'star') pool = pool.filter(function (q) { return s.stars[q.id]; });

    // 乱序模式
    if (randomMode && pool.length > 1) {
      var curQ = pool[s.currentIdx];
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      var newIdx = curQ ? pool.findIndex(function (q) { return q.id === curQ.id; }) : 0;
      s.currentIdx = Math.max(0, newIdx);
    }
    return pool;
  }

  // ═══ 暴露 ═══
  window.Pool = {
    getQuestionPool: getQuestionPool,
    filteredQuestions: filteredQuestions
  };
})();
