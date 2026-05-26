// ===== 模块: actions =====
// 职责: 用户答题操作 —— 判题 / 选项切换 / 导航 / 标记 / 重做 / 套题筛选切换
// 依赖: 01-utils ($, playBeep), 05-streak (Streak), 06-render (Render)
// 暴露: window.Actions = { checkAnswer, toggleAnswer, prevQuestion, nextQuestion, toggleStar, redoCurrentQuestion, switchSetTab, setFilter, setTypeFilter, selectOption }

(function () {
  var $ = window.$;
  var playBeep = window.playBeep;
  var Streak = window.Streak;
  var Render = window.Render;
  var isAnswered = window.QuizState.isAnswered;
  var isShortLike = window.QuizState.isShortLike;

  // ═══ 选项选择（统一入口） ═══
  // 由选项点击 / Enter / 数字键共享，替代散弹式 s.userAnswers[q.id] = ...
  // ctx: { activeSetData, saveData, renderQuestion, focusedOptIdx }
  function selectOption(ctx, mode, idx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    // 已判定则锁定
    if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false) return;
    var cur = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
    if (mode === 'radio') {
      s.userAnswers[q.id] = [idx];
    } else if (mode === 'check') {
      // checkbox toggle from click
      var isChecked = cur.includes(idx);
      if (isChecked) s.userAnswers[q.id] = cur.filter(function (v) { return v !== idx; });
      else s.userAnswers[q.id] = cur.concat([idx]);
    } else if (mode === 'digit') {
      // 数字键：单选题同键取消选中，多选题切换
      if (q.type === 'single') {
        if (cur.length === 1 && cur[0] === idx) s.userAnswers[q.id] = [];
        else s.userAnswers[q.id] = [idx];
      } else {
        if (cur.includes(idx)) s.userAnswers[q.id] = cur.filter(function (v) { return v !== idx; });
        else s.userAnswers[q.id] = cur.concat([idx]);
      }
    }
    ctx.saveData();
    ctx.renderQuestion();
  }

  // ═══ 检查答案 ═══
  function checkAnswer(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    if (isAnswered(s, q)) return;

    var isCorrect = null;
    var fillFeedback = null;
    if (q.type === 'single' || q.type === 'multi') {
      var selected = s.userAnswers[q.id] || [];
      if (!Array.isArray(selected) || selected.length === 0) { alert('请先选择答案'); return; }
      var corrSet = new Set(q.ans);
      var selSet = new Set(selected);
      isCorrect = corrSet.size === selSet.size && Array.from(corrSet).every(function (v) { return selSet.has(v); });
    } else if (q.type === 'fill') {
      var input = $('fillInput').value.trim();
      if (!input) { alert('请输入你的答案'); return; }
      s.userAnswers[q.id] = input;
      var normalized = input.replace(/\s+/g, '').toLowerCase();
      var keywords = q.ansText.split('|');
      var hits = keywords.map(function (kw) {
        var nkw = kw.trim().replace(/\s+/g, '').toLowerCase();
        var ok = normalized.indexOf(nkw) !== -1;
        if (ok) return { kw: kw.trim(), ok: true };
        var hint = '未找到';
        var minOverlap = Math.max(2, Math.floor(nkw.length * 0.5));
        for (var i = 0; i <= normalized.length - minOverlap; i++) {
          var sub = normalized.substring(i, i + nkw.length);
          var match = 0;
          for (var j = 0; j < Math.min(sub.length, nkw.length); j++) {
            if (sub[j] === nkw[j]) match++;
          }
          if (match >= minOverlap) { hint = '接近：' + sub + ' → 差' + (nkw.length - match) + '字'; break; }
        }
        return { kw: kw.trim(), ok: false, hint: hint };
      });
      isCorrect = hits.every(function (h) { return h.ok; });
      fillFeedback = hits;
    } else if (isShortLike(q.type)) {
      var shortInput = $('shortInput').value.trim();
      if (!shortInput) { alert('请输入你的答案或直接点击"显示答案"对照'); return; }
      s.userAnswers[q.id] = 'submitted';
      Render.answerBox({ activeSetData: ctx.activeSetData }, q);
      ctx.saveData();
      ctx.renderQuestion();
      return;
    }

    s.userAnswers[q.id] = isCorrect;
    if (isCorrect && !isShortLike(q.type)) {
      s.streak = (s.streak || 0) + 1;
      if (s.streak > (s.bestStreak || 0)) s.bestStreak = s.streak;
      Streak.setBadge(s.streak, '🔥');
      Streak.checkMilestone(s.streak);
      playBeep(800, 0.08, 'sine');
      setTimeout(function () { playBeep(1200, 0.1, 'sine'); }, 80);
    } else if (!isCorrect && !isShortLike(q.type)) {
      s.wrongBank[q.id] = true;
      if (s.streak > 0) Streak.showBreak(s.streak, s.bestStreak || s.streak);
      s.streak = 0;
      Streak.setBadge(0, '🧯');
      s._wrongRetry = (s._wrongRetry || {});
      s._wrongRetry[q.id] = (s._wrongRetry[q.id] || 0) + 1;
      playBeep(300, 0.12, 'triangle');
      if (s._wrongRetry[q.id] >= 1) Render.answerBox({ activeSetData: ctx.activeSetData }, q);
    } else { if (s._wrongRetry) s._wrongRetry[q.id] = 0; }
    if (isCorrect) Render.answerBox({ activeSetData: ctx.activeSetData }, q);
    // 填空答错：显示逐词反馈
    if (!isCorrect && q.type === 'fill' && fillFeedback) {
      var ab = $('answerBox');
      $('ansContent').textContent = '关键词匹配：' + fillFeedback.map(function (h) { return (h.ok ? '✓' : '✗') + h.kw; }).join('  ');
      $('ansExplanation').textContent = '';
      ab.classList.add('show');
      ctx.activeSetData().revealedIds[q.id] = true;
    }
    if (q.type === 'fill' && fillFeedback) s._fillFeedback = fillFeedback;
    ctx.saveData();
    ctx.renderQuestion();
  }

  // ═══ 切换答案显示 ═══
  function toggleAnswer(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    if ($('answerBox').classList.contains('show')) {
      $('answerBox').classList.remove('show');
      s.revealedIds[q.id] = false;
    } else {
      Render.answerBox({ activeSetData: ctx.activeSetData }, q);
    }
    ctx.saveData();
  }

  // ═══ 导航 ═══
  function prevQuestion(ctx) {
    var s = ctx.activeSetData();
    if (s.currentIdx > 0) { s.currentIdx--; ctx.saveData(); ctx.renderQuestion(); }
  }
  function nextQuestion(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    if (s.currentIdx < list.length - 1) { s.currentIdx++; ctx.saveData(); ctx.renderQuestion(); }
  }

  // ═══ 标记 ═══
  function toggleStar(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    s.stars[q.id] = !s.stars[q.id];
    ctx.saveData();
    ctx.renderQuestion();
  }

  // ═══ 重做本题 ═══
  function redoCurrentQuestion(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    if (s.userAnswers[q.id] === undefined) return;
    if (!confirm('确认重做本题吗？将清空本题的作答与判定结果。')) return;
    delete s.userAnswers[q.id];
    delete s.revealedIds[q.id];
    if (s._fillFeedback) delete s._fillFeedback[q.id];
    if (ctx.focusedOptIdx !== undefined) ctx.focusedOptIdx = -1;
    ctx.saveData();
    ctx.renderQuestion();
  }

  // ═══ 套题/筛选切换 ═══
  function switchSetTab(ctx, idx) {
    ctx.setActiveSet(idx);
    ctx.setFilter('all');
    ctx.saveData();
    ctx.renderSidebar();
    ctx.renderQuestion();
  }

  function setFilter(ctx, f) {
    ctx.setFilter(f);
    ctx.activeSetData().typeFilter = 'all';
    ctx.activeSetData().currentIdx = 0;
    ctx.saveData();
    ctx.renderSidebar();
    ctx.renderQuestion();
  }

  function setTypeFilter(ctx, t) {
    var s = ctx.activeSetData();
    ctx.setFilter('all');
    if (s.typeFilter === t) { s.typeFilter = 'all'; }
    else { s.typeFilter = t; s.currentIdx = 0; }
    ctx.saveData();
    ctx.renderSidebar();
    ctx.renderQuestion();
  }

  // ═══ 暴露 ═══
  window.Actions = {
    selectOption: selectOption,
    checkAnswer: checkAnswer,
    toggleAnswer: toggleAnswer,
    prevQuestion: prevQuestion,
    nextQuestion: nextQuestion,
    toggleStar: toggleStar,
    redoCurrentQuestion: redoCurrentQuestion,
    switchSetTab: switchSetTab,
    setFilter: setFilter,
    setTypeFilter: setTypeFilter
  };
})();
