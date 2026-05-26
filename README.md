# 题库练习 · 配置驱动版

一个**单 HTML 文件 + 两个 JS 配置文件**的题库刷题应用，零依赖、零构建、`file://` 直接打开即可使用。当前内置 300 道数据可视化期末复习题（3 套 × 100 题），换学科只需替换 `config.js` 和 `questions.js`。

## ✨ 特性

- **零依赖**：纯 HTML + 原生 JS，无需 npm/node/构建
- **配置驱动**：学科名、套题数、题型、连对文案全在 `config.js`
- **6 种题型**：单选、多选、填空、简答、作图、综合
- **进度本地化**：localStorage 持久化，支持版本迁移（v4 → v5）
- **连对里程碑**：1/3/5/10/20/30/40/50/100 连对触发动效与文案
- **筛选与导出**：错题筛选、收藏、简答题一键导出 Markdown
- **健壮性**：启动期 schema 校验、saveData 防抖、关闭页面强制保存

## 🚀 使用

```
双击 数据可视化练习.html 即可，不要用 IE。
```

或本地起个静态服务器（可选）：

```bash
python -m http.server 8000
# 浏览器访问 http://localhost:8000/数据可视化练习.html
```

## 📁 文件结构

```
.
├── 数据可视化练习.html   # 主入口（UI 结构）
├── css/app.css           # 样式表
├── config.js             # 学科/套题/题型/文案配置
├── questions.js          # 题库数据（window.QUIZ_QUESTIONS）
├── js/                   # 业务模块（01-utils … 11-app）
└── README.md
```

## 🔧 换学科 / 加题

### 1. 改配置（`config.js`）

```js
window.QUIZ_CONFIG = {
  subjectName: '数据可视化',        // 学科名（导出文件名等使用）
  pageTitle:   '期末复习 100 题',
  sidebarTitle:'数据可视化 100 题',
  mobileTitle: '数据可视化 100 题',
  setSize: 100,                     // 每套题数
  setNames: ['题组一', '题组二', '模拟题1'],  // 长度 = 套题数
  questionTypes: [ /* 单选/多选/填空/简答/作图/综合 */ ],
  storageKey: 'dataviz_quiz_v5',
  legacyStorageKeys: ['dataviz_quiz_v4', ...],  // 旧版本迁移
  streakMilestones: [1,3,5,10,20,30,40,50,100],
  milestoneMsgs: { /* 连对文案 */ },
  breakMsgs: [ /* 断连文案 */ ]
};
```

### 2. 改题库（`questions.js`）

```js
window.QUIZ_QUESTIONS = [
  // 单选（ans 为下标数组，只有一个元素）
  { id:1, m:'第1章', type:'single', q:'问题文本', opts:['A','B','C','D'], ans:[0], exp:'解析' },
  // 多选（ans 为下标数组）
  { id:2, m:'第2章', type:'multi',  q:'...', opts:['A','B','C','D'], ans:[0,2], exp:'...' },
  // 填空（标准答案放 ansText）
  { id:3, m:'第3章', type:'fill',   q:'...', ansText:'标准答案', exp:'...' },
  // 简答/作图/综合（提交即显示答案，不判对错）
  { id:4, m:'第4章', type:'short',  q:'...', ansText:'参考答案文本' },
  // ...
];
```

**题数应 ≥ `setNames.length × setSize`**，否则启动时 console 会警告。

### 3. 升级数据结构

如改了字段名/结构，递增 `storageKey` 版本号（如 `_v5` → `_v6`），并把旧 key 加到 `legacyStorageKeys`，旧用户进度会自动迁移。

## 🧩 题目 Schema

| 字段     | 类型       | 必填             | 说明                                  |
|----------|------------|------------------|---------------------------------------|
| `id`     | number     | ✅              | 全局唯一                              |
| `m`      | string     | ✅              | 所属章节/模块                         |
| `type`   | string     | ✅              | 见 `config.questionTypes[].type`      |
| `q`      | string     | ✅              | 题干                                  |
| `opts`   | string[]   | 单选/多选       | 选项                                  |
| `ans`    | number[]   | 单选/多选       | 正确选项下标数组（单选长度为 1）      |
| `ansText`| string     | 填空/简答/作图/综合 | 标准答案 / 参考答案                |
| `exp`    | string     | 可选             | 解析                                  |
| `yq`     | string     | 可选             | 原题来源标记（如语雀题号）            |

## 🛡️ 健壮性细节

- **启动期校验**：`questions` 长度、id 唯一性、type 合法性、必填字段（console 输出问题清单）
- **saveData 防抖**：300ms 合并写入，避免连续点击拖慢响应
- **关闭/切换 tab 兜底**：`beforeunload` + `visibilitychange` 强制 flush 未写入的更改
- **版本迁移**：`storageKey` 改版后自动读 `legacyStorageKeys` 中的旧数据
- **越界保护**：`activeSet ≥ SET_COUNT` 时回退到 0（防止套题数减少导致空指针）

## 📜 License

个人复习用，自由使用。
