// ===== Module: init =====
// Responsibilities: initialize set tabs, apply the saved theme, and wire shared header icons.

import { $ } from './01-utils.js';
import { iconMarkup } from './icons.js';

const THEME_ORDER = ['orange', 'green', 'broccoli'];
const THEME_TOGGLE_META = {
  orange: { icon: 'themeCarrot', label: '当前主题：胡萝卜主题' },
  green: { icon: 'themeBroccoli', label: '当前主题：西蓝花主题' },
  broccoli: { icon: 'themeLeaf', label: '当前主题：叶子主题' },
};

function normalizeTheme(theme) {
  return THEME_ORDER.includes(theme) ? theme : 'orange';
}

function setupSetTabs(activeSet, setNames) {
  const tabs = $('setTabs');
  if (!tabs) return;
  tabs.innerHTML = setNames.map((name, i) => {
    return '<button class="set-tab' + (i === activeSet ? ' active' : '') + '" onclick="switchSetTab(' + i + ')">' + name + '</button>';
  }).join('');
}

function initTheme() {
  const requested = new URLSearchParams(window.location.search).get('theme');
  const saved = normalizeTheme(requested || localStorage.getItem('quiz-hub-theme'));
  document.documentElement.setAttribute('data-theme', saved);

  const el = $('themeToggle');
  if (el) {
    const meta = THEME_TOGGLE_META[saved];
    el.innerHTML = iconMarkup(meta.icon);
    el.setAttribute('aria-label', meta.label);
    el.setAttribute('title', meta.label);
  }

  const home = $('homeLink');
  if (home) home.innerHTML = iconMarkup('home');
}

window.Init = {
  setupSetTabs,
  initTheme,
};
