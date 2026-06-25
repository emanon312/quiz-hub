# Home Learning Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a homepage learning console that shows local progress, a continue-practice entry, and richer subject cards without changing the static GitHub Pages architecture.

**Architecture:** Add a small pure module `js/home-progress.js` that summarizes each subject's localStorage state. Keep `index.html` responsible for DOM rendering only. Extend `subjects/subjects.js` with storage and set metadata so the homepage does not import subject config scripts.

**Tech Stack:** Vite, native ES modules, Node validation scripts, localStorage.

---

### Task 1: Progress Summary Module

**Files:**
- Create: `js/home-progress.js`
- Create: `scripts/test-home-progress.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests**

Test that progress summary counts only completed answers, ignores in-progress selection arrays, exposes active set metadata, and handles broken JSON safely.

- [ ] **Step 2: Run test to verify failure**

Run: `node scripts/test-home-progress.mjs`
Expected: FAIL because `js/home-progress.js` does not exist.

- [ ] **Step 3: Implement module**

Export `summarizeSubjectProgress(subject, rawValue)`, `summarizeAllSubjects(subjects, storage)`, and `pickContinueSubject(summaries)`.

- [ ] **Step 4: Add npm script**

Add `"test:home": "node scripts/test-home-progress.mjs"`.

### Task 2: Subject Homepage Metadata

**Files:**
- Modify: `subjects/subjects.js`

- [ ] **Step 1: Add storage metadata**

Add `storageKey`, `setNames`, and `setSizes` or `setSize` metadata to every subject.

- [ ] **Step 2: Validate**

Run: `npm run test:home`.

### Task 3: Homepage Console Rendering

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Import homepage progress helpers**

Import from `js/home-progress.js`.

- [ ] **Step 2: Add continue panel markup**

Render a compact continue panel above subject cards. If no saved progress exists, render a calm empty state.

- [ ] **Step 3: Add card progress**

Show local completion count, percentage, active set, and a thin progress bar on every subject card.

### Task 4: Persistence Timestamp

**Files:**
- Modify: `js/11-app.js`

- [ ] **Step 1: Save updated timestamp**

Add `updatedAt: Date.now()` in saved quiz state so future homepage sorting can use recency.

- [ ] **Step 2: Ensure old saves still work**

The homepage module must treat missing `updatedAt` as zero.

### Task 5: Verification

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Add home test to CI**

Add `npm run test:home` after `npm run test:icons`.

- [ ] **Step 2: Run full checks**

Run:

```bash
npm run validate
npm run test:state
npm run test:icons
npm run test:home
npm run build
npm run check:startup
```

Expected: all commands pass.

