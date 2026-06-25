import { getSubjectLinks } from '../subjects.js';

window.QUIZ_CONFIG = {
  // —— 学科切换 ——
  subjects: getSubjectLinks('machine-learning'),

  // —— 学科信息 ——
  subjectName: '机器学习',
  pageTitle: '机器学习期末复习',
  sidebarTitle: '机器学习',
  mobileTitle: '机器学习',

  setSize: 40,
  setNames: ['练习1', '练习2', '练习3', '练习4'],

  questionTypes: [
    { type: 'single', label: '单选题', short: '单选', shortLike: false },
    { type: 'multi', label: '多选题', short: '多选', shortLike: false },
    { type: 'short', label: '简答/计算/综合题', short: '简答', shortLike: true },
  ],

  storageKey: 'machine_learning_quiz_v1',
  legacyStorageKeys: [],

  streakMilestones: [1, 3, 5, 10, 20, 30, 50],
  streakMilestoneEmoji: { 1: '1连', 3: '3连', 5: '5连', 10: '10连', 20: '20连', 30: '30连', 50: '50连' },
  milestoneMsgs: {
    1: { e: '1连', b: 'linear-gradient(135deg,#0ea5e9,#22c55e)', t: ['模型开始学习了！第一题拿下。', '训练启动，loss 正在下降！'] },
    3: { e: '3连', b: 'linear-gradient(135deg,#22c55e,#14b8a6)', t: ['三连对，泛化能力不错！', '验证集表现稳定，继续。'] },
    5: { e: '5连', b: 'linear-gradient(135deg,#6366f1,#06b6d4)', t: ['五连对，特征已经提出来了。', '隐藏层激活，知识开始非线性表达。'] },
    10: { e: '10连', b: 'linear-gradient(135deg,#f97316,#ef4444)', t: ['十连对，模型收敛得很漂亮！', '十连达成，调参手感在线。'] },
    20: { e: '20连', b: 'linear-gradient(135deg,#ec4899,#8b5cf6)', t: ['二十连对，直接起飞。', '训练曲线优雅下降，状态很稳。'] },
    30: { e: '30连', b: 'linear-gradient(135deg,#f59e0b,#eab308)', t: ['三十连对，期末分类器已成型。', '你现在像一个调好参的强模型。'] },
    50: { e: '50连', b: 'linear-gradient(135deg,#06b6d4,#a855f7)', t: ['五十连对，AUC 拉满！', '机器学习题库被你拟合得明明白白。'] },
  },
  breakMsgs: [
    '断连了，但你曾经有 #BEST# 连对，重新训练一轮就好。',
    '出现一次误分类，问题不大，#BEST# 连对的模型底子还在。',
    'loss 抖了一下，别急，拿着 #BEST# 连对的经验继续优化。',
  ],
};
