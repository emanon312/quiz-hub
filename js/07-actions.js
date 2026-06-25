// ===== 模块: actions =====
// 职责: 用户答题操作 —— 判题 / 选项切换 / 导航 / 标记 / 重做 / 套题筛选切换
// 依赖: 01-utils ($, playBeep), 03-state (isAnswered, isShortLike), 05-streak (setBadge, checkMilestone, showBreak), 06-render (answerBox)
// 暴露: window.Actions = { checkAnswer, toggleAnswer, prevQuestion, nextQuestion, toggleStar, redoCurrentQuestion, switchSetTab, setFilter, setTypeFilter }

import { $, playBeep } from './01-utils.js';
import { clearFillFeedback, isAnswered, isShortLike, setFillFeedback } from './03-state.js';
import { setBadge, checkMilestone, showBreak } from './05-streak.js';
import { answerBox } from './06-render.js';

// ═══ 检查答案 ═══
function checkAnswer(ctx) {
  const s = ctx.activeSetData();
  const list = ctx.filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  if (isAnswered(s, q)) return;

  let isCorrect = null;
  let fillFeedback = null;
  if (q.type === 'single' || q.type === 'multi') {
    if (!Array.isArray(q.ans) || q.ans.length === 0) { alert('题目答案数据异常，请联系管理员'); return; }
    const selected = s.userAnswers[q.id] || [];
    if (!Array.isArray(selected) || selected.length === 0) { alert('请先选择答案'); return; }
    const corrSet = new Set(q.ans);
    const selSet = new Set(selected);
    isCorrect = corrSet.size === selSet.size && Array.from(corrSet).every(v => selSet.has(v));
  } else if (q.type === 'fill') {
    const input = $('fillInput').value.trim();
    if (!input) { alert('请输入你的答案'); return; }
    s.userAnswers[q.id] = input;
    const normalized = input.replace(/\s+/g, '').toLowerCase();
    const keywords = q.ansText.split('|').filter(kw => kw.trim() !== '');
    if (keywords.length === 0) { alert('题目关键词数据异常，请联系管理员'); return; }
    const hits = keywords.map(kw => {
      const nkw = kw.trim().replace(/\s+/g, '').toLowerCase();
      const ok = normalized.indexOf(nkw) !== -1;
      if (ok) return { kw: kw.trim(), ok: true };
      let hint = '未找到';
      const minOverlap = Math.max(2, Math.floor(nkw.length * 0.5));
      for (let i = 0; i <= normalized.length - minOverlap; i++) {
        const sub = normalized.substring(i, i + nkw.length);
        let match = 0;
        for (let j = 0; j < Math.min(sub.length, nkw.length); j++) {
          if (sub[j] === nkw[j]) match++;
        }
        if (match >= minOverlap) { hint = '接近：' + sub + ' → 差' + (nkw.length - match) + '字'; break; }
      }
      return { kw: kw.trim(), ok: false, hint };
    });
    isCorrect = hits.every(h => h.ok);
    fillFeedback = hits;
  } else if (isShortLike(q.type)) {
    const shortInput = $('shortInput').value.trim();
    if (!shortInput) { alert('请输入你的答案或直接点击"显示答案"对照'); return; }
    s.userAnswers[q.id] = 'submitted';
    answerBox({ activeSetData: ctx.activeSetData }, q);
    ctx.saveData();
    ctx.renderQuestion();
    return;
  }

  s.userAnswers[q.id] = isCorrect;
  if (isCorrect && !isShortLike(q.type)) {
    s.streak = Math.max(0, s.streak || 0) + 1;
    if (s.streak > (s.bestStreak || 0)) s.bestStreak = s.streak;
    setBadge(s.streak, 'hot');
    checkMilestone(s.streak);
    playBeep(800, 0.08, 'sine');
    setTimeout(() => { playBeep(1200, 0.1, 'sine'); }, 80);
  } else if (!isCorrect && !isShortLike(q.type)) {
    s.wrongBank[q.id] = true;
    if (s.streak > 0) showBreak(s.streak, s.bestStreak || s.streak);
    s.streak = 0;
    setBadge(0, 'break');
    s._wrongRetry = (s._wrongRetry || {});
    s._wrongRetry[q.id] = (s._wrongRetry[q.id] || 0) + 1;
    playBeep(300, 0.12, 'triangle');
    if (s._wrongRetry[q.id] >= 1) answerBox({ activeSetData: ctx.activeSetData }, q);
  } else { if (s._wrongRetry) s._wrongRetry[q.id] = 0; }
  if (isCorrect) answerBox({ activeSetData: ctx.activeSetData }, q);
  // 填空答错：显示逐词反馈
  if (!isCorrect && q.type === 'fill' && fillFeedback) {
    const ab = $('answerBox');
    $('ansContent').textContent = '关键词匹配：' + fillFeedback.map(h => (h.ok ? '✓' : '✗') + h.kw).join('  ');
    $('ansExplanation').textContent = '';
    ab.classList.add('show');
    ctx.activeSetData().revealedIds[q.id] = true;
  }
  if (q.type === 'fill' && fillFeedback) setFillFeedback(s, q.id, fillFeedback);
  ctx.saveData();
  ctx.renderQuestion();
}

// ═══ 切换答案显示 ═══
function toggleAnswer(ctx) {
  const s = ctx.activeSetData();
  const list = ctx.filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  if ($('answerBox').classList.contains('show')) {
    $('answerBox').classList.remove('show');
    s.revealedIds[q.id] = false;
  } else {
    answerBox({ activeSetData: ctx.activeSetData }, q);
  }
  ctx.saveData();
}

// ═══ 导航 ═══
function prevQuestion(ctx) {
  const s = ctx.activeSetData();
  if (s.currentIdx > 0) { s.currentIdx--; ctx.saveData(); ctx.renderQuestion(); }
}
function nextQuestion(ctx) {
  const s = ctx.activeSetData();
  const list = ctx.filteredQuestions();
  if (s.currentIdx < list.length - 1) { s.currentIdx++; ctx.saveData(); ctx.renderQuestion(); }
}

// ═══ 标记 ═══
function toggleStar(ctx) {
  const s = ctx.activeSetData();
  const list = ctx.filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  s.stars[q.id] = !s.stars[q.id];
  ctx.saveData();
  ctx.renderQuestion();
}

// ═══ 重做本题 ═══
function redoCurrentQuestion(ctx) {
  const s = ctx.activeSetData();
  const list = ctx.filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  if (s.userAnswers[q.id] === undefined) return;
  if (!confirm('确认重做本题吗？将清空本题的作答与判定结果。')) return;
  delete s.userAnswers[q.id];
  delete s.revealedIds[q.id];
  clearFillFeedback(s, q.id);
  if (ctx.focusedOptIdx !== undefined) ctx.setFocusedOptIdx(-1);
  ctx.saveData();
  ctx.renderQuestion();
}

// ═══ 套题/筛选切换 ═══
function switchSetTab(ctx, idx) {
  ctx.setActiveSet(idx);
  ctx.setFilter('all');
  ctx.activeSetData().currentIdx = 0;
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
  const s = ctx.activeSetData();
  ctx.setFilter('all');
  if (s.typeFilter === t) { s.typeFilter = 'all'; }
  else { s.typeFilter = t; s.currentIdx = 0; }
  ctx.saveData();
  ctx.renderSidebar();
  ctx.renderQuestion();
}

// ═══ 暴露 ═══
window.Actions = {
  checkAnswer,
  toggleAnswer,
  prevQuestion,
  nextQuestion,
  toggleStar,
  redoCurrentQuestion,
  switchSetTab,
  setFilter,
  setTypeFilter
};
