// ===== 模块: tools =====
// 职责: 工具栏功能 —— 错题分析、重置进度、简答题转换与导出、搜索
// 依赖: 01-utils ($), 06-render (Render)
// 暴露: window.Tools = { showWrongAnalysis, showResetModal, doResetProgress, toggleShortAnswer, exportShortAnswers }

(function () {
  var $ = window.$;
  var CONFIG = window.CONFIG;
  var Render = window.Render;

  // ═══ 错题分析弹窗 ═══
  function showWrongAnalysis(ctx) {
    var s = ctx.activeSetData();
    var pool = ctx.getQuestionPool();
    var wrong = pool.filter(function (q) { return s.userAnswers[q.id] === false; });
    if (wrong.length === 0) { alert('当前题组没有错题，太棒了！'); return; }
    var byType = {};
    wrong.forEach(function (q) {
      var label = q.type === 'single' ? '单选题' : q.type === 'multi' ? '多选题' : q.type === 'fill' ? '填空题' : '简答题';
      if (!byType[label]) byType[label] = [];
      byType[label].push(q);
    });
    var waHtml = '<p style="color:var(--text-muted);margin-bottom:12px">共 ' + wrong.length + ' 道错题</p>';
    Object.keys(byType).forEach(function (label) {
      var qs = byType[label];
      waHtml += '<div class="wa-mod"><div class="wa-mod-name" onclick="this.nextElementSibling.classList.toggle(\'open\')">' + label + ' (' + qs.length + '题) ▸</div>';
      waHtml += '<div class="wa-qlist">';
      qs.forEach(function (q) {
        waHtml += '<span class="wa-qdot" onclick="document.getElementById(\'wrongModal\').classList.remove(\'show\');jumpToQ(' + q.id + ')">#' + q.id + '</span>';
      });
      waHtml += '</div></div>';
    });
    $('wrongAnalysis').innerHTML = waHtml;
    $('wrongModal').classList.add('show');
  }

  // ═══ 重置进度弹窗与执行 ═══
  function showResetModal() {
    $('resetModal').classList.add('show');
    $('resetConfirmInput').value = '';
    $('resetConfirmBtn').disabled = true;
    $('resetConfirmBtn').style.opacity = '.4';
  }

  function doResetProgress(ctx) {
    var s = ctx.activeSetData();
    var bank = s.wrongBank; // 保留错题库
    s.userAnswers = {};
    s.revealedIds = {};
    s.currentIdx = 0;
    s.typeFilter = 'all';
    s.stars = {};
    s.expandedTypes = {};
    s.wrongBank = bank;
    s.streak = 0;
    $('streakNum').textContent = 0;
    ctx.setFilter('all');
    ctx.saveData();
    ctx.renderSidebar();
    ctx.renderQuestion();
  }

  // ═══ 转为简答题 ═══
  function toggleShortAnswer(ctx) {
    var s = ctx.activeSetData();
    var list = ctx.filteredQuestions();
    var q = list[s.currentIdx];
    if (!q) return;
    if (s.shortAnswerBank[q.id]) {
      if (!confirm('该题已转为简答题，确定删除？')) return;
      delete s.shortAnswerBank[q.id];
      ctx.saveData();
      ctx.renderQuestion();
      return;
    }
    var saQ = q.q;
    var saA = '';
    if (q.type === 'single' || q.type === 'multi') {
      saQ = saQ.replace(/[（(]\s*[）)]\s*$/, '').trim();
      if (saQ.indexOf('简述') !== 0) saQ = '简述' + saQ;
      saA = q.ans.map(function (i) { return q.opts[i].substring(3); }).join('；');
      if (q.exp) saA += '\\n' + q.exp;
    } else if (q.type === 'fill') {
      saA = q.ansText.replace(/\\|/g, '、');
      if (q.exp) saA += '\\n' + q.exp;
    } else if (q.type === 'short') {
      saA = q.ansText;
    }
    var newQ = prompt('简答题题目（可编辑）：', saQ);
    if (!newQ) return;
    var newA = prompt('简答题答案（可编辑）：', saA);
    if (!newA) return;
    s.shortAnswerBank[q.id] = { q: newQ.trim(), a: newA.trim() };
    ctx.saveData();
    ctx.renderQuestion();
  }

  // ═══ 导出简答题 Markdown ═══
  function exportShortAnswers(ctx) {
    var all = {};
    ctx.sets.forEach(function (setData) {
      Object.keys(setData.shortAnswerBank || {}).forEach(function (qid) {
        if (!all[qid]) all[qid] = setData.shortAnswerBank[qid];
      });
    });
    var entries = Object.keys(all).map(function (k) { return all[k]; });
    if (entries.length === 0) { alert('还没有转为简答题的题目。\n\n在做题时点击题目旁的"转简答"按钮来收集。'); return; }
    var md = '# ' + CONFIG.subjectName + '简答题大全\n\n> 共 ' + entries.length + ' 道简答题，从选择题/填空题转换而来\n\n---\n\n';
    entries.forEach(function (sa, i) {
      md += '## ' + (i + 1) + '. ' + sa.q + '\n\n';
      md += '**答案：**\n\n' + sa.a.replace(/\n/g, '\n\n') + '\n\n---\n\n';
    });
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = CONFIG.subjectName + '简答题大全.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ═══ 暴露 ═══
  window.Tools = {
    showWrongAnalysis: showWrongAnalysis,
    showResetModal: showResetModal,
    doResetProgress: doResetProgress,
    toggleShortAnswer: toggleShortAnswer,
    exportShortAnswers: exportShortAnswers
  };
})();
