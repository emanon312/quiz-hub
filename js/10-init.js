// ===== 模块: init =====
// 职责: 页面初始化 —— 注入标题/套题标签、应用主题、启动计时器、注册全局事件、首次渲染
// 依赖: 所有前置模块
// 暴露: 无（副作用执行）

(function () {
  var $ = window.$;
  // 标题/题组数注入与首次渲染统一由 11-app.js 的 boot() 负责，此处仅提供初始化辅助函数

  function setupSetTabs(activeSet, setNames) {
    var tabs = $('setTabs');
    if (!tabs) return;
    tabs.innerHTML = setNames.map(function (name, i) {
      return '<button class="set-tab' + (i === activeSet ? ' active' : '') + '" onclick="switchSetTab(' + i + ')">' + name + '</button>';
    }).join('');
  }

  // ═══ 主题初始化 ═══
  function initTheme() {
    var saved = localStorage.getItem('quiz-hub-theme') || 'orange';
    document.documentElement.setAttribute('data-theme', saved);
    var el = $('themeToggle');
    if (el) el.textContent = saved === 'orange' ? '🥦' : '🥕';
  }

  // ═══ 暴露辅助（供 HTML 内联调用） ═══
  window.Init = {
    setupSetTabs: setupSetTabs,
    initTheme: initTheme
  };
})();
