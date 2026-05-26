// ===== 模块: app =====
// 职责: 应用状态中心 —— 集中管理全局状态、持久化、渲染入口与 HTML onclick 桥接
// 依赖: 01–10 全部前置模块
// 暴露: window.QuizApp

(function () {
  var $ = window.$;
  var CONFIG = window.CONFIG;
  var STORAGE_KEY = window.STORAGE_KEY;
  var SET_COUNT = window.SET_COUNT;
  var SET_SIZE = window.SET_SIZE;
  var questionTypes = window.questionTypes;
  var TYPE_LABELS = window.TYPE_LABELS;
  var TYPE_CLASS = window.TYPE_CLASS;

  var _init = window.QuizState.initSets();
  var data = _init.data;

  var app = {
    activeSet: data.activeSet || 0,
    filter: data.filter || 'all',
    sets: _init.sets,
    practiceSec: data.practiceSec || 0,
    randomMode: false,
    autoReveal: false,
    searchQuery: '',
    focusedOptIdx: -1,
    _saveTimer: null,

    activeSetData: function () { return this.sets[this.activeSet]; },

    getQuestionPool: function () {
      return window.Pool.getQuestionPool(this.activeSet);
    },

    filteredQuestions: function () {
      var self = this;
      return window.Pool.filteredQuestions(
        self.activeSet, self.filter, self.randomMode,
        function () { return self.activeSetData(); },
        self.searchQuery
      );
    },

    setActiveSet: function (v) { this.activeSet = v; },
    setFilter: function (v) { this.filter = v; },
    setFocusedOptIdx: function (v) { this.focusedOptIdx = v; },

    ctx: function () {
      var self = this;
      return {
        activeSet: self.activeSet,
        sets: self.sets,
        activeSetData: function () { return self.activeSetData(); },
        getQuestionPool: function () { return self.getQuestionPool(); },
        filteredQuestions: function () { return self.filteredQuestions(); },
        saveData: function () { return self.saveData(); },
        renderSidebar: function () { return self.renderSidebar(); },
        renderQuestion: function () { return self.renderQuestion(); },
        get focusedOptIdx() { return self.focusedOptIdx; },
        setFocusedOptIdx: function (v) { self.focusedOptIdx = v; },
        setActiveSet: function (v) { self.activeSet = v; },
        setFilter: function (v) { self.filter = v; }
      };
    },

    saveData: function () {
      var self = this;
      if (self._saveTimer) clearTimeout(self._saveTimer);
      self._saveTimer = setTimeout(function () { self._saveImmediate(); }, 300);
    },

    _saveImmediate: function () {
      this._saveTimer = null;
      var compact = {
        activeSet: this.activeSet,
        filter: this.filter,
        sets: this.sets.map(function (s) {
          return {
            userAnswers: s.userAnswers, revealedIds: s.revealedIds, currentIdx: s.currentIdx,
            typeFilter: s.typeFilter, stars: s.stars, expandedTypes: s.expandedTypes,
            wrongBank: s.wrongBank, shortAnswerBank: s.shortAnswerBank,
            streak: s.streak, bestStreak: s.bestStreak
          };
        }),
        practiceSec: this.practiceSec
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(compact)); }
      catch (e) { console.error('[saveData] 写入失败', e); }
    },

    renderSidebar: function () {
      var self = this;
      window.Render.sidebar({
        activeSet: self.activeSet,
        filter: self.filter,
        searchQuery: self.searchQuery,
        sets: self.sets,
        activeSetData: function () { return self.activeSetData(); },
        getQuestionPool: function () { return self.getQuestionPool(); },
        filteredQuestions: function () { return self.filteredQuestions(); },
        saveData: function () { return self.saveData(); }
      });
    },

    showAnswerBox: function (q) {
      var self = this;
      window.Render.answerBox({ activeSetData: function () { return self.activeSetData(); } }, q);
    },

    renderQuestion: function () {
      var self = this;
      var s = self.activeSetData();
      var list = self.filteredQuestions();
      var isShortLike = window.QuizState.isShortLike;
      var isAnswered = window.QuizState.isAnswered;

      if (list.length === 0) {
        var msg = self.filter === 'wrong' ? '历史错题库为空，太棒了！'
          : self.filter === 'star' ? '没有已标记的题目'
          : self.filter === 'origin' ? '当前题组没有原题'
          : self.searchQuery ? '没有匹配「' + self.searchQuery + '」的题目'
          : '暂无题目';
        $('qOptions').style.display = 'none';
        $('fillArea').style.display = 'none';
        $('shortArea').style.display = 'none';
        $('btnCheck').style.display = 'none';
        $('btnReveal').style.display = 'none';
        $('answerBox').classList.remove('show');
        $('resultMsg').classList.remove('show', 'right', 'wrong');
        $('qNum').textContent = '';
        $('qType').textContent = '';
        $('qText').innerHTML = '<div class="empty-state" style="padding:60px 0;text-align:center"><h3>' + msg + '</h3></div>';
        $('navInfo').textContent = '0 / 0';
        self.renderSidebar();
        return;
      }

      if (s.currentIdx >= list.length) s.currentIdx = 0;
      var q = list[s.currentIdx];

      if (q.type === 'single' || q.type === 'multi') {
        var curSel = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
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
      $('qText').textContent = q.q;
      $('navInfo').textContent = (s.currentIdx + 1) + ' / ' + list.length;
      $('moduleLabel').textContent = s.typeFilter === 'all' ? '全部题目'
        : (questionTypes.find(function (t) { return t.type === s.typeFilter; }) || {}).label || '';
      var st = s.streak || 0;
      $('streakNum').textContent = st;
      if (st > 0) window.Streak.setBadge(st, '🔥');

      var starBtn = $('starBtn');
      starBtn.textContent = s.stars[q.id] ? '★' : '☆';
      var saBtn = $('saBtn');
      saBtn.textContent = s.shortAnswerBank[q.id] ? '✅ 已转简答' : '📝 转简答';
      saBtn.className = 'sa-btn' + (s.shortAnswerBank[q.id] ? ' saved' : '');
      starBtn.className = 'star-btn' + (s.stars[q.id] ? ' starred' : '');

      var optDiv = $('qOptions');
      var fillDiv = $('fillArea');
      var shortDiv = $('shortArea');
      optDiv.innerHTML = '';
      optDiv.style.display = 'none';
      fillDiv.style.display = 'none';
      shortDiv.style.display = 'none';

      if (q.type === 'single' || q.type === 'multi') {
        optDiv.style.display = 'block';
        var inputType = q.type === 'single' ? 'radio' : 'checkbox';
        var groupName = 'q' + q.id;
        var saved = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
        var checked = (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false);

        q.opts.forEach(function (opt, i) {
          var div = document.createElement('div');
          div.className = 'opt';
          var isSelected = saved.indexOf(i) !== -1;
          if (isSelected) div.classList.add('selected');
          if (checked) {
            if (s.userAnswers[q.id] === true && q.ans.indexOf(i) !== -1) div.classList.add('correct');
            if (q.ans.indexOf(i) === -1 && isSelected) div.classList.add('wrong');
          }
          var letter = String.fromCharCode(65 + i);
          var chk = isSelected ? ' checked' : '';
          div.innerHTML = '<input type="' + inputType + '" name="' + groupName + '" value="' + i + '"' + chk + '><span class="letter">' + letter + '.</span><span class="text">' + opt.substring(3) + '</span>';
          div.setAttribute('data-opt-idx', i);
          div.addEventListener('click', function (e) {
            if (e.target.tagName === 'INPUT') return;
            if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false) return;
            var inp = div.querySelector('input');
            if (inputType === 'radio') {
              inp.checked = true;
              s.userAnswers[q.id] = [i];
            } else {
              inp.checked = !inp.checked;
              var checks = document.querySelectorAll('input[name="' + groupName + '"]:checked');
              s.userAnswers[q.id] = Array.from(checks).map(function (c) { return parseInt(c.value, 10); });
            }
            self.saveData();
            window.playBeep(600, 0.06, 'sine');
            self.renderQuestion();
          });
          optDiv.appendChild(div);
        });
      } else if (q.type === 'fill') {
        fillDiv.style.display = 'block';
        $('fillInput').value = (s.userAnswers[q.id] && typeof s.userAnswers[q.id] === 'string') ? s.userAnswers[q.id] : '';
      } else if (isShortLike(q.type)) {
        shortDiv.style.display = 'block';
        $('shortInput').value = (s.userAnswers[q.id] && typeof s.userAnswers[q.id] === 'string') ? s.userAnswers[q.id] : '';
      }

      $('btnCheck').style.display = '';
      $('btnReveal').style.display = '';
      $('answerBox').classList.remove('show');
      $('resultMsg').classList.remove('show', 'right', 'wrong');
      $('resultMsg').style.background = '';
      $('resultMsg').style.color = '';

      if (s.revealedIds[q.id]) self.showAnswerBox(q);

      var rm;
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

      if (s._fillFeedback && isAnswered(s, q)) {
        var fb = s._fillFeedback;
        rm = $('resultMsg');
        if (!rm.classList.contains('show')) {
          rm.textContent = '关键词：' + fb.map(function (h) {
            if (h.ok) return '✓ ' + h.kw;
            return '✗ ' + h.kw + (h.hint && h.hint !== '未找到' ? '（' + h.hint + '）' : '');
          }).join('  ');
          rm.className = 'result-msg show';
          rm.style.background = fb.every(function (h) { return h.ok; }) ? '#e8f5e9' : '#fff3e0';
          rm.style.color = fb.every(function (h) { return h.ok; }) ? '#2e7d32' : '#e65100';
        }
      }
      if (self.autoReveal && !isAnswered(s, q)) self.showAnswerBox(q);
      self.renderSidebar();
    },

    toggleTheme: function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? '' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      $('themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
      localStorage.setItem('dataviz_theme', next);
    },

    toggleRandom: function () {
      this.randomMode = !this.randomMode;
      window.Pool.invalidateShuffle();
      var chip = $('randomChip');
      chip.classList.toggle('random-on', this.randomMode);
      chip.style.background = this.randomMode ? '#fff3e0' : '';
      chip.style.color = this.randomMode ? '#e65100' : '';
      chip.style.borderColor = this.randomMode ? '#ffcc02' : '';
      this.activeSetData().currentIdx = 0;
      this.renderSidebar();
      this.renderQuestion();
    },

    toggleAutoReveal: function () {
      this.autoReveal = !this.autoReveal;
      var chip = $('autoRevealChip');
      if (chip) {
        chip.classList.toggle('active', this.autoReveal);
        chip.textContent = '🔍 答案' + (this.autoReveal ? ' ✓' : '');
      }
      if (!this.autoReveal) {
        var s = this.activeSetData();
        Object.keys(s.revealedIds).forEach(function (id) {
          if (s.userAnswers[id] !== true && s.userAnswers[id] !== false && s.userAnswers[id] !== 'submitted')
            delete s.revealedIds[id];
        });
      }
      this.renderQuestion();
    },

    resetPracticeTimer: function () {
      if (!confirm('确认把当前做题时间清零吗？此操作不影响答题进度。')) return;
      this.practiceSec = 0;
      var el = $('rpTimer');
      if (el) el.textContent = '00:00';
      var mb = $('mbTimer');
      if (mb) mb.textContent = '00:00';
      this.saveData();
    },

    toggleMobileSidebar: function () {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarOverlay').classList.toggle('show');
    },

    onSearch: function (val) {
      this.searchQuery = val.trim().toLowerCase();
      this.activeSetData().currentIdx = 0;
      window.Pool.invalidateShuffle();
      this.renderSidebar();
      this.renderQuestion();
    },

    jumpToQ: function (qid) {
      var s = this.activeSetData();
      var list = this.filteredQuestions();
      var idx = list.findIndex(function (x) { return x.id === qid; });
      if (idx >= 0) {
        s.currentIdx = idx;
        this.saveData();
        this.renderSidebar();
        this.renderQuestion();
        if (window.innerWidth <= 768) this.toggleMobileSidebar();
      }
    },

    toggleTypeExpand: function (type, btn) {
      var self = this;
      window.Render.toggleTypeExpand({
        activeSetData: function () { return self.activeSetData(); },
        saveData: function () { return self.saveData(); }
      }, type, btn);
    },

    checkAnswer: function () { window.Actions.checkAnswer(this.ctx()); },
    toggleAnswer: function () { window.Actions.toggleAnswer(this.ctx()); },
    prevQuestion: function () { window.Actions.prevQuestion(this.ctx()); },
    nextQuestion: function () { window.Actions.nextQuestion(this.ctx()); },
    toggleStar: function () { window.Actions.toggleStar(this.ctx()); },
    redoCurrentQuestion: function () { window.Actions.redoCurrentQuestion(this.ctx()); },
    switchSetTab: function (idx) { window.Actions.switchSetTab(this.ctx(), idx); },
    setFilter: function (f) { window.Actions.setFilter(this.ctx(), f); },
    setTypeFilter: function (t) { window.Actions.setTypeFilter(this.ctx(), t); },
    showWrongAnalysis: function () { window.Tools.showWrongAnalysis(this.ctx()); },
    showResetModal: function () { window.Tools.showResetModal(); },
    doResetProgress: function () { window.Tools.doResetProgress(this.ctx()); },
    toggleShortAnswer: function () { window.Tools.toggleShortAnswer(this.ctx()); },
    exportShortAnswers: function () { window.Tools.exportShortAnswers(this.ctx()); },

    _startPracticeTimer: function () {
      var self = this;
      var formatTime = function (sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      };
      setInterval(function () {
        self.practiceSec++;
        var t = formatTime(self.practiceSec);
        var el = $('rpTimer');
        if (el) el.textContent = t;
        var mb = $('mbTimer');
        if (mb) mb.textContent = t;
      }, 1000);
    },

    boot: function () {
      if (this.activeSet >= SET_COUNT || this.activeSet < 0) this.activeSet = 0;

      window.Init.initTheme();
      document.title = CONFIG.pageTitle;
      var el;
      el = $('sidebarTitle'); if (el) el.textContent = CONFIG.sidebarTitle;
      el = $('mobileTitle'); if (el) el.textContent = CONFIG.mobileTitle;
      el = $('setSizeLabel'); if (el) el.textContent = SET_SIZE;
      window.Init.setupSetTabs(this.activeSet, CONFIG.setNames);

      var self = this;
      window.addEventListener('beforeunload', function () {
        if (self._saveTimer) { clearTimeout(self._saveTimer); self._saveImmediate(); }
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && self._saveTimer) { clearTimeout(self._saveTimer); self._saveImmediate(); }
      });
      document.addEventListener('click', function (e) {
        var dd = document.querySelector('.tools-dropdown');
        if (dd && !dd.contains(e.target)) dd.classList.remove('open');
      });
      document.addEventListener('keydown', function (e) {
        window.Keyboard.handleKey(e, self.ctx());
      });

      this._startPracticeTimer();
      var t0 = String(Math.floor(this.practiceSec / 60)).padStart(2, '0') + ':' + String(this.practiceSec % 60).padStart(2, '0');
      var mb = $('mbTimer'); if (mb) mb.textContent = t0;
      this.renderSidebar();
      this.renderQuestion();
    }
  };

  window.QuizApp = app;

  // HTML onclick 桥接（保持模板中的函数名不变）
  window.toggleTheme = function () { app.toggleTheme(); };
  window.toggleRandom = function () { app.toggleRandom(); };
  window.toggleAutoReveal = function () { app.toggleAutoReveal(); };
  window.resetPracticeTimer = function () { app.resetPracticeTimer(); };
  window.toggleMobileSidebar = function () { app.toggleMobileSidebar(); };
  window.onSearch = function (val) { app.onSearch(val); };
  window.jumpToQ = function (qid) { app.jumpToQ(qid); };
  window.toggleTypeExpand = function (type, btn) { app.toggleTypeExpand(type, btn); };
  window.showWrongAnalysis = function () { app.showWrongAnalysis(); };
  window.showResetModal = function () { app.showResetModal(); };
  window.doResetProgress = function () { app.doResetProgress(); };
  window.switchSetTab = function (idx) { app.switchSetTab(idx); };
  window.setFilter = function (f) { app.setFilter(f); };
  window.setTypeFilter = function (t) { app.setTypeFilter(t); };
  window.toggleShortAnswer = function () { app.toggleShortAnswer(); };
  window.exportShortAnswers = function () { app.exportShortAnswers(); };
  window.toggleStar = function () { app.toggleStar(); };
  window.redoCurrentQuestion = function () { app.redoCurrentQuestion(); };
  window.checkAnswer = function () { app.checkAnswer(); };
  window.toggleAnswer = function () { app.toggleAnswer(); };
  window.prevQuestion = function () { app.prevQuestion(); };
  window.nextQuestion = function () { app.nextQuestion(); };
})();
