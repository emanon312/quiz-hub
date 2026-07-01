// ===== 模块: app =====
// 职责: 应用状态中心 —— 集中管理全局状态、持久化、渲染入口与 HTML onclick 桥接
// 依赖: 01–10 全部前置模块
// 暴露: window.QuizApp / export { app as QuizApp }

import { $, playBeep, TYPE_LABELS as BASE_TYPE_LABELS, TYPE_CLASS } from './01-utils.js';
import { CONFIG, STORAGE_KEY, SET_COUNT, SET_SIZES, questionTypes } from './02-storage.js';
import { getChoiceSelection, getFillFeedback, getTextAnswerDraft, isAnswered, isShortLike, initSets, rememberTextAnswerDraft } from './03-state.js';
import './04-pool.js';
import './07-actions.js';
import './08-tools.js';
import './09-keyboard.js';
import './10-init.js';
import { iconMarkup } from './icons.js';

const THEME_ORDER = ['orange', 'green', 'broccoli'];
const THEME_TOGGLE_META = {
  orange: { next: 'green', icon: 'themeLeaf', label: '切换到深绿主题' },
  green: { next: 'broccoli', icon: 'themeBroccoli', label: '切换到西蓝花主题' },
  broccoli: { next: 'orange', icon: 'themeCarrot', label: '切换到橙色主题' },
};

// 题型显示名优先取学科配置的 label（如电子技术把 single 复用为"判断题"、short 复用为"计算题"），
// 回退到通用 TYPE_LABELS，避免卡片顶部标签与侧边栏 short 名不一致
const TYPE_LABELS = (() => {
  const m = {};
  (questionTypes || []).forEach(t => { m[t.type] = t.label; });
  return Object.assign({}, BASE_TYPE_LABELS, m);
})();

function keepInputVisible(input) {
  window.setTimeout(() => {
    const rect = input.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const topPad = isMobile ? 72 : 24;
    const safeBottom = window.innerHeight - (isMobile ? 118 : 24);
    if (rect.top >= topPad && rect.bottom <= safeBottom) return;
    window.scrollTo({
      top: Math.max(0, window.scrollY + rect.top - topPad),
      behavior: 'smooth',
    });
  }, 80);
}

export function setChoiceSelection(setData, q, optionIndex, checked) {
  if (!setData || !q || setData.userAnswers[q.id] === true || setData.userAnswers[q.id] === false) return false;
  if (q.type === 'single') {
    if (!checked) return false;
    setData.userAnswers[q.id] = [optionIndex];
    return true;
  }
  if (q.type === 'multi') {
    const current = Array.isArray(setData.userAnswers[q.id]) ? setData.userAnswers[q.id] : [];
    const next = checked
      ? current.concat([optionIndex])
      : current.filter(v => v !== optionIndex);
    setData.userAnswers[q.id] = Array.from(new Set(next)).sort((a, b) => a - b);
    return true;
  }
  return false;
}

const _init = initSets();
const data = _init.data;

const app = {
  activeSet: Math.max(0, Math.min((data.activeSet || 0), SET_COUNT - 1)),
  filter: data.filter || 'all',
  sets: _init.sets,
  practiceSec: data.practiceSec || 0,
  randomMode: false,
  autoReveal: false,
  searchQuery: '',
  focusedOptIdx: -1,
  _saveTimer: null,

  activeSetData() { return this.sets[this.activeSet]; },

  getQuestionPool() {
    return window.Pool.getQuestionPool(this.activeSet);
  },

  filteredQuestions() {
    const self = this;
    return window.Pool.filteredQuestions(
      self.activeSet, self.filter, self.randomMode,
      () => self.activeSetData(),
      self.searchQuery
    );
  },

  setActiveSet(v) { this.activeSet = v; },
  setFilter(v) { this.filter = v; },
  setFocusedOptIdx(v) { this.focusedOptIdx = v; },

  ctx() {
    const self = this;
    return {
      activeSet: self.activeSet,
      filter: self.filter,
      practiceSec: self.practiceSec,
      sets: self.sets,
      activeSetData() { return self.activeSetData(); },
      getQuestionPool() { return self.getQuestionPool(); },
      filteredQuestions() { return self.filteredQuestions(); },
      saveData() { return self.saveData(); },
      renderSidebar() { return self.renderSidebar(); },
      renderQuestion() { return self.renderQuestion(); },
      get focusedOptIdx() { return self.focusedOptIdx; },
      setFocusedOptIdx(v) { self.focusedOptIdx = v; },
      setActiveSet(v) { self.activeSet = v; },
      setFilter(v) { self.filter = v; }
    };
  },

  saveData() {
    const self = this;
    if (self._saveTimer) clearTimeout(self._saveTimer);
    self._saveTimer = setTimeout(() => { self._saveImmediate(); }, 300);
  },

  _saveImmediate() {
    this._saveTimer = null;
    const compact = {
      updatedAt: Date.now(),
      activeSet: this.activeSet,
      filter: this.filter,
      sets: this.sets.map(s => ({
        userAnswers: s.userAnswers, revealedIds: s.revealedIds, currentIdx: s.currentIdx,
        typeFilter: s.typeFilter, stars: s.stars, expandedTypes: s.expandedTypes,
        wrongBank: s.wrongBank, shortAnswerBank: s.shortAnswerBank, choiceSelections: s.choiceSelections, textAnswerDrafts: s.textAnswerDrafts,
        fillFeedbackById: s.fillFeedbackById,
        streak: s.streak, bestStreak: s.bestStreak
      })),
      practiceSec: this.practiceSec
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(compact)); }
    catch (e) { console.error('[saveData] 写入失败', e); }
  },

  renderSidebar() {
    const self = this;
    window.Render.sidebar({
      activeSet: self.activeSet,
      filter: self.filter,
      searchQuery: self.searchQuery,
      sets: self.sets,
      activeSetData() { return self.activeSetData(); },
      getQuestionPool() { return self.getQuestionPool(); },
      filteredQuestions() { return self.filteredQuestions(); },
      saveData() { return self.saveData(); }
    });
  },

  showAnswerBox(q) {
    const self = this;
    window.Render.answerBox({ activeSetData() { return self.activeSetData(); } }, q);
  },

  renderQuestion() {
    const self = this;
    const s = self.activeSetData();
    const list = self.filteredQuestions();

    if (list.length === 0) {
      let msg;
      if (self.filter === 'wrong') msg = '历史错题库为空，太棒了！';
      else if (self.filter === 'star') msg = '没有已标记的题目';
      else if (self.filter === 'origin') msg = '当前题组没有原题';
      else if (self.searchQuery) msg = '没有匹配「' + self.searchQuery + '」的题目';
      else msg = '暂无题目';
      $('qOptions').style.display = 'none';
      $('fillArea').style.display = 'none';
      $('shortArea').style.display = 'none';
      $('btnCheck').style.display = 'none';
      $('btnReveal').style.display = 'none';
      $('answerBox').classList.remove('show');
      $('resultMsg').classList.remove('show', 'right', 'wrong');
      $('qNum').textContent = '';
      $('qType').textContent = '';
      $('qText').innerHTML = '<div class="empty-state"><div class="empty-state__icon">' + iconMarkup('emptyBox') + '</div><h3>' + msg + '</h3><p>可以调整筛选或搜索条件，继续回到题目列表。</p><div class="empty-state__actions"><button class="empty-state__btn" onclick="setFilter(&apos;all&apos;)">查看全部题目</button></div></div>';
      $('navInfo').textContent = '0 / 0';
      self.renderSidebar();
      return;
    }

    if (s.currentIdx >= list.length || s.currentIdx < 0) s.currentIdx = 0;
    const q = list[s.currentIdx];

    if (q.type === 'single' || q.type === 'multi') {
      const curSel = getChoiceSelection(s, q.id);
      if (q.type === 'multi') {
        self.focusedOptIdx = curSel.length > 0 ? -1 : 0;
      } else if (curSel.length > 0) {
        self.focusedOptIdx = curSel[0];
      } else if (self.focusedOptIdx < 0 || self.focusedOptIdx >= q.opts.length) {
        self.focusedOptIdx = 0;
      } else {
        self.focusedOptIdx = Math.min(self.focusedOptIdx, q.opts.length - 1);
      }
    } else {
      self.focusedOptIdx = -1;
    }

    $('qNum').textContent = '第 ' + (list.indexOf(q) + 1) + ' 题';
    $('qType').textContent = TYPE_LABELS[q.type];
    $('qType').className = 'q-type ' + TYPE_CLASS[q.type];
    $('qOrigin').className = 'q-origin' + (q.yq ? ' show' : '');
    const _tq = q.q;
    $('qText')[_tq.indexOf('<') !== -1 && _tq.indexOf('>') !== -1 ? 'innerHTML' : 'textContent'] = _tq;
    $('navInfo').textContent = (s.currentIdx + 1) + ' / ' + list.length;
    const _ml = $('moduleLabel'); if (_ml) _ml.textContent = s.typeFilter === 'all' ? '全部题目'
      : (questionTypes.find(t => t.type === s.typeFilter) || {}).label || '';
    const st = s.streak || 0;
    $('streakNum').textContent = st;
    if (st > 0) window.Streak.setBadge(st, 'hot');

    const starBtn = $('starBtn');
    starBtn.innerHTML = iconMarkup('star');
    starBtn.setAttribute('aria-label', s.stars[q.id] ? '取消标记此题' : '标记此题');
    starBtn.setAttribute('title', s.stars[q.id] ? '取消标记此题' : '标记此题');
    const saBtn = $('saBtn');
    saBtn.textContent = s.shortAnswerBank[q.id] ? '已转简答' : '转简答';
    saBtn.className = 'sa-btn' + (s.shortAnswerBank[q.id] ? ' saved' : '');
    starBtn.className = 'star-btn' + (s.stars[q.id] ? ' starred' : '');

    const optDiv = $('qOptions');
    const fillDiv = $('fillArea');
    const shortDiv = $('shortArea');
    optDiv.innerHTML = '';
    optDiv.style.display = 'none';
    fillDiv.style.display = 'none';
    shortDiv.style.display = 'none';

    if (q.type === 'single' || q.type === 'multi') {
      if (!Array.isArray(q.opts) || q.opts.length === 0) return;
      optDiv.style.display = 'block';
      const inputType = q.type === 'single' ? 'radio' : 'checkbox';
      const groupName = 'q' + q.id;
      const saved = getChoiceSelection(s, q.id);
      const checked = (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false);

      q.opts.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'opt';
        const isSelected = saved.indexOf(i) !== -1;
        if (isSelected) div.classList.add('selected');
        if (checked) {
          if (s.userAnswers[q.id] === true && q.ans.indexOf(i) !== -1) div.classList.add('correct');
          if (q.ans.indexOf(i) === -1 && isSelected) div.classList.add('wrong');
        }
        const letter = String.fromCharCode(65 + i);
        const chk = isSelected ? ' checked' : '';
        div.innerHTML = '<input type="' + inputType + '" name="' + groupName + '" value="' + i + '"' + chk + '><span class="letter">' + letter + '.</span><span class="text">' + opt.substring(3) + '</span>';
        div.setAttribute('data-opt-idx', i);
        const inp = div.querySelector('input');
        inp.addEventListener('change', (e) => {
          if (!setChoiceSelection(s, q, i, e.target.checked)) return;
          self.saveData();
          playBeep(600, 0.06, 'sine');
          self.renderQuestion();
        });
        div.addEventListener('click', (e) => {
          if (e.target.tagName === 'INPUT') return;
          if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false) return;
          if (inputType === 'radio') {
            inp.checked = true;
          } else {
            inp.checked = !inp.checked;
          }
          setChoiceSelection(s, q, i, inp.checked);
          self.saveData();
          playBeep(600, 0.06, 'sine');
          self.renderQuestion();
        });
        optDiv.appendChild(div);
      });
    } else if (q.type === 'fill') {
      fillDiv.style.display = 'block';
      const fillInput = $('fillInput');
      fillInput.value = getTextAnswerDraft(s, q.id);
      fillInput.oninput = () => {
        rememberTextAnswerDraft(s, q.id, fillInput.value);
        self.saveData();
      };
    } else if (isShortLike(q.type)) {
      shortDiv.style.display = 'block';
      const shortInput = $('shortInput');
      shortInput.value = getTextAnswerDraft(s, q.id);
      shortInput.oninput = () => {
        rememberTextAnswerDraft(s, q.id, shortInput.value);
        self.saveData();
      };
    }

    $('btnCheck').style.display = '';
    $('btnReveal').style.display = '';
    $('answerBox').classList.remove('show');
    $('resultMsg').classList.remove('show', 'right', 'wrong');
    $('resultMsg').style.background = '';
    $('resultMsg').style.color = '';

    if (s.revealedIds[q.id]) self.showAnswerBox(q);

    let rm;
    if (s.userAnswers[q.id] === true) {
      rm = $('resultMsg');
      rm.textContent = '✓ 回答正确！';
      rm.className = 'result-msg right show';
    } else if (s.userAnswers[q.id] === false) {
      rm = $('resultMsg');
      rm.textContent = '✗ 回答错误';
      rm.className = 'result-msg wrong show';
    } else if (s.userAnswers[q.id] === 'submitted') {
      rm = $('resultMsg');
      rm.textContent = '已提交。请对照参考答案自行评判。';
      rm.className = 'result-msg show';
      rm.style.background = '#fff3e0';
      rm.style.color = '#e65100';
    }

    $('btnCheck').disabled = isAnswered(s, q);

    const fillFeedback = getFillFeedback(s, q.id);
    if (fillFeedback && isAnswered(s, q)) {
      const fb = fillFeedback;
      rm = $('resultMsg');
      if (!rm.classList.contains('show')) {
        rm.textContent = '关键词：' + fb.map(h => {
          if (h.ok) return '✓ ' + h.kw;
          return '✗ ' + h.kw + (h.hint && h.hint !== '未找到' ? '（' + h.hint + '）' : '');
        }).join('  ');
        rm.className = 'result-msg show';
        rm.style.background = fb.every(h => h.ok) ? '#e8f5e9' : '#fff3e0';
        rm.style.color = fb.every(h => h.ok) ? '#2e7d32' : '#e65100';
      }
    }
    if (self.autoReveal && !isAnswered(s, q)) self.showAnswerBox(q);
    self.renderSidebar();
  },

  toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'orange';
    const next = cur === 'orange' ? 'green' : 'orange';
    document.documentElement.setAttribute('data-theme', next);
    const themeToggle = $('themeToggle');
    themeToggle.innerHTML = iconMarkup(next === 'orange' ? 'themeBroccoli' : 'themeCarrot');
    themeToggle.setAttribute('aria-label', next === 'orange' ? '切换到绿色主题' : '切换到橙色主题');
    themeToggle.setAttribute('title', next === 'orange' ? '切换到绿色主题' : '切换到橙色主题');
    localStorage.setItem('quiz-hub-theme', next);
  },

  toggleRandom() {
    this.randomMode = !this.randomMode;
    window.Pool.invalidateShuffle();
    const chip = $('randomChip');
    chip.classList.toggle('random-on', this.randomMode);
    this.activeSetData().currentIdx = 0;
    this.renderSidebar();
    this.renderQuestion();
  },

  toggleAutoReveal() {
    this.autoReveal = !this.autoReveal;
    const chip = $('autoRevealChip');
    if (chip) {
      chip.classList.toggle('active', this.autoReveal);
      chip.textContent = '答案模式';
      chip.setAttribute('aria-pressed', this.autoReveal ? 'true' : 'false');
      chip.setAttribute('title', this.autoReveal ? '关闭答案模式' : '开启答案模式');
    }
    if (!this.autoReveal) {
      const s = this.activeSetData();
      Object.keys(s.revealedIds).forEach(id => {
        if (s.userAnswers[id] !== true && s.userAnswers[id] !== false && s.userAnswers[id] !== 'submitted')
          delete s.revealedIds[id];
      });
    }
    this.renderQuestion();
  },

  resetPracticeTimer() {
    if (!confirm('确认把当前做题时间清零吗？此操作不影响答题进度。')) return;
    this.practiceSec = 0;
    const el = $('rpTimer');
    if (el) el.textContent = '00:00';
    const mb = $('mbTimer');
    if (mb) mb.textContent = '00:00';
    this.saveData();
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  },

  onSearch(val) {
    this.searchQuery = val.trim().toLowerCase();
    this.activeSetData().currentIdx = 0;
    window.Pool.invalidateShuffle();
    this.renderSidebar();
    this.renderQuestion();
  },

  jumpToQ(qid) {
    const s = this.activeSetData();
    const list = this.filteredQuestions();
    const idx = list.findIndex(x => x.id === qid);
    if (idx >= 0) {
      s.currentIdx = idx;
      this.saveData();
      this.renderSidebar();
      this.renderQuestion();
      if (window.innerWidth <= 768) this.toggleMobileSidebar();
    }
  },

  toggleTypeExpand(type, btn) {
    const self = this;
    window.Render.toggleTypeExpand({
      activeSetData() { return self.activeSetData(); },
      saveData() { return self.saveData(); }
    }, type, btn);
  },

  checkAnswer() { window.Actions.checkAnswer(this.ctx()); },
  toggleAnswer() { window.Actions.toggleAnswer(this.ctx()); },
  prevQuestion() { window.Actions.prevQuestion(this.ctx()); },
  nextQuestion() { window.Actions.nextQuestion(this.ctx()); },
  toggleStar() { window.Actions.toggleStar(this.ctx()); },
  redoCurrentQuestion() { window.Actions.redoCurrentQuestion(this.ctx()); },
  switchSetTab(idx) { window.Actions.switchSetTab(this.ctx(), idx); },
  setFilter(f) { window.Actions.setFilter(this.ctx(), f); },
  setTypeFilter(t) { window.Actions.setTypeFilter(this.ctx(), t); },
  showWrongAnalysis() { window.Tools.showWrongAnalysis(this.ctx()); },
  showResetModal() { window.Tools.showResetModal(); },
  doResetProgress() { window.Tools.doResetProgress(this.ctx()); },
  toggleShortAnswer() { window.Tools.toggleShortAnswer(this.ctx()); },
  exportShortAnswers() { window.Tools.exportShortAnswers(this.ctx()); },
  exportLearningData() { window.Tools.exportLearningData(this.ctx()); },
  importLearningDataFile(event) { window.Tools.importLearningDataFile(this.ctx(), event); },

  _startPracticeTimer() {
    const self = this;
    const formatTime = (sec) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    };
    setInterval(() => {
      self.practiceSec++;
      const t = formatTime(self.practiceSec);
      const el = $('rpTimer');
      if (el) el.textContent = t;
      const mb = $('mbTimer');
      if (mb) mb.textContent = t;
    }, 1000);
  },

  boot() {
    if (this.activeSet >= SET_COUNT || this.activeSet < 0) this.activeSet = 0;

    window.Init.initTheme();
    document.title = CONFIG.pageTitle;
    let el;
    el = $('sidebarTitle'); if (el) el.textContent = CONFIG.sidebarTitle;
    el = $('mobileTitle'); if (el) el.textContent = CONFIG.mobileTitle;
    el = $('setSizeLabel'); if (el) el.textContent = SET_SIZES[this.activeSet];
    window.Init.setupSetTabs(this.activeSet, CONFIG.setNames);

    const self = this;
    window.addEventListener('beforeunload', () => {
      if (self._saveTimer) { clearTimeout(self._saveTimer); self._saveImmediate(); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && self._saveTimer) { clearTimeout(self._saveTimer); self._saveImmediate(); }
    });
    document.addEventListener('click', (e) => {
      const dd = document.querySelector('.tools-dropdown');
      if (dd && !dd.contains(e.target)) dd.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      window.Keyboard.handleKey(e, self.ctx());
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
        document.body.style.overflow = '';
      }
    });

    const fillInput = document.getElementById('fillInput');
    if (fillInput) fillInput.addEventListener('focus', () => { keepInputVisible(fillInput); });
    const shortInput = document.getElementById('shortInput');
    if (shortInput) shortInput.addEventListener('focus', () => { keepInputVisible(shortInput); });

    this._startPracticeTimer();
    const t0 = String(Math.floor(this.practiceSec / 60)).padStart(2, '0') + ':' + String(this.practiceSec % 60).padStart(2, '0');
    const mb = $('mbTimer'); if (mb) mb.textContent = t0;
    this.renderSidebar();
    this.renderQuestion();
  }
};

// ═══ 暴露 ═══
app.toggleTheme = function () {
  const cur = document.documentElement.getAttribute('data-theme');
  const currentTheme = THEME_ORDER.includes(cur) ? cur : 'orange';
  const next = THEME_TOGGLE_META[currentTheme].next;
  const nextMeta = THEME_TOGGLE_META[next];
  document.documentElement.setAttribute('data-theme', next);
  const themeToggle = $('themeToggle');
  if (themeToggle) {
    themeToggle.innerHTML = iconMarkup(nextMeta.icon);
    themeToggle.setAttribute('aria-label', nextMeta.label);
    themeToggle.setAttribute('title', nextMeta.label);
  }
  localStorage.setItem('quiz-hub-theme', next);
};

export { app as QuizApp };
window.QuizApp = app;

// HTML onclick 桥接（保持模板中的函数名不变）
window.toggleTheme = () => { app.toggleTheme(); };
window.toggleRandom = () => { app.toggleRandom(); };
window.toggleAutoReveal = () => { app.toggleAutoReveal(); };
window.resetPracticeTimer = () => { app.resetPracticeTimer(); };
window.toggleMobileSidebar = () => { app.toggleMobileSidebar(); };
window.onSearch = (val) => { app.onSearch(val); };
window.jumpToQ = (qid) => { app.jumpToQ(qid); };
window.toggleTypeExpand = (type, btn) => { app.toggleTypeExpand(type, btn); };
window.showWrongAnalysis = () => { app.showWrongAnalysis(); };
window.showResetModal = () => { app.showResetModal(); };
window.doResetProgress = () => { app.doResetProgress(); };
window.switchSetTab = (idx) => { app.switchSetTab(idx); };
window.setFilter = (f) => { app.setFilter(f); };
window.setTypeFilter = (t) => { app.setTypeFilter(t); };
window.toggleShortAnswer = () => { app.toggleShortAnswer(); };
window.exportShortAnswers = () => { app.exportShortAnswers(); };
window.exportLearningData = () => { app.exportLearningData(); };
window.importLearningDataFile = (event) => { app.importLearningDataFile(event); };
window.toggleStar = () => { app.toggleStar(); };
window.redoCurrentQuestion = () => { app.redoCurrentQuestion(); };
window.checkAnswer = () => { app.checkAnswer(); };
window.toggleAnswer = () => { app.toggleAnswer(); };
window.prevQuestion = () => { app.prevQuestion(); };
window.nextQuestion = () => { app.nextQuestion(); };
