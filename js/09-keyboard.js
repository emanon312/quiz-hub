// ===== 模块: keyboard =====
// 职责: 全局键盘快捷键处理 —— ←→ 导航 / ↑↓ 选项焦点 / Enter 选中&提交 / 空格切换答案 / 1-4 选项
// 依赖: 01-utils ($), 07-actions (Actions)
// 暴露: window.Keyboard = { handleKey }

(function () {
  var $ = window.$;
  var Actions = window.Actions;

  function handleKey(e, ctx) {
    if (e.target.tagName === 'TEXTAREA') return;

    // ← → 导航
    if (e.key === 'ArrowLeft') { Actions.prevQuestion(ctx); return; }
    if (e.key === 'ArrowRight') { Actions.nextQuestion(ctx); return; }

    // Enter 键
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
      var s = ctx.activeSetData();
      var list = ctx.filteredQuestions();
      var q = list[s.currentIdx];
      if (q && (q.type === 'single' || q.type === 'multi') && ctx.focusedOptIdx >= 0) {
        // 已判定（对/错）则锁定
        if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false) {
          Actions.checkAnswer(ctx);
          return;
        }
        var cur = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
        if (q.type === 'single' && cur.length === 1 && cur[0] === ctx.focusedOptIdx) {
          Actions.checkAnswer(ctx);
        } else if (q.type === 'multi' && cur.indexOf(ctx.focusedOptIdx) !== -1 && cur.length > 0) {
          e.preventDefault();
          s.userAnswers[q.id] = cur.filter(function (v) { return v !== ctx.focusedOptIdx; });
          if (s.userAnswers[q.id].length === 0) ctx.focusedOptIdx = -1;
          ctx.saveData();
          ctx.renderQuestion();
        } else {
          e.preventDefault();
          if (q.type === 'single') s.userAnswers[q.id] = [ctx.focusedOptIdx];
          else s.userAnswers[q.id] = cur.concat([ctx.focusedOptIdx]);
          ctx.saveData();
          ctx.renderQuestion();
        }
      } else {
        Actions.checkAnswer(ctx);
      }
      return;
    }

    // 空格切换答案
    if (e.key === ' ') { e.preventDefault(); Actions.toggleAnswer(ctx); return; }

    // ↑↓ 选项导航
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && $('qOptions').style.display !== 'none') {
      e.preventDefault();
      var opts = document.querySelectorAll('#qOptions .opt');
      if (opts.length === 0) return;
      opts[ctx.focusedOptIdx].classList.remove('focused');
      if (e.key === 'ArrowUp') ctx.focusedOptIdx = Math.max(0, ctx.focusedOptIdx - 1);
      else ctx.focusedOptIdx = Math.min(opts.length - 1, ctx.focusedOptIdx + 1);
      opts[ctx.focusedOptIdx].classList.add('focused');
      opts[ctx.focusedOptIdx].scrollIntoView({ block: 'nearest' });
      return;
    }

    // 1-4 对应 ABCD
    if (['1', '2', '3', '4'].indexOf(e.key) !== -1) {
      var s2 = ctx.activeSetData();
      var list2 = ctx.filteredQuestions();
      var q2 = list2[s2.currentIdx];
      if (q2 && (q2.type === 'single' || q2.type === 'multi')) {
        if (s2.userAnswers[q2.id] === true || s2.userAnswers[q2.id] === false) return;
        e.preventDefault();
        var idx = parseInt(e.key) - 1;
        if (idx < q2.opts.length) {
          if (q2.type === 'single') {
            var cur1 = (s2.userAnswers[q2.id] && Array.isArray(s2.userAnswers[q2.id])) ? s2.userAnswers[q2.id] : [];
            if (cur1.length === 1 && cur1[0] === idx) s2.userAnswers[q2.id] = [];
            else s2.userAnswers[q2.id] = [idx];
          } else {
            var cur2 = (s2.userAnswers[q2.id] && Array.isArray(s2.userAnswers[q2.id])) ? s2.userAnswers[q2.id] : [];
            if (cur2.indexOf(idx) !== -1) s2.userAnswers[q2.id] = cur2.filter(function (v) { return v !== idx; });
            else s2.userAnswers[q2.id] = cur2.concat([idx]);
          }
          ctx.saveData();
          ctx.renderQuestion();
        }
      }
    }
  }

  // ═══ 暴露 ═══
  window.Keyboard = { handleKey: handleKey };
})();
