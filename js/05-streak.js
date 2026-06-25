// ===== 模块: streak =====
// 职责: 连对里程碑视觉反馈 —— 徽章 / banner 弹幕 / 进度条 / 断连提示
// 依赖: 01-utils ($, pick), 02-storage (MILESTONE_MSGS, BREAK_MSGS, STREAK_MILESTONES, STREAK_MILESTONE_EMOJI)
// 暴露: window.Streak = { setBadge, checkMilestone, showBreak }

import { $, pick } from './01-utils.js';
import { MILESTONE_MSGS, BREAK_MSGS, STREAK_MILESTONES, STREAK_MILESTONE_EMOJI } from './02-storage.js';

// ═══ 分层连对标记 ═══
function getStreakIcon(st) {
  if (st >= 30) return 'MAX';
  if (st >= 10) return 'HOT';
  if (st >= 3) return 'UP';
  return 'OK';
}

// ═══ 连对徽章三态切换 ═══
export function setStreakBadge(streak, fire) {
  const b = $('streakBadge'); if (!b) return;
  $('streakNum').textContent = streak;
  if (streak > 0) {
    b.style.display = 'inline-flex';
    b.classList.remove('dormant');
    b.querySelector('.fire').textContent = getStreakIcon(streak);
    b.classList.add('just-fired');
    setTimeout(() => { b.classList.remove('just-fired'); }, 500);
  } else if (fire === 'break') {
    b.style.display = 'inline-flex';
    b.classList.add('dormant');
    b.querySelector('.fire').textContent = 'RESET';
  }
  updateStreakProgress(streak);
}

// ═══ Banner 弹幕 ═══
function showBanner(label, txt, bg) {
  const b = $('milestoneBanner');
  if (!b) return;
  b.textContent = label ? label + ' ' + txt : txt;
  b.style.background = bg;
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
  setTimeout(() => { b.classList.remove('show'); }, 3500);
}

export function checkMilestone(s) {
  const m = MILESTONE_MSGS[s];
  if (!m) return;
  showBanner('连对', pick(m.t), m.b);
}

export function showStreakBreak(s, best) {
  const msg = pick(BREAK_MSGS).replace('#BEST#', best);
  showBanner('断连', msg, 'linear-gradient(135deg,#6b7280,#4b5563)');
}

// ═══ 进度条 ═══
function updateStreakProgress(streak) {
  const el = $('streakProgress');
  if (!el) return;
  if (streak <= 0) { el.style.display = 'none'; return; }
  let next = null;
  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    if (STREAK_MILESTONES[i] > streak) { next = STREAK_MILESTONES[i]; break; }
  }
  if (!next) {
    el.style.display = 'inline-flex';
    $('streakProgressFill').style.width = '100%';
    $('streakProgressLabel').textContent = '全部达成';
    el.title = '所有里程碑已解锁！';
    return;
  }
  const filtered = [];
  for (let j = 0; j < STREAK_MILESTONES.length; j++) {
    if (STREAK_MILESTONES[j] <= streak) filtered.push(STREAK_MILESTONES[j]);
  }
  const prev = filtered.length > 0 ? filtered[filtered.length - 1] : 0;
  const pct = ((streak - prev) / (next - prev)) * 100;
  const remain = next - streak;
  el.style.display = 'inline-flex';
  $('streakProgressFill').style.width = pct + '%';
  $('streakProgressLabel').textContent = '差' + remain + '题';
  el.title = '还差 ' + remain + ' 题解锁 ' + next + ' 连对';
}

// ═══ 暴露 ═══
window.Streak = {
  setBadge: setStreakBadge,
  checkMilestone,
  showBreak: showStreakBreak
};

// 别名导出（供 ES import 使用）
export { setStreakBadge as setBadge, showStreakBreak as showBreak };
