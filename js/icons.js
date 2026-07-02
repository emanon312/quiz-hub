const baseAttrs = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';

function svg(paths) {
  return `<svg class="ui-icon" ${baseAttrs}>${paths}</svg>`;
}

function colorSvg(paths) {
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

export const Icons = {
  default: svg('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 8v8"/><path d="M8 10.2l4-2.2 4 2.2"/>'),
  brandMark: colorSvg('<rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5.2" fill="#f4faea" stroke="#dbe8c7" stroke-width="1.1"/><path d="M9.8 11.2h4.3l1 5.7H8.8z" fill="#8dc765" stroke="#487033" stroke-width="1.1" stroke-linejoin="round"/><circle cx="8.4" cy="8.9" r="2.4" fill="#4f8a3d"/><circle cx="11.9" cy="7.1" r="2.6" fill="#7cb44b"/><circle cx="15.4" cy="8.8" r="2.3" fill="#4f8a3d"/><circle cx="12" cy="10.3" r="2.6" fill="#95ce74"/><path d="M10.3 15.3c1.2.5 2.7.5 3.8 0" stroke="#487033" stroke-width="1" stroke-linecap="round"/>'),
  siteMark: colorSvg('<circle cx="12" cy="12" r="10" fill="#f4faea"/><path d="M7.2 13.2c.4 4.7 2.3 7.2 4.8 7.2 2.6 0 4.4-2.5 4.8-7.2" fill="#fffdf8" stroke="#171412" stroke-width="1.2" stroke-linecap="round"/><path d="M6.8 11.3c3.4-1.6 7-1.6 10.4 0" fill="#171412"/><circle cx="9.1" cy="13.4" r="1" fill="#171412"/><circle cx="14.9" cy="13.4" r="1" fill="#171412"/><path d="M12 14.9v3.2" stroke="#171412" stroke-width="1.1" stroke-linecap="round"/><path d="M10.8 18.9c.8-.3 1.7-.3 2.5 0" stroke="#171412" stroke-width="1.1" stroke-linecap="round"/><path d="M10.1 7.7h3.7l.7 3.3H9.4z" fill="#8dc765" stroke="#487033" stroke-width="1"/><circle cx="8.9" cy="6.7" r="1.9" fill="#4f8a3d"/><circle cx="12" cy="5.3" r="2.1" fill="#7cb44b"/><circle cx="15.1" cy="6.7" r="1.8" fill="#4f8a3d"/><circle cx="12" cy="7.8" r="2.1" fill="#95ce74"/>'),
  emptyBox: svg('<path d="M5 6h14v12H5z"/><path d="M8 10h8"/><path d="M8 14h5"/><path d="M16 18l3 3"/><path d="M19 18l-3 3"/>'),
  themePaper: svg('<path d="M6 4h8l4 4v12H6z"/><path d="M14 4v5h4"/><path d="M9 13h6"/><path d="M9 16h4"/>'),
  themeLeaf: colorSvg('<path d="M6 18.2c8 .2 12.4-4.7 12.1-13.1-8.2.3-12.7 5-12.1 13.1z" fill="#cde7b2" stroke="#527d37" stroke-width="1.2" stroke-linejoin="round"/><path d="M7 17.5c3.9-4.8 7.2-7.3 10.7-9.3" stroke="#527d37" stroke-width="1.1" stroke-linecap="round"/><path d="M11.3 8.1c1.5-1 3.1-1.7 5-2" stroke="#86b85b" stroke-width="1" stroke-linecap="round"/><path d="M8.6 13.9c1.1.2 2.1.6 3 1.3" stroke="#86b85b" stroke-width=".95" stroke-linecap="round"/>'),
  themeCarrot: colorSvg('<path d="M8.6 8.8c2.1 3 3.8 6.4 4.7 10.2.2.8-.6 1.4-1.3.9-3.2-2.2-5.8-4.9-7.8-8.2-.3-.5 0-1.2.5-1.4l2.9-1.7c.4-.2.8-.1 1 .2z" fill="#f47b2c" stroke="#b95b24" stroke-width="1.2" stroke-linejoin="round"/><path d="M7.4 10.6l2.3-1.2M8.7 13l2.3-1.1" stroke="#ffd2a8" stroke-width=".9" stroke-linecap="round"/><path d="M9.2 8.2c1.2-2.5 2.9-3.7 5.2-3.9-.2 2.1-1.4 3.4-3.7 4.2" fill="#3fa766" stroke="#2f8b57" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.5 8c.1-2 1-3.6 2.8-4.8.5 2.1 0 3.6-1.5 4.7" fill="#70bf71" stroke="#2f8b57" stroke-width="1.1" stroke-linejoin="round"/>'),
  themeBroccoli: colorSvg('<path d="M10.2 11.3h3.4l1.2 8.2H9z" fill="#8ac46a" stroke="#2f8b57" stroke-width="1.2" stroke-linejoin="round"/><circle cx="8.1" cy="8.8" r="3" fill="#2f8b57"/><circle cx="12" cy="6.4" r="3.2" fill="#3fa766"/><circle cx="15.8" cy="8.8" r="3" fill="#2f8b57"/><circle cx="12" cy="10.2" r="3.3" fill="#4caf6c"/><path d="M9.3 15.2c1.8.7 3.5.7 5.2 0" stroke="#2f8b57" stroke-width="1.1" stroke-linecap="round"/>'),
  dataviz: svg('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-4"/><path d="M12 16V8"/><path d="M16 16v-6"/><path d="M7 10.5l4-3 4 2 4-4"/>'),
  electronics: svg('<path d="M4 12h4"/><path d="M16 12h4"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="12" r="2"/><path d="M12 7v3"/><path d="M12 14v3"/><path d="M9 17h6"/><path d="M17 8l2-2"/><path d="M19 6v4h-4"/>'),
  machineLearning: svg('<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="18" cy="17" r="2"/><circle cx="12" cy="12" r="2.3"/><path d="M8 8l2.3 2.3"/><path d="M8 16l2.3-2.3"/><path d="M13.7 10.3L16 8"/><path d="M13.7 13.7L16 16"/><path d="M4 12c2.4-1.2 5-1.2 8 0s5.6 1.2 8 0"/>'),
  deepLearning: svg('<path d="M4 18c2.2-1.8 4.6-1.8 7.2 0s5 1.8 8.8 0"/><circle cx="6" cy="6" r="1.8"/><circle cx="6" cy="12" r="1.8"/><circle cx="12" cy="9" r="2.1"/><circle cx="18" cy="6" r="1.8"/><circle cx="18" cy="12" r="1.8"/><path d="M7.7 6.7l2.5 1.3"/><path d="M7.7 11.3l2.5-1.3"/><path d="M13.8 8l2.5-1.3"/><path d="M13.8 10l2.5 1.3"/><path d="M12 11.2v3.8"/><path d="M9 21h6"/>'),
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
