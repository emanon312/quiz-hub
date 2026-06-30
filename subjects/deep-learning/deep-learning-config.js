import { getSubjectLinks } from '../subjects.js';

window.QUIZ_CONFIG = {
  subjects: getSubjectLinks('deep-learning'),

  subjectName: '深度学习',
  pageTitle: '深度学习期末速成',
  sidebarTitle: '深度学习',
  mobileTitle: '深度学习',

  setSize: 30,
  setNames: ['神经网络基础', 'CNN与深度学习', 'RNN与循环结构', '注意力与Transformer'],

  questionTypes: [
    { type: 'single', label: '单选题', short: '单选', shortLike: false },
    { type: 'fill', label: '填空题', short: '填空', shortLike: false },
    { type: 'short', label: '简答题', short: '简答', shortLike: true },
    { type: 'compre', label: '综合题', short: '综合', shortLike: true },
    { type: 'draw', label: '作图题', short: '作图', shortLike: true },
  ],

  storageKey: 'deep_learning_quiz_v1',
  legacyStorageKeys: [],

  streakMilestones: [1, 3, 5, 10, 20, 30],
  streakMilestoneEmoji: { 1: '1连', 3: '3连', 5: '5连', 10: '10连', 20: '20连', 30: '30连' },
  milestoneMsgs: {
    1: { e: '1连', b: 'linear-gradient(135deg,#0ea5e9,#22c55e)', t: ['第一层激活，速成网络开始前向传播。', '第一题拿下，梯度方向找到了。'] },
    3: { e: '3连', b: 'linear-gradient(135deg,#22c55e,#14b8a6)', t: ['三连对，隐藏状态保持稳定。', '三连达成，卷积核已经捕捉到重点。'] },
    5: { e: '5连', b: 'linear-gradient(135deg,#6366f1,#06b6d4)', t: ['五连对，注意力权重集中在考点上。', '五连达成，特征表示越来越清楚。'] },
    10: { e: '10连', b: 'linear-gradient(135deg,#f97316,#ef4444)', t: ['十连对，模型开始收敛。', '十连达成，Transformer 也要给你分配高权重。'] },
    20: { e: '20连', b: 'linear-gradient(135deg,#ec4899,#8b5cf6)', t: ['二十连对，反向传播一路顺畅。', '二十连达成，期末知识图谱已成形。'] },
    30: { e: '30连', b: 'linear-gradient(135deg,#f59e0b,#eab308)', t: ['三十连对，一套题组被你完整拟合。', '三十连达成，主观题框架已经很稳。'] },
  },
  breakMsgs: [
    '断连了，但 #BEST# 连对的表示还在，重新前向传播即可。',
    '梯度抖了一下，保留 #BEST# 连对经验继续优化。',
    '注意力暂时分散，但 #BEST# 连对说明主干知识已经学到。',
  ],
};
