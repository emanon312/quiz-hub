// ===== 模块: streak =====
// 职责: 连对里程碑视觉反馈 —— 徽章 / banner 弹幕 / 进度条 / 断连提示
// 依赖: 01-utils ($, pick), config (MILESTONE_MSGS, BREAK_MSGS, STREAK_MILESTONES, STREAK_MILESTONE_EMOJI)
// 暴露: window.Streak = { setBadge, checkMilestone, showBreak }

(function () {
  var $ = window.$;
  var pick = window.pick;
  var MILESTONE_MSGS = window.MILESTONE_MSGS;
  var BREAK_MSGS = window.BREAK_MSGS;
  var STREAK_MILESTONES = window.STREAK_MILESTONES;
  var STREAK_MILESTONE_EMOJI = window.STREAK_MILESTONE_EMOJI;

  // ═══ 分层连对图标 ═══
  function getStreakIcon(st) {
    if (st >= 30) return '👑';
    if (st >= 20) return '💎';
    if (st >= 10) return '🔥🔥';
    if (st >= 5) return '🔥';
    if (st >= 3) return '❤️‍🔥';
    return '🔥';
  }

  // ═══ 连对徽章三态切换 ═══
  function setStreakBadge(streak, fire) {
    var b = $('streakBadge'); if (!b) return;
    $('streakNum').textContent = streak;
    if (streak > 0) {
      b.style.display = 'inline-flex';
      b.classList.remove('dormant');
      b.querySelector('.fire').textContent = getStreakIcon(streak);
      b.classList.add('just-fired');
      setTimeout(function () { b.classList.remove('just-fired'); }, 500);
    } else if (fire === '🧯') {
      b.style.display = 'inline-flex';
      b.classList.add('dormant');
      b.querySelector('.fire').textContent = '🧯';
    }
    updateStreakProgress(streak);
  }

  // ═══ Banner 弹幕 ═══
  function showBanner(emoji, txt, bg) {
    var b = $('milestoneBanner');
    if (!b) return;
    b.textContent = emoji + ' ' + txt;
    b.style.background = bg;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    setTimeout(function () { b.classList.remove('show'); }, 3500);
  }

  function checkMilestone(s) {
    var m = MILESTONE_MSGS[s];
    if (!m) return;
    showBanner(m.e, pick(m.t), m.b);
  }

  function showStreakBreak(s, best) {
    var msg = pick(BREAK_MSGS).replace('#BEST#', best);
    showBanner('💔', msg, 'linear-gradient(135deg,#6b7280,#4b5563)');
  }

  // ═══ 进度条 ═══
  function updateStreakProgress(streak) {
    var el = $('streakProgress');
    if (!el) return;
    if (streak <= 0) { el.style.display = 'none'; return; }
    var next = null;
    for (var i = 0; i < STREAK_MILESTONES.length; i++) {
      if (STREAK_MILESTONES[i] > streak) { next = STREAK_MILESTONES[i]; break; }
    }
    if (!next) {
      el.style.display = 'inline-flex';
      $('streakProgressFill').style.width = '100%';
      $('streakProgressLabel').textContent = '全部达成';
      el.title = '所有里程碑已解锁！';
      return;
    }
    var filtered = [];
    for (var j = 0; j < STREAK_MILESTONES.length; j++) {
      if (STREAK_MILESTONES[j] <= streak) filtered.push(STREAK_MILESTONES[j]);
    }
    var prev = filtered.length > 0 ? filtered[filtered.length - 1] : 0;
    var pct = ((streak - prev) / (next - prev)) * 100;
    var remain = next - streak;
    el.style.display = 'inline-flex';
    $('streakProgressFill').style.width = pct + '%';
    $('streakProgressLabel').textContent = '差' + remain + '题';
    el.title = '还差 ' + remain + ' 题解锁 ' + (STREAK_MILESTONE_EMOJI[next] || '') + ' ' + next + '连对';
  }

  // ═══ 暴露 ═══
  window.Streak = {
    setBadge: setStreakBadge,
    checkMilestone: checkMilestone,
    showBreak: showStreakBreak
  };
})();
