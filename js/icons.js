const baseAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

function svg(paths) {
  return `<svg class="ui-icon" ${baseAttrs}>${paths}</svg>`;
}

export const Icons = {
  default: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 8v8"/><path d="M8 10.2l4-2.2 4 2.2"/>'),
  brandMark: svg('<path d="M7 4h8.5L19 7.5V20H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"/><path d="M15 4v4h4"/><path d="M8 12h6"/><path d="M8 16h4"/><path d="M17 12c-2.2.3-3.9 1.7-5 4"/>'),
  themePaper: svg('<path d="M6 4h8l4 4v12H6z"/><path d="M14 4v5h4"/><path d="M9 13h6"/><path d="M9 16h4"/>'),
  themeLeaf: svg('<path d="M5 19c8.5.4 13.5-4.8 14-14-8.4.4-13.6 5.3-14 14z"/><path d="M5 19c3.8-5.1 7.1-7.6 12-10"/>'),
  dataviz: svg('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-4"/><path d="M12 16V8"/><path d="M16 16v-6"/><path d="M7 10.5l4-3 4 2 4-4"/>'),
  electronics: svg('<path d="M4 12h4"/><path d="M16 12h4"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="12" r="2"/><path d="M12 7v3"/><path d="M12 14v3"/><path d="M9 17h6"/><path d="M17 8l2-2"/><path d="M19 6v4h-4"/>'),
  machineLearning: svg('<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><circle cx="12" cy="12" r="2.3"/><path d="M8 8l2.3 2.3"/><path d="M8 16l2.3-2.3"/><path d="M13.7 10.3L16 8"/><path d="M13.7 13.7L16 16"/><path d="M4 12c2.4-1.2 5-1.2 8 0s5.6 1.2 8 0"/>'),
  home: svg('<path d="M4 11.5L12 5l8 6.5"/><path d="M6.5 10.5V20h11v-9.5"/><path d="M10 20v-5h4v5"/>'),
  filter: svg('<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>'),
  sets: svg('<path d="M7 4h11v14H7z"/><path d="M4 7h3"/><path d="M4 12h3"/><path d="M4 17h3"/><path d="M10 8h5"/><path d="M10 12h5"/>'),
  types: svg('<path d="M5 6h14"/><path d="M5 12h14"/><path d="M5 18h10"/><circle cx="4" cy="6" r=".8" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r=".8" fill="currentColor" stroke="none"/>'),
  star: svg('<path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 4z"/>'),
  retry: svg('<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19 5v5h-5"/>'),
  answer: svg('<path d="M5 5h14v10H8l-3 3z"/><path d="M9 9h6"/><path d="M9 12h4"/>'),
  check: svg('<path d="M20 7L10 17l-5-5"/>'),
  menu: svg('<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>'),
  prev: svg('<path d="M15 6l-6 6 6 6"/>'),
  next: svg('<path d="M9 6l6 6-6 6"/>'),
  correct: svg('<circle cx="12" cy="12" r="8"/><path d="M8.5 12l2.3 2.3 4.7-5"/>'),
  wrong: svg('<circle cx="12" cy="12" r="8"/><path d="M9 9l6 6"/><path d="M15 9l-6 6"/>'),
  submitted: svg('<path d="M6 4h9l3 3v13H6z"/><path d="M15 4v4h3"/><path d="M9 13l2 2 4-4"/>'),
};

export function iconMarkup(name, options = {}) {
  const className = options.className ? ` ${options.className}` : '';
  const label = options.label ? ` role="img" aria-label="${escapeAttr(options.label)}"` : '';
  const hidden = options.label ? '' : ' aria-hidden="true"';
  const markup = Icons[name] || Icons.default;
  return markup
    .replace('class="ui-icon"', `class="ui-icon${className}"`)
    .replace('aria-hidden="true"', label || hidden);
}

export function renderIcon(name, options = {}) {
  const template = document.createElement('template');
  template.innerHTML = iconMarkup(name, options).trim();
  return template.content.firstElementChild;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
