import { getSubjectLinks } from '../subjects.js';

// 电子技术基础题库配置
window.QUIZ_CONFIG = {
  // —— 学科切换 ——
  subjects: getSubjectLinks('electronics'),

  // —— 学科信息 ——
  subjectName: '电子技术基础',
  pageTitle: '电子技术基础 A卷 答案解析',
  sidebarTitle: '电子技术基础',
  mobileTitle: '电子技术基础 A卷',

  setSize: 37,
  setSizes: [37, 35, 38],
  setNames: ['24-25A卷', '24-25B卷', '23-24A卷'],

  questionTypes: [
    { type: 'single',  label: '判断题', short: '判断', shortLike: false },
    { type: 'fill',    label: '填空题', short: '填空', shortLike: false },
    { type: 'short',   label: '计算题', short: '计算', shortLike: true  }
  ],

  storageKey: 'elec_quiz_v1',
  legacyStorageKeys: [],

  streakMilestones: [1, 3, 5, 10, 20],
  streakMilestoneEmoji: { 1:'1连', 3:'3连', 5:'5连', 10:'10连', 20:'20连' },
  milestoneMsgs: {
    1:  { e:'1连', b:'linear-gradient(135deg,#f59e0b,#ef4444)', t:['第一题拿下！电路开始导通了！','电流已通！知识回路激活！']},
    3:  { e:'3连', b:'linear-gradient(135deg,#10b981,#059669)', t:['三连对！灯泡亮了！','三连！基尔霍夫为你鼓掌！']},
    5:  { e:'5连', b:'linear-gradient(135deg,#6366f1,#8b5cf6)', t:['五连对！电路全通！','五连！欧姆定律在你手中！']},
    10: { e:'10连', b:'linear-gradient(135deg,#ec4899,#f43f5e)', t:['十连对！电池满电！','十连！你就是行走的万用表！']},
    20: { e:'20连', b:'linear-gradient(135deg,#f97316,#ef4444)', t:['二十连对！电爆了！','二十连！你已超越基尔霍夫本人！']}
  }
};
