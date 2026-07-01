// ===== 模块: keyboard =====
// 职责: 全局键盘快捷键处理 —— ←→ 导航 / ↑↓ 选项焦点 / Enter 选中&提交 / 空格切换答案 / 1-4 选项
// 依赖: 01-utils ($), 07-actions (Actions 从 window 取)
// 暴露: window.Keyboard = { handleKey }

import { $ } from './01-utils.js';

const Actions = window.Actions;

function keepElementVisible(el) {
  const rect = el.getBoundingClientRect();
  const topPad = window.innerWidth <= 768 ? 78 : 24;
  const bottomPad = window.innerWidth <= 768 ? 118 : 24;
  const safeBottom = window.innerHeight - bottomPad;
  if (rect.top >= topPad && rect.bottom <= safeBottom) return;
  window.scrollTo({
    top: Math.max(0, window.scrollY + rect.top - topPad),
    behavior: 'smooth',
  });
}

function isEditableTarget(target) {
  if (!target) return false;
  const tagName = String(target.tagName || '').toUpperCase();
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return true;
  if (target.isContentEditable) return true;
  if (typeof target.closest === 'function' && target.closest('[contenteditable="true"],[contenteditable="plaintext-only"]')) return true;
  return false;
}

function handleKey(e, ctx) {
  if (isEditableTarget(e.target)) return;

  // ← → 导航
  if (e.key === 'ArrowLeft') { Actions.prevQuestion(ctx); return; }
  if (e.key === 'ArrowRight') { Actions.nextQuestion(ctx); return; }

  // Enter 键
  if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
    const s = ctx.activeSetData();
    const list = ctx.filteredQuestions();
    const q = list[s.currentIdx];
    if (q && (q.type === 'single' || q.type === 'multi') && ctx.focusedOptIdx >= 0) {
      // 已判定（对/错）则锁定
      if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false) {
        Actions.checkAnswer(ctx);
        return;
      }
      const cur = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
      if (q.type === 'single' && cur.length === 1 && cur[0] === ctx.focusedOptIdx) {
        Actions.checkAnswer(ctx);
      } else if (q.type === 'multi' && cur.indexOf(ctx.focusedOptIdx) !== -1) {
        // 多选：Enter 在已选选项上 → 提交答案（不再切换取消）
        Actions.checkAnswer(ctx);
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
    const opts = document.querySelectorAll('#qOptions .opt');
    if (opts.length === 0) return;
    let oldIdx = ctx.focusedOptIdx;
    // 多选初始焦点：上键从最顶已选开始，下键从最底已选开始
    if (oldIdx < 0) {
      const s3 = ctx.activeSetData();
      const list3 = ctx.filteredQuestions();
      const q3 = list3[s3.currentIdx];
      if (q3 && q3.type === 'multi') {
        const sel = (s3.userAnswers[q3.id] && Array.isArray(s3.userAnswers[q3.id])) ? s3.userAnswers[q3.id] : [];
        oldIdx = e.key === 'ArrowUp' ? (sel.length > 0 ? sel[0] : 0) : (sel.length > 0 ? sel[sel.length - 1] : opts.length - 1);
      } else {
        oldIdx = 0;
      }
    }
    opts[oldIdx].classList.remove('focused');
    let newIdx = oldIdx;
    if (e.key === 'ArrowUp') newIdx = Math.max(0, newIdx - 1);
    else newIdx = Math.min(opts.length - 1, newIdx + 1);
    ctx.setFocusedOptIdx(newIdx);
    opts[newIdx].classList.add('focused');
    keepElementVisible(opts[newIdx]);
    return;
  }

  // 1-4 对应 ABCD
  if (['1', '2', '3', '4'].indexOf(e.key) !== -1) {
    const s2 = ctx.activeSetData();
    const list2 = ctx.filteredQuestions();
    const q2 = list2[s2.currentIdx];
    if (q2 && (q2.type === 'single' || q2.type === 'multi')) {
      if (s2.userAnswers[q2.id] === true || s2.userAnswers[q2.id] === false) return;
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      if (idx < q2.opts.length) {
        if (q2.type === 'single') {
          const cur1 = (s2.userAnswers[q2.id] && Array.isArray(s2.userAnswers[q2.id])) ? s2.userAnswers[q2.id] : [];
          if (cur1.length === 1 && cur1[0] === idx) s2.userAnswers[q2.id] = [];
          else s2.userAnswers[q2.id] = [idx];
        } else {
          const cur2 = (s2.userAnswers[q2.id] && Array.isArray(s2.userAnswers[q2.id])) ? s2.userAnswers[q2.id] : [];
          if (cur2.indexOf(idx) !== -1) s2.userAnswers[q2.id] = cur2.filter(v => v !== idx);
          else s2.userAnswers[q2.id] = cur2.concat([idx]);
        }
        ctx.saveData();
        ctx.renderQuestion();
      }
    }
  }
}

// ═══ 暴露 ═══
window.Keyboard = { handleKey, isEditableTarget };
