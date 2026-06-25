# UI Foundation Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage and subject registry emoji icon surface with a reusable SVG icon foundation and a calmer first-screen visual baseline.

**Architecture:** Keep the current Vite + static HTML + vanilla JavaScript architecture. Add a focused `js/icons.js` module that exports semantic SVG icons, then render those icons from `subjects/subjects.js` and `index.html`. Add one small validation script so future subjects cannot silently reintroduce emoji icons or missing icon names.

**Tech Stack:** Vite, native ES modules, CSS custom properties, Node validation scripts.

---

### Task 1: Icon Registry Test

**Files:**
- Create: `scripts/test-ui-icons.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test**

Create `scripts/test-ui-icons.mjs` to import `SUBJECTS` and `Icons`, verify each `subject.icon` is an ASCII semantic key, and verify the key exists in `Icons`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/test-ui-icons.mjs`
Expected: FAIL because `js/icons.js` does not exist yet and/or subject icons are still emoji.

- [ ] **Step 3: Wire npm script**

Add `"test:icons": "node scripts/test-ui-icons.mjs"` to `package.json`.

### Task 2: SVG Icon Module

**Files:**
- Create: `js/icons.js`

- [ ] **Step 1: Implement icon helper**

Create `renderIcon(name, options)` and `iconMarkup(name, options)` helpers. Unknown icon names should fall back to `Icons.default`.

- [ ] **Step 2: Add required icons**

Add `brandMark`, `themePaper`, `themeLeaf`, `dataviz`, `electronics`, `machineLearning`, `home`, `filter`, `sets`, `types`, `star`, `retry`, `answer`, `check`, `menu`, `prev`, `next`, `correct`, `wrong`, and `submitted`.

- [ ] **Step 3: Run icon test**

Run: `npm run test:icons`
Expected: still FAIL until `subjects/subjects.js` is updated.

### Task 3: Subject Registry Icon Names

**Files:**
- Modify: `subjects/subjects.js`

- [ ] **Step 1: Replace emoji keys**

Set `dataviz.icon = 'dataviz'`, `electronics.icon = 'electronics'`, and `machine-learning.icon = 'machineLearning'`.

- [ ] **Step 2: Run icon test**

Run: `npm run test:icons`
Expected: PASS.

### Task 4: Homepage Icon Rendering and Visual Baseline

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Import icon module**

Import `renderIcon` and `iconMarkup` in the module script.

- [ ] **Step 2: Replace inline emoji UI**

Render `brandMark`, `themePaper`, `themeLeaf`, and each subject icon through the icon module. Update theme toggle to set `innerHTML` from `iconMarkup`.

- [ ] **Step 3: Tighten homepage layout**

Shorten hero spacing, move the subject cards higher, add icon-friendly CSS classes, and keep the first viewport focused on subject entry.

### Task 5: Shared Quiz Surface Light Cleanup

**Files:**
- Modify: `css/app.css`
- Modify: `js/10-init.js`
- Modify: `js/11-app.js`

- [ ] **Step 1: Add icon CSS primitives**

Add `.ui-icon`, `.icon-btn`, and related sizing rules to `css/app.css`.

- [ ] **Step 2: Stop writing theme emoji from JS**

Update theme initialization and toggling to dispatch a theme change event or leave icon rendering to pages that use `js/icons.js`.

### Task 6: Verification

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Add icon validation to CI**

Add `npm run test:icons` after `npm run test:state`.

- [ ] **Step 2: Run full checks**

Run:

```bash
npm run validate
npm run test:state
npm run test:icons
npm run build
npm run check:startup
```

Expected: all commands pass.

