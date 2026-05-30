// ===== 模块: render =====
// 职责: DOM 渲染 —— 侧边栏题型导航、右侧进度面板、答案区展开、题型折叠切换
// 依赖: 01-utils ($, TYPE_LABELS, TYPE_CLASS), 02-storage (CONFIG, questionTypes, SET_COUNT, SET_SIZE), 03-state (QuizState)
// 暴露: window.Render = { sidebar, stats, answerBox, toggleTypeExpand, jumpToQ }
// 注意: renderQuestion 仍留在 HTML 内联（依赖 let 变量太多），后续批次逐步移入

(function () {
  var $ = window.$;
  var CONFIG = window.CONFIG;
  var questionTypes = window.questionTypes;
  var SET_COUNT = window.SET_COUNT;
  var SET_SIZE = window.SET_SIZE;
  var TYPE_LABELS = window.TYPE_LABELS;
  var isAnswered = window.QuizState.isAnswered;

  // ═══ 渲染侧边栏 ═══
  // ctx: { activeSetData, filter, getQuestionPool, filteredQuestions, saveData }
  function renderSidebar(ctx) {
    var s = ctx.activeSetData();
    var pool = ctx.getQuestionPool();
    // 应用错题/收藏筛选
    if (ctx.filter === 'wrong') pool = pool.filter(function (q) { return s.wrongBank[q.id]; });
    else if (ctx.filter === 'star') pool = pool.filter(function (q) { return s.stars[q.id]; });
    else if (ctx.filter === 'origin') pool = pool.filter(function (q) { return q.yq; });
    if (ctx.searchQuery) pool = pool.filter(function (q) { return window.Pool.matchesSearch(q, ctx.searchQuery); });
    var curQ = ctx.filteredQuestions()[s.currentIdx];
    var nav = $('moduleNav');
    var eid = 'qt_';
    var html = '';
    questionTypes.forEach(function (tt) {
      var qs = pool.filter(function (q) { return q.type === tt.type; });
      var done = qs.filter(function (q) { return s.userAnswers[q.id] !== undefined; });
      var active = s.typeFilter === tt.type ? ' active' : '';
      var isOpen = s.expandedTypes[tt.type] || s.typeFilter === tt.type;
      s.expandedTypes[tt.type] = isOpen;
      html += '<button class="module-btn' + active + (isOpen ? ' open' : '') + '" onclick="toggleTypeExpand(&apos;' + tt.type + '&apos;,this)"><span class="expand-arrow">▶</span>' + tt.short + ' <span class="type-q-count">' + done.length + '/' + qs.length + '</span></button>';
      html += '<div class="qnum-grid' + (isOpen ? ' open' : '') + '" id="' + eid + tt.type + '">';
      qs.forEach(function (q, qi) {
        var localNum = qi + 1;
        var cls = 'qnum-dot';
        if (s.userAnswers[q.id] === true) cls += ' done-right';
        else if (s.userAnswers[q.id] === false) cls += ' done-wrong';
        if (s.stars[q.id]) cls += ' starred';
        if (curQ && q.id === curQ.id) cls += ' current';
        html += '<div class="' + cls + '" data-qid="' + q.id + '" onclick="event.stopPropagation();jumpToQ(' + q.id + ')" title="第' + localNum + '题">' + localNum + '</div>';
      });
      html += '</div>';
    });
    nav.innerHTML = html;

    // 套题切换按钮
    document.querySelectorAll('.set-tab').forEach(function (btn, i) {
      btn.classList.toggle('active', i === ctx.activeSet);
      var sData = ctx.sets[i];
      var done = Object.keys(sData.userAnswers).length;
      btn.textContent = (CONFIG.setNames[i] || ('题组' + (i + 1))) + ' (' + done + '/' + SET_SIZE + ')';
    });

    // 筛选按钮状态
    $('filterAll').classList.toggle('active', ctx.filter === 'all');
    var fw = $('filterWrong');
    fw.classList.toggle('active', ctx.filter === 'wrong');
    if (ctx.filter === 'wrong') fw.classList.add('wrong-mode'); else fw.classList.remove('wrong-mode');
    $('filterStar').classList.toggle('active', ctx.filter === 'star');
    var fo = $('filterOrigin');
    fo.classList.toggle('active', ctx.filter === 'origin');
    if (ctx.filter === 'origin') fo.classList.add('origin-mode'); else fo.classList.remove('origin-mode');

    updateStats(ctx);
  }

  // ═══ 更新右侧进度面板 ═══
  function updateStats(ctx) {
    var s = ctx.activeSetData();
    var pool = ctx.getQuestionPool();
    var allDone = pool.filter(function (q) { return s.userAnswers[q.id] !== undefined; });
    var right = allDone.filter(function (q) { return s.userAnswers[q.id] === true; }).length;
    $('rpDone').textContent = allDone.length;
    $('rpAcc').textContent = allDone.length > 0 ? Math.round(right / allDone.length * 100) + '%' : '-';
    var gDone = Object.keys(ctx.sets[ctx.activeSet].userAnswers).length;
    $('rpGlobal').textContent = gDone;
    var gRight = Object.values(ctx.sets[ctx.activeSet].userAnswers).filter(function (v) { return v === true; }).length;
    $('rpGlobalPct').textContent = gDone > 0 ? '正确率 ' + Math.round(gRight / gDone * 100) + '%' : '-';
    var list = ctx.filteredQuestions();
    var fDone = list.filter(function (q) { return s.userAnswers[q.id] !== undefined; }).length;
    $('rpBarFill').style.width = list.length > 0 ? (fDone / list.length * 100) + '%' : '0%';
    $('rpLabel').textContent = fDone + ' / ' + list.length;
    var modHtml = '';
    questionTypes.forEach(function (tt) {
      var qs = pool.filter(function (q) { return q.type === tt.type; });
      var done = qs.filter(function (q) { return s.userAnswers[q.id] !== undefined; }).length;
      var pct = qs.length > 0 ? Math.round(done / qs.length * 100) : 0;
      modHtml += '<div class="m-row"><div class="m-name">' + tt.short + ' <span>' + done + '/' + qs.length + '</span></div><div class="m-bar"><div class="fill" style="width:' + pct + '%"></div></div></div>';
    });
    $('rpModules').innerHTML = modHtml;
    var ms = $('mobileStats'); if (ms) ms.textContent = gDone + '/' + SET_SIZE;
    var accPct = allDone.length > 0 ? Math.round(right / allDone.length * 100) + '%' : '-';
    var listPct = list.length > 0 ? Math.round(fDone / list.length * 100) + '%' : '0%';
    var mbDone = $('mbDone'); if (mbDone) mbDone.textContent = gDone;
    var mbAcc = $('mbAcc'); if (mbAcc) mbAcc.textContent = accPct;
    var mbProgress = $('mbProgress'); if (mbProgress) mbProgress.textContent = listPct;
    ctx.saveData();
  }

  // ═══ 题型折叠切换 ═══
  function toggleTypeExpand(ctx, type, btn) {
    var s = ctx.activeSetData();
    var grid = btn.nextElementSibling;
    var isOpen = !s.expandedTypes[type];
    s.expandedTypes[type] = isOpen;
    if (grid) {
      grid.classList.toggle('open', isOpen);
      btn.classList.toggle('open', isOpen);
    }
    ctx.saveData();
  }

  // ═══ 展示答案区 ═══
  function showAnswerBox(ctx, q) {
    ctx.activeSetData().revealedIds[q.id] = true;
    var ab = $('answerBox');
    ab.classList.add('show');
    function _set(el, s) { el[s.indexOf('<') !== -1 && s.indexOf('>') !== -1 ? 'innerHTML' : 'textContent'] = s; }
    if (q.type === 'single' || q.type === 'multi') {
      var letters = q.ans.map(function (i) { return String.fromCharCode(65 + i); });
      _set($('ansContent'), '正确答案：' + letters.join(' + ') + ' — ' + q.ans.map(function (i) { return q.opts[i].substring(3); }).join('；'));
    } else if (q.type === 'fill') {
      _set($('ansContent'), '参考答案：' + q.ansText.replace(/\|/g, '、'));
    } else {
      _set($('ansContent'), q.ansText);
    }
    _set($('ansExplanation'), q.exp ? '解析：' + q.exp : '');
    // 填空反馈也显示在答案区
    if (q.type === 'fill' && ctx.activeSetData()._fillFeedback) {
      var fb = ctx.activeSetData()._fillFeedback;
      $('ansContent').innerHTML += ' | 你的匹配：' + fb.map(function (h) { return (h.ok ? '✓' : '✗') + h.kw; }).join(' ');
    }
  }

  // ═══ 跳转到指定题号（保留当前筛选） ═══
  function jumpToQ(ctx, qid) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var idx = list.findIndex(function (x) { return x.id === qid; });
    if (idx >= 0) {
      s.currentIdx = idx;
      ctx.saveData();
      ctx.renderSidebar();
      ctx.renderQuestion();
      if (window.innerWidth <= 768) toggleMobileSidebar();
    }
  }

  // ═══ 暴露 ═══
  window.Render = {
    sidebar: renderSidebar,
    stats: updateStats,
    answerBox: showAnswerBox,
    toggleTypeExpand: toggleTypeExpand,
    jumpToQ: jumpToQ
  };
})();
