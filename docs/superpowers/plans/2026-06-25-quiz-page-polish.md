# Quiz Page Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the quiz-taking page calmer and easier to read by improving the sidebar, question card, options, answer box, and right-side stats without changing quiz behavior.

**Architecture:** Keep the existing HTML templates and JavaScript behavior. Apply the polish primarily through `css/app.css`, with a small CSS invariant test that guards key selectors used by the redesigned visual states.

**Tech Stack:** Static HTML, shared CSS custom properties, Vite, Node validation scripts.

---

### Task 1: CSS Guard Test

**Files:**
- Create: `scripts/test-quiz-ui-css.mjs`
- Modify: `package.json`

- [ ] Add a Node script that checks `css/app.css` contains the new quiz-page markers: option left state bars, quieter right panel, paper-like question card, and reduced-motion coverage.
- [ ] Run `node scripts/test-quiz-ui-css.mjs`; it should fail before CSS is updated.
- [ ] Add `"test:quiz-ui": "node scripts/test-quiz-ui-css.mjs"` to `package.json`.

### Task 2: Visual Tokens and Surface Balance

**Files:**
- Modify: `css/app.css`

- [ ] Recalibrate orange and green theme variables.
- [ ] Add paper/card/input/answer surface tokens.
- [ ] Reduce orange saturation in large sidebar surfaces.

### Task 3: Question Card and Options

**Files:**
- Modify: `css/app.css`

- [ ] Make `.card` read as a quiet practice sheet with border and softer shadow.
- [ ] Make `.opt` use a left status bar for selected/correct/wrong states.
- [ ] Keep hover movement below 2px and respect reduced motion.

### Task 4: Sidebar and Stats Panel

**Files:**
- Modify: `css/app.css`

- [ ] Improve section headers, search field, question dots, and active tabs.
- [ ] Make the right panel quieter with smaller dividers and thinner progress bars.

### Task 5: Verification

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] Add `npm run test:quiz-ui` to CI.
- [ ] Run:

```bash
npm run validate
npm run test:state
npm run test:icons
npm run test:home
npm run test:quiz-ui
npm run build
npm run check:startup
```

