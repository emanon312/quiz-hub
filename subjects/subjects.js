export const SUBJECTS = [
  {
    slug: 'dataviz',
    name: '数据可视化',
    icon: '📊',
    href: '../dataviz/dataviz.html',
    homeHref: 'subjects/dataviz/dataviz.html',
    dir: 'subjects/dataviz',
    config: 'subjects/dataviz/dataviz-config.js',
    questions: 'subjects/dataviz/dataviz-questions.js',
    html: 'subjects/dataviz/dataviz.html',
  },
  {
    slug: 'electronics',
    name: '电子技术基础',
    icon: '⚡',
    href: '../electronics/electronics.html',
    homeHref: 'subjects/electronics/electronics.html',
    dir: 'subjects/electronics',
    config: 'subjects/electronics/electronics-config.js',
    questions: 'subjects/electronics/electronics-questions.js',
    html: 'subjects/electronics/electronics.html',
  },
  {
    slug: 'machine-learning',
    name: '机器学习',
    icon: '🤖',
    href: '../machine-learning/machine-learning.html',
    homeHref: 'subjects/machine-learning/machine-learning.html',
    dir: 'subjects/machine-learning',
    config: 'subjects/machine-learning/machine-learning-config.js',
    questions: 'subjects/machine-learning/machine-learning-questions.js',
    html: 'subjects/machine-learning/machine-learning.html',
  },
];

export function getSubjectLinks(activeSlug) {
  return SUBJECTS.map((subject) => ({
    name: subject.name,
    icon: subject.icon,
    href: subject.href,
    active: subject.slug === activeSlug,
  }));
}
