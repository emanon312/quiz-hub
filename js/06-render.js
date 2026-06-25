// ===== 模块: render =====
// 职责: DOM 渲染 —— 侧边栏题型导航、右侧进度面板、答案区展开、题型折叠切换
// 依赖: 01-utils ($, TYPE_LABELS), 02-storage (CONFIG, questionTypes, SET_COUNT, SET_SIZES), 04-pool (window.Pool.matchesSearch)
// 暴露: window.Render = { sidebar, answerBox, toggleTypeExpand }
// 注意: renderQuestion 仍留在 HTML 内联（依赖 let 变量太多），后续批次逐步移入

import { $ } from './01-utils.js';
import { CONFIG, questionTypes, SET_COUNT, SET_SIZES } from './02-storage.js';
import { countAnswered, getFillFeedback, isAnswered } from './03-state.js';

// ═══ 渲染侧边栏 ═══
// ctx: { activeSetData, filter, getQuestionPool, filteredQuestions, saveData }
function renderSidebar(ctx) {
  const s = ctx.activeSetData();
  let pool = ctx.getQuestionPool();
  // 应用错题/收藏筛选
  if (ctx.filter === 'wrong') pool = pool.filter(q => s.wrongBank[q.id]);
  else if (ctx.filter === 'star') pool = pool.filter(q => s.stars[q.id]);
  else if (ctx.filter === 'origin') pool = pool.filter(q => q.yq);
  if (ctx.searchQuery) pool = pool.filter(q => window.Pool.matchesSearch(q, ctx.searchQuery));
  const curQ = ctx.filteredQuestions()[s.currentIdx];
  const nav = $('moduleNav');
  const eid = 'qt_';
  let html = '';
  questionTypes.forEach(tt => {
    const qs = pool.filter(q => q.type === tt.type);
    const done = qs.filter(q => isAnswered(s, q));
    const active = s.typeFilter === tt.type ? ' active' : '';
    const isOpen = s.expandedTypes[tt.type] || s.typeFilter === tt.type;
    s.expandedTypes[tt.type] = isOpen;
    html += '<button class="module-btn' + active + (isOpen ? ' open' : '') + '" onclick="toggleTypeExpand(&apos;' + tt.type + '&apos;,this)"><span class="expand-arrow">▶</span>' + tt.short + ' <span class="type-q-count">' + done.length + '/' + qs.length + '</span></button>';
    html += '<div class="qnum-grid' + (isOpen ? ' open' : '') + '" id="' + eid + tt.type + '">';
    qs.forEach((q, qi) => {
      const localNum = qi + 1;
      let cls = 'qnum-dot';
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
  document.querySelectorAll('.set-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === ctx.activeSet);
    const sData = ctx.sets[i];
    const done = countAnswered(sData, window.Pool.getQuestionPool(i));
    btn.textContent = (CONFIG.setNames[i] || ('题组' + (i + 1))) + ' (' + done + '/' + SET_SIZES[i] + ')';
  });

  // 筛选按钮状态
  $('filterAll').classList.toggle('active', ctx.filter === 'all');
  const fw = $('filterWrong');
  fw.classList.toggle('active', ctx.filter === 'wrong');
  if (ctx.filter === 'wrong') fw.classList.add('wrong-mode'); else fw.classList.remove('wrong-mode');
  $('filterStar').classList.toggle('active', ctx.filter === 'star');
  const fo = $('filterOrigin');
  fo.classList.toggle('active', ctx.filter === 'origin');
  if (ctx.filter === 'origin') fo.classList.add('origin-mode'); else fo.classList.remove('origin-mode');

  updateStats(ctx);
}

// ═══ 更新右侧进度面板 ═══
function updateStats(ctx) {
  const s = ctx.activeSetData();
  const pool = ctx.getQuestionPool();
  const allDone = pool.filter(q => isAnswered(s, q));
  const right = allDone.filter(q => s.userAnswers[q.id] === true).length;
  $('rpDone').textContent = allDone.length;
  $('rpAcc').textContent = allDone.length > 0 ? Math.round(right / allDone.length * 100) + '%' : '-';
  const gDone = countAnswered(ctx.sets[ctx.activeSet], pool);
  $('rpGlobal').textContent = gDone;
  const gRight = Object.values(ctx.sets[ctx.activeSet].userAnswers).filter(v => v === true).length;
  $('rpGlobalPct').textContent = gDone > 0 ? '正确率 ' + Math.round(gRight / gDone * 100) + '%' : '-';
  const list = ctx.filteredQuestions();
  const fDone = countAnswered(s, list);
  $('rpBarFill').style.width = list.length > 0 ? (fDone / list.length * 100) + '%' : '0%';
  $('rpLabel').textContent = fDone + ' / ' + list.length;
  let modHtml = '';
  questionTypes.forEach(tt => {
    const qs = pool.filter(q => q.type === tt.type);
    const done = countAnswered(s, qs);
    const pct = qs.length > 0 ? Math.round(done / qs.length * 100) : 0;
    modHtml += '<div class="m-row"><div class="m-name">' + tt.short + ' <span>' + done + '/' + qs.length + '</span></div><div class="m-bar"><div class="fill" style="width:' + pct + '%"></div></div></div>';
  });
  $('rpModules').innerHTML = modHtml;
  const ssl = $('setSizeLabel'); if (ssl) ssl.textContent = SET_SIZES[ctx.activeSet];
  const ms = $('mobileStats'); if (ms) ms.textContent = gDone + '/' + SET_SIZES[ctx.activeSet];
  const accPct = allDone.length > 0 ? Math.round(right / allDone.length * 100) + '%' : '-';
  const listPct = list.length > 0 ? Math.round(fDone / list.length * 100) + '%' : '0%';
  const mbDone = $('mbDone'); if (mbDone) mbDone.textContent = gDone;
  const mbAcc = $('mbAcc'); if (mbAcc) mbAcc.textContent = accPct;
  const mbProgress = $('mbProgress'); if (mbProgress) mbProgress.textContent = listPct;
  ctx.saveData();
}

// ═══ 题型折叠切换 ═══
function toggleTypeExpand(ctx, type, btn) {
  const s = ctx.activeSetData();
  const grid = btn.nextElementSibling;
  const isOpen = !s.expandedTypes[type];
  s.expandedTypes[type] = isOpen;
  if (grid) {
    grid.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
  }
  ctx.saveData();
}

// ═══ 展示答案区 ═══
export function showAnswerBox(ctx, q) {
  ctx.activeSetData().revealedIds[q.id] = true;
  const ab = $('answerBox');
  ab.classList.add('show');
  function _set(el, s) { el[s.indexOf('<') !== -1 && s.indexOf('>') !== -1 ? 'innerHTML' : 'textContent'] = s; }
  if (q.type === 'single' || q.type === 'multi') {
    const letters = q.ans.map(i => String.fromCharCode(65 + i));
    _set($('ansContent'), '正确答案：' + letters.join(' + ') + ' — ' + q.ans.map(i => q.opts[i].substring(3)).join('；'));
  } else if (q.type === 'fill') {
    _set($('ansContent'), '参考答案：' + q.ansText.replace(/\|/g, '、'));
  } else {
    _set($('ansContent'), q.ansText);
  }
  _set($('ansExplanation'), q.exp ? '解析：' + q.exp : '');
  // 填空反馈也显示在答案区
  const fillFeedback = getFillFeedback(ctx.activeSetData(), q.id);
  if (q.type === 'fill' && fillFeedback) {
    const fb = fillFeedback;
    $('ansContent').innerHTML += ' | 你的匹配：' + fb.map(h => (h.ok ? '✓' : '✗') + h.kw).join(' ');
  }
}

// ═══ 暴露 ═══
window.Render = {
  sidebar: renderSidebar,
  answerBox: showAnswerBox,
  toggleTypeExpand
};

// 别名导出（供 ES import 使用）
export { showAnswerBox as answerBox };
