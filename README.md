# Quiz Hub · 多学科题库练习平台

一个**配置驱动**的题库刷题应用，零依赖、零构建、`file://` 直接打开即可使用。支持多学科多卷子，换学科只需在 `subjects/` 下新增目录。

## ✨ 特性

- **零依赖**：纯 HTML + 原生 JS，无需 npm/node/构建
- **配置驱动**：学科名、套题数、题型、连对文案全在各自的 config 文件中
- **多学科支持**：`subjects/` 下每个子目录独立一个学科
- **6 种题型**：单选、多选、填空、简答、作图、综合
- **图片支持**：题目和解析中可嵌入电路图等图片
- **进度本地化**：localStorage 持久化，各学科独立存储
- **连对里程碑**：1/3/5/10/20/30/50/100 连对触发动效与文案
- **筛选与导出**：错题筛选、收藏、简答题一键导出 Markdown

## 🚀 使用

```
双击 subjects/ 下对应学科的 .html 文件即可，不要用 IE。
```

或本地起个静态服务器（可选）：

```bash
python -m http.server 8000
# 浏览器访问 http://localhost:8000/subjects/electronics/electronics.html
```

## 📁 文件结构

```
quiz-hub/
├── js/                              # 共享业务模块（01-utils … 11-app）
├── css/
│   └── app.css                      # 共享样式表
├── subjects/
│   ├── dataviz/                     # 📊 数据可视化
│   │   ├── dataviz.html             #    入口页面
│   │   ├── dataviz-config.js        #    学科配置
│   │   ├── dataviz-questions.js     #    题库数据（300题，3套×100）
│   │   └── images/                  #    题目图片（按卷子分目录）
│   │       └── A卷/
│   └── electronics/                 # ⚡ 电子技术基础
│       ├── electronics.html
│       ├── electronics-config.js
│       ├── electronics-questions.js #    题库数据（37题：15填空+15判断+7计算）
│       └── images/
│           └── A卷/                 #    13张电路图
├── README.md
└── .gitignore
```

## ➕ 新增学科

### 1. 创建目录

```bash
mkdir -p subjects/新学科名/images/A卷
```

### 2. 创建配置文件 `新学科名-config.js`

```js
window.QUIZ_CONFIG = {
  subjectName: '学科名',
  pageTitle:   '期末复习',
  sidebarTitle:'学科名 题库',
  mobileTitle: '学科名',
  setSize: 50,                              // 每套题数
  setNames: ['A卷'],                        // 套题名（长度 = 套题数）
  questionTypes: [
    { type: 'single',  label: '单选题', short: '单选', shortLike: false },
    { type: 'multi',   label: '多选题', short: '多选', shortLike: false },
    { type: 'fill',    label: '填空题', short: '填空', shortLike: false },
    { type: 'short',   label: '简答题', short: '简答', shortLike: true  },
  ],
  storageKey: '新学科_quiz_v1',             // 各学科必须不同
  legacyStorageKeys: [],
  streakMilestones: [1, 3, 5, 10, 20],
  streakMilestoneEmoji: { 1:'⚡', 3:'💡', 5:'🔌', 10:'🔋', 20:'💥' },
  milestoneMsgs: { /* 连对文案 */ }
};
```

### 3. 创建题库文件 `新学科名-questions.js`

```js
window.QUIZ_QUESTIONS = [
  { id:1, m:'第1章', type:'single', q:'问题文本', opts:['A. 选项1','B. 选项2','C. 选项3','D. 选项4'], ans:[0], exp:'解析' },
  { id:2, m:'第1章', type:'fill',   q:'填空题题干', ansText:'标准答案', exp:'解析' },
  { id:3, m:'第2章', type:'short',  q:'简答题题干', ansText:'参考答案文本' },
  // 题目中嵌入图片：q:'题干文字<div style="text-align:center;margin:10px 0"><img src="images/A卷/xxx.png" style="max-width:360px"></div>'
];
```

**题数应 ≥ `setNames.length × setSize`**，否则启动时 console 会警告。

### 4. 创建入口页面 `新学科名.html`

复制任一已有学科的 `.html` 文件，修改前两行脚本引用：

```html
<script src="新学科名-config.js"></script>
<script src="新学科名-questions.js"></script>
```

其余 `../../js/` 和 `../../css/` 引用保持不变。

### 5. 图片存放

将图片放入 `subjects/新学科名/images/卷子名/` 目录，题库中引用路径为 `images/卷子名/文件名.ext`。

## 🧩 题目 Schema

| 字段      | 类型       | 必填             | 说明                             |
|-----------|------------|------------------|----------------------------------|
| `id`      | number     | ✅               | 全局唯一                         |
| `m`       | string     | ✅               | 所属章节/模块                    |
| `type`    | string     | ✅               | 见 config.questionTypes[].type   |
| `q`       | string     | ✅               | 题干（支持 HTML，如嵌入图片）    |
| `opts`    | string[]   | 单选/多选        | 选项                             |
| `ans`     | number[]   | 单选/多选        | 正确选项下标数组                 |
| `ansText` | string     | 填空/简答/作图/综合 | 标准答案 / 参考答案           |
| `exp`     | string     | 可选             | 解析（支持 HTML）                |
| `yq`      | boolean    | 可选             | 标记为考试原题                   |

## 📜 License

个人复习用，自由使用。
