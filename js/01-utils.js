// ===== 模块: utils =====
// 职责: 通用小工具：DOM 速查 / 随机选取 / 简短音效 / 题型展示常量
// 依赖: 无
// 暴露: window.$  / window.pick / window.playBeep / window.TYPE_LABELS / window.TYPE_CLASS

// DOM 速查
export function $(id) { return document.getElementById(id); }

// 数组随机取一项
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Web Audio API 极简振荡器；失败静默（部分浏览器 file:// 下首次需用户手势）
export function playBeep(freq, dur, type) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* 静默 */ }
}

// 题型展示常量：渲染层只读，不放配置文件（这是 UI 显示规则，不是用户可配置项）
export const TYPE_LABELS = {
  single: '单选题', multi: '多选题', fill: '填空题',
  short: '简答题', draw: '作图题', compre: '综合题'
};
export const TYPE_CLASS = {
  single: 'single', multi: 'multi', fill: 'fill',
  short: 'short', draw: 'draw', compre: 'compre'
};

// 全局引用（兼容 onclick 等内联事件）
window.$ = $;
window.pick = pick;
window.playBeep = playBeep;
window.TYPE_LABELS = TYPE_LABELS;
window.TYPE_CLASS = TYPE_CLASS;
