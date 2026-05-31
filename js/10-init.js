// ===== 模块: init =====
// 职责: 页面初始化 —— 注入标题/套题标签、应用主题、启动计时器、注册全局事件、首次渲染
// 依赖: 01-utils ($)
// 暴露: window.Init = { setupSetTabs, initTheme }

import { $ } from './01-utils.js';

function setupSetTabs(activeSet, setNames) {
  const tabs = $('setTabs');
  if (!tabs) return;
  tabs.innerHTML = setNames.map((name, i) => {
    return '<button class="set-tab' + (i === activeSet ? ' active' : '') + '" onclick="switchSetTab(' + i + ')">' + name + '</button>';
  }).join('');
}

// ═══ 主题初始化 ═══
function initTheme() {
  const saved = localStorage.getItem('quiz-hub-theme') || 'orange';
  document.documentElement.setAttribute('data-theme', saved);
  const el = $('themeToggle');
  if (el) el.textContent = saved === 'orange' ? '🥦' : '🥕';
}

// ═══ 暴露 ═══
window.Init = {
  setupSetTabs,
  initTheme
};
