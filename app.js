const STORAGE_KEY = 'dataviz_quiz_v3'; // v3: typeFilter+expand
const EXAM_TIME = 45 * 60; // 45分钟

// 固定2套题: 题组0=前100题, 题组1=后100题
const SET_0 = questions.slice(0, 100).map((_,i) => i);
const SET_1 = questions.slice(100, 200).map((_,i) => i + 100);

function defaultSetData() {
  return { userAnswers:{}, revealedIds:{}, currentIdx:0, typeFilter:'all', stars:{}, expandedTypes:{} };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { activeSet:0, filter:'all', sets:[defaultSetData(), defaultSetData()], examDone:false };
}

function saveData() {
  const compact = {
    activeSet, filter,
    sets: sets.map(s => ({ userAnswers:s.userAnswers, revealedIds:s.revealedIds, currentIdx:s.currentIdx, typeFilter:s.typeFilter, stars:s.stars, expandedTypes:s.expandedTypes })),
    examDone,
    practiceSec
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
}

// ========== 应用状态 ==========
let data = loadData();
let activeSet = data.activeSet || 0;
let filter = data.filter || 'all';  // 'all', 'wrong', 'star'
let sets = data.sets || [defaultSetData(), defaultSetData()];
// 兼容旧数据：补充缺失字段
sets.forEach(s => {
  if (!s.expandedTypes) s.expandedTypes = {};
  if (!s.stars) s.stars = {};
  if (!s.typeFilter) s.typeFilter = 'all';
});
let examMode = false;
let examTimer = null;
let examTimeLeft = EXAM_TIME;
let examDone = data.examDone || false;
let practiceSec = data.practiceSec || 0;
let practiceTimer = setInterval(function(){
  practiceSec++;
  const m = Math.floor(practiceSec/60), s = practiceSec%60;
  const el = document.getElementById('rpTimer');
  if (el) el.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}, 1000);
let focusedOptIdx = -1; // ↑↓ navigation

function activeSetData() { return sets[activeSet]; }

const TYPE_ORDER = {single:0, multi:1, fill:2, short:3};
function getQuestionPool() {
  const indices = activeSet === 0 ? SET_0 : SET_1;
  return indices.map(i => questions[i]).sort((a,b) => (TYPE_ORDER[a.type]||0) - (TYPE_ORDER[b.type]||0));
}

function filteredQuestions() {
  const s = activeSetData();
  let pool = getQuestionPool();
  // Type filter
  if (s.typeFilter !== 'all') pool = pool.filter(q => q.type === s.typeFilter);
  // Wrong/star filter
  if (filter === 'wrong') pool = pool.filter(q => s.userAnswers[q.id] === false);
  if (filter === 'star') pool = pool.filter(q => s.stars[q.id]);
  if (randomMode && pool.length > 1) {
    const curQ = pool[activeSetData().currentIdx];
    for (let i = pool.length-1; i>0; i--) { const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
    const newIdx = curQ ? pool.findIndex(q=>q.id===curQ.id) : 0;
    activeSetData().currentIdx = Math.max(0, newIdx);
  }
  return pool;
}

// ========== 渲染侧边栏 ==========
function renderSidebar() {
  const s = activeSetData();
  const pool = getQuestionPool();
  const nav = document.getElementById('moduleNav');
  const eid = 'qt_'; // unique id for current render
  let html = '<button class="module-btn'+(s.typeFilter==='all'?' active':'')+'" onclick="setTypeFilter(&apos;all&apos;)">全部</button>';
  questionTypes.forEach(tt => {
    const qs = pool.filter(q => q.type === tt.type);
    const done = qs.filter(q => s.userAnswers[q.id] !== undefined);
    const active = s.typeFilter === tt.type ? ' active' : '';
    const isOpen = s.expandedTypes[tt.type] || s.typeFilter === tt.type;
    s.expandedTypes[tt.type] = isOpen;
    html += '<button class="module-btn'+active+(isOpen?' open':'')+'" onclick="toggleTypeExpand(&apos;'+tt.type+'&apos;,this)"><span class="expand-arrow">▶</span>'+tt.short+' <span class="type-q-count">'+done.length+'/'+qs.length+'</span></button>';
    html += '<div class="qnum-grid'+(isOpen?' open':'')+'" id="'+eid+tt.type+'">';
    qs.forEach((q, qi) => {
      const localNum = qi + 1;
      let cls = 'qnum-dot';
      if (s.userAnswers[q.id] === true) cls += ' done-right';
      else if (s.userAnswers[q.id] === false) cls += ' done-wrong';
      if (s.stars[q.id]) cls += ' starred';
      html += '<div class="'+cls+'" onclick="event.stopPropagation();jumpToQ('+q.id+')" title="第'+localNum+'题">'+localNum+'</div>';
    });
    html += '</div>';
  });
  nav.innerHTML = html;

  // 套题切换按钮
  document.querySelectorAll('.set-tab').forEach((btn, i) => {
    btn.classList.toggle('active', i === activeSet);
    const sData = sets[i];
    const done = Object.keys(sData.userAnswers).length;
    btn.textContent = '题组'+(i===0?'一':'二')+' ('+done+'/100)';
  });

  // 筛选按钮状态
  document.getElementById('filterAll').classList.toggle('active', filter==='all');
  const fw = document.getElementById('filterWrong');
  fw.classList.toggle('active', filter==='wrong');
  if (filter==='wrong') fw.classList.add('wrong-mode'); else fw.classList.remove('wrong-mode');
  document.getElementById('filterStar').classList.toggle('active', filter==='star');

  // 显示填空题逐词反馈
  if (s._fillFeedback && (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false || s.userAnswers[q.id] === 'submitted')) {
    const fb = s._fillFeedback;
    const rm = document.getElementById('resultMsg');
    if (!rm.classList.contains('show')) {
      rm.textContent = '关键词：'+fb.map(h=>(h.ok?'✓':'✗')+' '+h.kw).join('  ');
      rm.className = 'result-msg show';
      rm.style.background = fb.every(h=>h.ok) ? '#e8f5e9' : '#fff3e0';
      rm.style.color = fb.every(h=>h.ok) ? '#2e7d32' : '#e65100';
    }
  }
  updateStats();
}

function updateStats() {
  const s = activeSetData();
  const pool = getQuestionPool();
  const allDone = pool.filter(q => s.userAnswers[q.id] !== undefined);
  const right = allDone.filter(q => s.userAnswers[q.id] === true).length;
    document.getElementById('rpDone').textContent = allDone.length;
  document.getElementById('rpAcc').textContent = allDone.length > 0 ? Math.round(right/allDone.length*100)+'%' : '-';
  const gDone0 = Object.keys(sets[0].userAnswers).length;
  const gDone1 = Object.keys(sets[1].userAnswers).length;
  const gTotal = gDone0 + gDone1;
  document.getElementById('rpGlobal').textContent = gTotal;
  const gRight0 = Object.values(sets[0].userAnswers).filter(v=>v===true).length;
  const gRight1 = Object.values(sets[1].userAnswers).filter(v=>v===true).length;
  document.getElementById('rpGlobalPct').textContent = gTotal > 0 ? '正确率 '+Math.round((gRight0+gRight1)/gTotal*100)+'%' : '-';
  const list = filteredQuestions();
  const fDone = list.filter(q => s.userAnswers[q.id] !== undefined).length;
  document.getElementById('rpBarFill').style.width = list.length > 0 ? (fDone/list.length*100)+'%' : '0%';
  document.getElementById('rpLabel').textContent = fDone + ' / ' + list.length;
  let modHtml = '';
  questionTypes.forEach(tt => {
    const qs = pool.filter(q => q.type === tt.type);
    const done = qs.filter(q => s.userAnswers[q.id] !== undefined).length;
    const pct = qs.length > 0 ? Math.round(done/qs.length*100) : 0;
    modHtml += '<div class="m-row"><div class="m-name">'+tt.short+' <span>'+done+'/'+qs.length+'</span></div><div class="m-bar"><div class="fill" style="width:'+pct+'%"></div></div></div>';
  });
  document.getElementById('rpModules').innerHTML = modHtml;
  saveData();
}

// ========== 题型展开/折叠 + 跳转 ==========
function toggleTypeExpand(type, btn) {
  const s = activeSetData();
  const grid = btn.nextElementSibling;
  const isOpen = !s.expandedTypes[type];
  s.expandedTypes[type] = isOpen;
  if (grid) {
    grid.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
  }
  saveData();
}

function jumpToQ(qid) {
  const s = activeSetData();
  const pool = getQuestionPool();
  const q = pool.find(q => q.id === qid);
  if (!q) return;
  // Switch to all filter and all types
  filter = 'all';
  data.filter = 'all';
  s.typeFilter = 'all';
  // Find index in full pool
  const list = filteredQuestions();
  // But first, we need filter to be 'all' and typeFilter to be 'all' for filteredQuestions to return all
  // Since we just set both, proceed
  const idx = list.findIndex(x => x.id === qid);
  if (idx >= 0) {
    s.currentIdx = idx;
    saveData();
    renderSidebar();
    renderQuestion();
  }
}

// ========== 随机模式 ==========
let randomMode = false;
function toggleRandom() {
  randomMode = !randomMode;
  document.getElementById('randomChip').classList.toggle('random-on', randomMode);
  document.getElementById('randomChip').style.background = randomMode ? '#fff3e0' : '';
  document.getElementById('randomChip').style.color = randomMode ? '#e65100' : '';
  document.getElementById('randomChip').style.borderColor = randomMode ? '#ffcc02' : '';
  activeSetData().currentIdx = 0;
  renderSidebar();
  renderQuestion();
}

function showWrongAnalysis() {
  const s = activeSetData();
  const pool = getQuestionPool();
  const wrong = pool.filter(q => s.userAnswers[q.id] === false);
  if (wrong.length === 0) { alert('当前题组没有错题，太棒了！'); return; }
  const byType = {};
  wrong.forEach(q => {
    const label = q.type==='single'?'单选题':q.type==='multi'?'多选题':q.type==='fill'?'填空题':'简答题';
    if (!byType[label]) byType[label] = [];
    byType[label].push(q);
  });
  let waHtml = '<p style="color:var(--text-muted);margin-bottom:12px">共 '+wrong.length+' 道错题</p>';
  for (const [label, qs] of Object.entries(byType)) {
    waHtml += '<div class="wa-mod"><div class="wa-mod-name" onclick="this.nextElementSibling.classList.toggle(\'open\')">'+label+' ('+qs.length+'题) \u25b8</div>';
    waHtml += '<div class="wa-qlist">';
    qs.forEach(q => {
      waHtml += '<span class="wa-qdot" onclick="document.getElementById(\'wrongModal\').classList.remove(\'show\');jumpToQ('+q.id+')">#'+q.id+'</span>';
    });
    waHtml += '</div></div>';
  }
  document.getElementById('wrongAnalysis').innerHTML = waHtml;
  document.getElementById('wrongModal').classList.add('show');
}

// ========== 套题/筛选切换 ==========
function switchSetTab(idx) {
  activeSet = idx;
  data.activeSet = idx;
  filter = 'all';
  saveData();
  renderSidebar();
  renderQuestion();
}

function setFilter(f) {
  filter = f;
  data.filter = f;
  activeSetData().currentIdx = 0;
  // Ensure filter chip states update immediately
  document.getElementById('filterAll').classList.toggle('active', f==='all');
  document.getElementById('filterWrong').classList.toggle('active', f==='wrong');
  document.getElementById('filterStar').classList.toggle('active', f==='star');
  const fw = document.getElementById('filterWrong');
  if (f==='wrong') fw.classList.add('wrong-mode'); else fw.classList.remove('wrong-mode');
  saveData();
  renderSidebar();
  renderQuestion();
}

function setTypeFilter(t) {
  const s = activeSetData();
  // Toggle: if clicking same type, go back to all; don't reset index for 'all'
  if (s.typeFilter === t) { s.typeFilter = 'all'; }
  else { s.typeFilter = t; s.currentIdx = 0; }
  saveData();
  renderSidebar();
  renderQuestion();
}

function jumpToQuestion() {
  const input = document.getElementById('jumpInput');
  const num = parseInt(input.value);
  if (isNaN(num)) return;
  const pool = getQuestionPool();
  const q = pool.find(q => q.id === num);
  if (!q) { alert('题号不存在于当前题组'); return; }
  const list = filteredQuestions();
  const idx = list.findIndex(x => x.id === num);
  if (idx < 0) {
    // 该题在当前筛选中不可见
    if (!confirm('题号 #'+num+' 不在当前筛选中，是否切换至\"全部题目\"？')) { input.value = ''; return; }
    filter = 'all';
    data.filter = 'all';
    activeSetData().currentIdx = 0;
    const newList = filteredQuestions();
    const newIdx = newList.findIndex(x => x.id === num);
    if (newIdx >= 0) activeSetData().currentIdx = newIdx;
  } else {
    activeSetData().currentIdx = idx;
  }
  input.value = '';
  saveData();
  renderQuestion();
}

// ========== ⭐ 标记 ==========
function toggleStar() {
  const s = activeSetData();
  const list = filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  s.stars[q.id] = !s.stars[q.id];
  saveData();
  renderQuestion();
}

// ========== 模拟考试 ==========
function toggleExamMode() {
  if (examMode) { submitExam(); return; }
  if (!confirm('开始模拟考试？\n\n规则：\n• 45分钟倒计时\n• 答案按钮被禁用\n• 时间到或点击交卷后显示成绩\n\n当前进度将被保留。')) return;
  examMode = true;
  examTimeLeft = EXAM_TIME;
  document.getElementById('examBanner').classList.add('show');
  document.getElementById('btnReveal').style.display = 'none';
  document.getElementById('examNotice').style.display = 'inline';
  document.getElementById('btnExam').textContent = '交卷';
  document.getElementById('btnExam').style.background = '#f44336';
  document.getElementById('btnExam').style.color = '#fff';
  updateExamTimer();
  examTimer = setInterval(tickExam, 1000);
}

function tickExam() {
  examTimeLeft--;
  updateExamTimer();
  if (examTimeLeft <= 0) submitExam();
}

function updateExamTimer() {
  const m = Math.floor(examTimeLeft / 60);
  const s = examTimeLeft % 60;
  const timer = document.getElementById('examTimer');
  timer.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  timer.className = 'timer' + (examTimeLeft < 300 ? ' danger' : examTimeLeft < 600 ? ' warning' : '');
}

function submitExam() {
  examMode = false;
  if (examTimer) { clearInterval(examTimer); examTimer = null; }
  document.getElementById('examBanner').classList.remove('show');
  document.getElementById('btnReveal').style.display = '';
  document.getElementById('examNotice').style.display = 'none';
  document.getElementById('btnExam').textContent = '模拟考试';
  document.getElementById('btnExam').style.background = '';
  document.getElementById('btnExam').style.color = '';
  const s = activeSetData();
  const pool = getQuestionPool();
  const done = pool.filter(q => s.userAnswers[q.id] !== undefined);
  const right = done.filter(q => s.userAnswers[q.id] === true).length;
  const score = right;
  const total = done.length;
  alert('考试结束！\n\n已完成：'+total+' / 100 题\n正确：'+right+' 题\n正确率：'+(total>0?Math.round(right/total*100):0)+'%\n\n（仅统计已作答的题目）');
  examDone = true;
  saveData();
  renderQuestion();
}

// ========== 渲染题目 ==========
function renderQuestion() {
  const s = activeSetData();
  const list = filteredQuestions();
  if (list.length === 0) {
    const msg = filter==='wrong' ? '没有错题，太棒了！' : filter==='star' ? '没有已标记的题目' : '暂无题目';
    document.getElementById('questionCard').innerHTML = '<div class="empty-state"><h3>'+msg+'</h3></div>';
    updateStats();
    return;
  }
  if (s.currentIdx >= list.length) s.currentIdx = 0;
  const q = list[s.currentIdx];
  if (!q) { document.getElementById('questionCard').innerHTML = '<div class="empty-state"><h3>暂无题目</h3></div>'; return; }

    // Keep focusedOptIdx at last selected option, or first option
  if (q.type === 'single' || q.type === 'multi') {
    const curSel = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
    if (curSel.length > 0) focusedOptIdx = curSel[0];
    else if (focusedOptIdx < 0 || focusedOptIdx >= q.opts.length) focusedOptIdx = 0;
    else focusedOptIdx = Math.min(focusedOptIdx, q.opts.length - 1);
  } else {
    focusedOptIdx = -1;
  }
  const typeLabels = {single:'单选题', multi:'多选题', fill:'填空题', short:'简答题'};
  const typeClass = {single:'single', multi:'multi', fill:'fill', short:'short'};
  document.getElementById('qNum').textContent = '第 '+(list.indexOf(q)+1)+' 题';
  document.getElementById('qType').textContent = typeLabels[q.type];
  document.getElementById('qType').className = 'q-type '+typeClass[q.type];
  document.getElementById('qText').textContent = q.q;
  document.getElementById('navInfo').textContent = (s.currentIdx+1)+' / '+list.length;
  document.getElementById('moduleLabel').textContent = s.typeFilter==='all'?'全部题目':(questionTypes.find(t=>t.type===s.typeFilter)?.label||'');

  // Star button
  const starBtn = document.getElementById('starBtn');
  starBtn.textContent = s.stars[q.id] ? '★' : '☆';
  starBtn.className = 'star-btn' + (s.stars[q.id] ? ' starred' : '');

  const optDiv = document.getElementById('qOptions');
  const fillDiv = document.getElementById('fillArea');
  const shortDiv = document.getElementById('shortArea');
  optDiv.innerHTML = '';
  optDiv.style.display = 'none';
  fillDiv.style.display = 'none';
  shortDiv.style.display = 'none';

  if (q.type === 'single' || q.type === 'multi') {
    optDiv.style.display = 'block';
    const inputType = q.type === 'single' ? 'radio' : 'checkbox';
    const groupName = 'q'+q.id;
    const saved = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
    const checked = (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false);

    q.opts.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'opt';
      const isSelected = saved.includes(i);
      if (isSelected) div.classList.add('selected');
      if (checked) {
        if (q.ans.includes(i)) div.classList.add('correct');
        if (!q.ans.includes(i) && isSelected) div.classList.add('wrong');
      }
      const letter = String.fromCharCode(65+i);
      const chk = isSelected ? ' checked' : '';
      div.innerHTML = '<input type="'+inputType+'" name="'+groupName+'" value="'+i+'"'+chk+'><span class="letter">'+letter+'.</span><span class="text">'+opt.substring(3)+'</span>';
      div.setAttribute('data-opt-idx', i);
      div.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT') return;
        const inp = div.querySelector('input');
        if (inputType === 'radio') {
          inp.checked = true;
          s.userAnswers[q.id] = [i];
        } else {
          inp.checked = !inp.checked;
          const checks = document.querySelectorAll('input[name="'+groupName+'"]:checked');
          s.userAnswers[q.id] = Array.from(checks).map(c => parseInt(c.value));
        }
        saveData();
        renderQuestion();
      });
      optDiv.appendChild(div);
    });
  } else if (q.type === 'fill') {
    fillDiv.style.display = 'block';
    const fi = document.getElementById('fillInput');
    fi.value = (s.userAnswers[q.id] && typeof s.userAnswers[q.id] === 'string') ? s.userAnswers[q.id] : '';
  } else if (q.type === 'short') {
    shortDiv.style.display = 'block';
    const si = document.getElementById('shortInput');
    si.value = (s.userAnswers[q.id] && typeof s.userAnswers[q.id] === 'string') ? s.userAnswers[q.id] : '';
  }

  document.getElementById('answerBox').classList.remove('show');
  document.getElementById('resultMsg').classList.remove('show','right','wrong');
  document.getElementById('resultMsg').style.background = '';
  document.getElementById('resultMsg').style.color = '';

  if (s.revealedIds[q.id]) showAnswerBox(q);
  if (s.userAnswers[q.id] === true) {
    const rm = document.getElementById('resultMsg');
    rm.textContent = '✓ 回答正确！';
    rm.className = 'result-msg right show';
  } else if (s.userAnswers[q.id] === false) {
    const rm = document.getElementById('resultMsg');
    rm.textContent = '✗ 回答错误';
    rm.className = 'result-msg wrong show';
  } else if (s.userAnswers[q.id] === 'submitted') {
    const rm = document.getElementById('resultMsg');
    rm.textContent = '已提交。请对照参考答案自行评判。';
    rm.className = 'result-msg show';
    rm.style.background = '#fff3e0';
    rm.style.color = '#e65100';
  }

    const done = (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false || s.userAnswers[q.id] === 'submitted');
  document.getElementById('btnCheck').disabled = done;
  document.getElementById('btnRetry').style.display = done ? '' : 'none';

  // Exam mode: hide answer button
  if (examMode) {
    document.getElementById('btnReveal').style.display = 'none';
    document.getElementById('examNotice').style.display = 'inline';
  }
  // 显示填空题逐词反馈
  if (s._fillFeedback && (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false || s.userAnswers[q.id] === 'submitted')) {
    const fb = s._fillFeedback;
    const rm = document.getElementById('resultMsg');
    if (!rm.classList.contains('show')) {
      rm.textContent = '关键词：'+fb.map(h=>(h.ok?'✓':'✗')+' '+h.kw).join('  ');
      rm.className = 'result-msg show';
      rm.style.background = fb.every(h=>h.ok) ? '#e8f5e9' : '#fff3e0';
      rm.style.color = fb.every(h=>h.ok) ? '#2e7d32' : '#e65100';
    }
  }
  updateStats();
}

function retryQuestion() {
  const s = activeSetData();
  const list = filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  delete s.userAnswers[q.id];
  delete s.revealedIds[q.id];
  delete s._fillFeedback;
  saveData();
  renderQuestion();
}

function checkAnswer() {
  const s = activeSetData();
  const list = filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  if (s.userAnswers[q.id] === true || s.userAnswers[q.id] === false || s.userAnswers[q.id] === 'submitted') return;

  let isCorrect = null;
  let fillFeedback = null; // 填空题逐词反馈
  if (q.type === 'single' || q.type === 'multi') {
    const selected = s.userAnswers[q.id] || [];
    if (!Array.isArray(selected) || selected.length === 0) { alert('请先选择答案'); return; }
    const corr = new Set(q.ans), sel = new Set(selected);
    isCorrect = corr.size === sel.size && [...corr].every(v => sel.has(v));
  } else if (q.type === 'fill') {
    const input = document.getElementById('fillInput').value.trim();
    if (!input) { alert('请输入你的答案'); return; }
    s.userAnswers[q.id] = input;
    // 逐词检查并生成反馈
    const normalized = input.replace(/\s+/g,'').toLowerCase();
    const keywords = q.ansText.split('|');
    const hits = keywords.map(kw => {
      const nkw = kw.trim().replace(/\s+/g,'').toLowerCase();
      return { kw: kw.trim(), ok: normalized.includes(nkw) };
    });
    isCorrect = hits.every(h => h.ok);
    fillFeedback = hits;
  } else if (q.type === 'short') {
    const input = document.getElementById('shortInput').value.trim();
    if (!input) { alert('请输入你的答案或直接点击"显示答案"对照'); return; }
    s.userAnswers[q.id] = 'submitted';
    if (!examMode) showAnswerBox(q);
    saveData();
    renderQuestion();
    return;
  }

  s.userAnswers[q.id] = isCorrect;
  // 答对才显示答案；答错只标红，不泄露正确选项，用户可手动点"显示答案"
  // 答对才显示完整答案；答错只标红，用户可手动点"显示答案"
  if (isCorrect && !examMode) showAnswerBox(q);
  // 填空答错：显示逐词反馈(关键词匹配状态)，不暴露完整答案
  if (!isCorrect && q.type === 'fill' && fillFeedback) {
    const ab = document.getElementById('answerBox');
    document.getElementById('ansContent').textContent = '关键词匹配：'+fillFeedback.map(h=> (h.ok?'✓':'✗')+h.kw).join('  ');
    document.getElementById('ansExplanation').textContent = '';
    ab.classList.add('show');
    activeSetData().revealedIds[q.id] = true;
  }
  // 存储填空反馈供 renderQuestion 使用
  if (q.type === 'fill' && fillFeedback) s._fillFeedback = fillFeedback;
  saveData();
  renderQuestion();
}

function toggleAnswer() {
  if (examMode) return;
  const s = activeSetData();
  const list = filteredQuestions();
  const q = list[s.currentIdx];
  if (!q) return;
  if (document.getElementById('answerBox').classList.contains('show')) {
    document.getElementById('answerBox').classList.remove('show');
    s.revealedIds[q.id] = false;
  } else {
    showAnswerBox(q);
  }
  saveData();
}

function showAnswerBox(q) {
  activeSetData().revealedIds[q.id] = true;
  const ab = document.getElementById('answerBox');
  ab.classList.add('show');
  if (q.type === 'single' || q.type === 'multi') {
    const letters = q.ans.map(i => String.fromCharCode(65+i));
    document.getElementById('ansContent').textContent = '正确答案：'+letters.join(' + ')+' — '+q.ans.map(i => q.opts[i].substring(3)).join('；');
  } else if (q.type === 'fill') {
    document.getElementById('ansContent').textContent = '参考答案：'+q.ansText.replace(/\|/g, '、');
  } else {
    document.getElementById('ansContent').textContent = q.ansText;
  }
    document.getElementById('ansExplanation').textContent = q.exp ? '解析：'+q.exp : '';
  // 填空反馈也显示在答案区
  if (q.type === 'fill' && activeSetData()._fillFeedback) {
    const fb = activeSetData()._fillFeedback;
    document.getElementById('ansContent').textContent += ' | 你的匹配：'+fb.map(h=>(h.ok?'✓':'✗')+h.kw).join(' ');
  }
}

function prevQuestion() {
  const s = activeSetData();
  if (s.currentIdx > 0) { s.currentIdx--; saveData(); renderQuestion(); }
}
function nextQuestion() {
  const s = activeSetData();
  const list = filteredQuestions();
  if (s.currentIdx < list.length-1) { s.currentIdx++; saveData(); renderQuestion(); }
}

// ========== 键盘快捷键 ==========
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowLeft') { prevQuestion(); return; }
  if (e.key === 'ArrowRight') { nextQuestion(); return; }
  if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
    const s = activeSetData();
    const list = filteredQuestions();
    const q = list[s.currentIdx];
    if (q && (q.type === 'single' || q.type === 'multi') && focusedOptIdx >= 0) {
      const cur = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
      // If single-choice and focused option already selected → check answer
      if (q.type === 'single' && cur.length === 1 && cur[0] === focusedOptIdx) {
        checkAnswer();
      } else if (q.type === 'multi' && cur.includes(focusedOptIdx) && cur.length > 0) {
        // Multi-choice: pressing already-selected option toggles it off
        e.preventDefault();
        s.userAnswers[q.id] = cur.filter(v => v !== focusedOptIdx);
        if (s.userAnswers[q.id].length === 0) focusedOptIdx = -1;
        saveData();
        renderQuestion();
      } else {
        e.preventDefault();
        if (q.type === 'single') s.userAnswers[q.id] = [focusedOptIdx];
        else s.userAnswers[q.id] = [...cur, focusedOptIdx];
        saveData();
        renderQuestion();
      }
      // Don't return — keep focus for ↑↓ navigation
    } else {
      checkAnswer();
    }
    return;
  }
  if (e.key === ' ') { e.preventDefault(); toggleAnswer(); return; }
  // ↑↓ 选项导航
  if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && document.getElementById('qOptions').style.display !== 'none') {
    e.preventDefault();
    const opts = document.querySelectorAll('#qOptions .opt');
    if (opts.length === 0) return;
    opts[focusedOptIdx].classList.remove('focused');
    if (e.key === 'ArrowUp') focusedOptIdx = Math.max(0, focusedOptIdx - 1);
    else focusedOptIdx = Math.min(opts.length - 1, focusedOptIdx + 1);
    opts[focusedOptIdx].classList.add('focused');
    opts[focusedOptIdx].scrollIntoView({block:'nearest'});
    return;
  }
  // 1-4 对应 ABCD
  if (['1','2','3','4'].includes(e.key)) {
    const s = activeSetData();
    const list = filteredQuestions();
    const q = list[s.currentIdx];
    if (q && (q.type === 'single' || q.type === 'multi')) {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      if (idx < q.opts.length) {
                if (q.type === 'single') {
          const cur1 = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
          if (cur1.length === 1 && cur1[0] === idx) s.userAnswers[q.id] = [];
          else s.userAnswers[q.id] = [idx];
        } else {
          const cur = (s.userAnswers[q.id] && Array.isArray(s.userAnswers[q.id])) ? s.userAnswers[q.id] : [];
          if (cur.includes(idx)) { s.userAnswers[q.id] = cur.filter(v => v !== idx); }
          else { s.userAnswers[q.id] = [...cur, idx]; }
        }
        saveData();
        renderQuestion();
      }
    }
  }
});

// ========== 初始化 ==========
renderSidebar();
renderQuestion();