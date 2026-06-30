import { iconMarkup } from '../../js/icons.js';

(function setSubjBtn() {
  var cfg = window.QUIZ_CONFIG;
  if (!cfg) return;
  var btn = document.getElementById('subjBtn');
  if (!btn) return;
  var icon = '';
  if (cfg.subjects) {
    var active = cfg.subjects.find(function (s) { return s.active; });
    if (active && active.icon) icon = '<span class="subj-btn-icon">' + iconMarkup(active.icon) + '</span>';
  }
  btn.innerHTML = icon + '<span>' + cfg.subjectName + '</span><span class="subj-btn-chevron">▸</span>';
})();

(function () {
  var cfg = window.QUIZ_CONFIG;
  if (!cfg || !cfg.subjects) return;
  var body = document.getElementById('subjPanelBody');
  if (!body) return;
  var html = '';
  cfg.subjects.forEach(function (s) {
    html += '<a class="subj-card' + (s.active ? ' active' : '') + '" href="' + s.href + '">'
      + '<span class="sc-icon">' + iconMarkup(s.icon) + '</span>'
      + '<div class="sc-info"><div class="sc-name">' + s.name + '</div></div>'
      + '<span class="sc-arrow">→</span></a>';
  });
  body.innerHTML = html;
})();

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

import('../../js/11-app.js').then(function (mod) {
  mod.QuizApp.boot();
});
