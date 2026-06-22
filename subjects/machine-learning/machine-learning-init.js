// 学科页面初始化入口
import { QuizApp } from '../../js/11-app.js';

// 根据 QUIZ_CONFIG 动态设置学科按钮文字
(function setSubjBtn() {
  var cfg = window.QUIZ_CONFIG;
  if (!cfg) return;
  var btn = document.getElementById('subjBtn');
  if (!btn) return;
  var icon = '';
  if (cfg.subjects) {
    var active = cfg.subjects.find(function (s) { return s.active; });
    if (active && active.icon) icon = active.icon + ' ';
  }
  btn.textContent = icon + cfg.subjectName + ' ▸';
})();

// 渲染学科切换面板
(function () {
  var cfg = window.QUIZ_CONFIG;
  if (!cfg || !cfg.subjects) return;
  var body = document.getElementById('subjPanelBody');
  if (!body) return;
  var html = '';
  cfg.subjects.forEach(function (s) {
    html += '<a class="subj-card' + (s.active ? ' active' : '') + '" href="' + s.href + '">'
      + '<span class="sc-icon">' + s.icon + '</span>'
      + '<div class="sc-info"><div class="sc-name">' + s.name + '</div></div>'
      + '<span class="sc-arrow">→</span></a>';
  });
  body.innerHTML = html;
})();

// 侧边栏/面板切换（onclick 事件引用）
window.toggleSidebarSection = function (id) {
  document.getElementById(id).classList.toggle('open');
};
window.toggleSubjPanel = function () {
  var panel = document.getElementById('subjPanel');
  var overlay = document.getElementById('subjOverlay');
  panel.classList.toggle('open');
  overlay.classList.toggle('show');
};
window.closeSubjPanel = function () {
  document.getElementById('subjPanel').classList.remove('open');
  document.getElementById('subjOverlay').classList.remove('show');
};

// 启动应用
QuizApp.boot();
