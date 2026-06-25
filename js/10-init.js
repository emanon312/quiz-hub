// ===== 模块: init =====
// 职责: 页面初始化 —— 注入标题/套题标签、应用主题、启动计时器、注册全局事件、首次渲染
// 依赖: 01-utils ($)
// 暴露: window.Init = { setupSetTabs, initTheme }

import { $ } from './01-utils.js';
import { iconMarkup } from './icons.js';

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
  if (el) {
    el.innerHTML = iconMarkup(saved === 'orange' ? 'themeLeaf' : 'themePaper');
    el.setAttribute('aria-label', saved === 'orange' ? '切换到绿色主题' : '切换到橙色主题');
    el.setAttribute('title', saved === 'orange' ? '切换到绿色主题' : '切换到橙色主题');
  }
  const home = $('homeLink');
  if (home) home.innerHTML = iconMarkup('home');
}

// ═══ 暴露 ═══
window.Init = {
  setupSetTabs,
  initTheme
};
