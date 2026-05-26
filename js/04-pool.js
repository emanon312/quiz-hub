// ===== 模块: pool =====
// 职责: 题目池获取与筛选 —— 按套题索引构建题池、按题型/错题/收藏/搜索/乱序过滤
// 依赖: 02-storage (window.SETS, window.questions), 03-state (window.QuizState.TYPE_ORDER)
// 暴露: window.Pool = { getQuestionPool, filteredQuestions, invalidateShuffle, matchesSearch }

(function () {
  var SETS = window.SETS;
  var questions = window.questions;
  var TYPE_ORDER = window.QuizState.TYPE_ORDER;

  var shuffleCache = { key: '', order: null };

  function buildFilterKey(activeSet, filter, typeFilter, searchQuery) {
    return activeSet + '|' + filter + '|' + typeFilter + '|' + (searchQuery || '');
  }

  function shuffleIds(ids) {
    var order = ids.slice();
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
    }
    return order;
  }

  function matchesSearch(q, searchQuery) {
    if (!searchQuery) return true;
    var qLower = searchQuery.toLowerCase();
    if (q.q.toLowerCase().indexOf(qLower) !== -1) return true;
    if (q.opts && q.opts.some(function (o) { return o.toLowerCase().indexOf(qLower) !== -1; })) return true;
    return false;
  }

  // ═══ 获取当前套题的全部题目（按题型排序） ═══
  function getQuestionPool(activeSet) {
    var indices = SETS[activeSet] || [];
    return indices.map(function (i) { return questions[i]; })
      .filter(Boolean)
      .sort(function (a, b) { return (TYPE_ORDER[a.type] || 0) - (TYPE_ORDER[b.type] || 0); });
  }

  // ═══ 应用筛选 + 乱序（乱序结果缓存，避免每次 render 重洗） ═══
  // 参数: activeSet, filter, randomMode, activeSetData(fn), searchQuery
  function filteredQuestions(activeSet, filter, randomMode, activeSetData, searchQuery) {
    var s = activeSetData ? activeSetData() : { typeFilter: 'all', wrongBank: {}, stars: {} };
    var pool = getQuestionPool(activeSet);

    if (s.typeFilter !== 'all') pool = pool.filter(function (q) { return q.type === s.typeFilter; });
    if (filter === 'wrong') pool = pool.filter(function (q) { return s.wrongBank[q.id]; });
    if (filter === 'star') pool = pool.filter(function (q) { return s.stars[q.id]; });
    if (filter === 'origin') pool = pool.filter(function (q) { return q.yq; });
    if (searchQuery) pool = pool.filter(function (q) { return matchesSearch(q, searchQuery); });

    if (randomMode && pool.length > 1) {
      var key = buildFilterKey(activeSet, filter, s.typeFilter, searchQuery);
      if (shuffleCache.key !== key || !shuffleCache.order) {
        shuffleCache.key = key;
        shuffleCache.order = shuffleIds(pool.map(function (q) { return q.id; }));
      }
      var rank = {};
      shuffleCache.order.forEach(function (id, i) { rank[id] = i; });
      pool = pool.slice().sort(function (a, b) {
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

  window.Pool = {
    getQuestionPool: getQuestionPool,
    filteredQuestions: filteredQuestions,
    invalidateShuffle: invalidateShuffle,
    matchesSearch: matchesSearch
  };
})();
