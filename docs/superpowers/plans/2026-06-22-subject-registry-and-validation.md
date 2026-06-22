# Subject Registry And Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared subject registry and a repeatable quiz-data validation command without changing quiz runtime behavior.

**Architecture:** Keep the browser app on the existing static ESM path. Add `subjects/subjects.js` as metadata, add `scripts/validate-quiz-data.mjs` as a Node-only quality gate, then have config files reuse the registry for their subject switcher arrays.

**Tech Stack:** Vite 8, native ESM, Node scripts, browser globals via `window.QUIZ_CONFIG` and `window.QUIZ_QUESTIONS`.

---

### Task 1: Validator Test Harness

**Files:**
- Create: `scripts/validate-quiz-data.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing CLI test mode**

Create `scripts/validate-quiz-data.mjs` with a `--self-test` branch that expects exported validator helpers to reject bad choice answers and missing images.

- [ ] **Step 2: Run the self-test to verify it fails**

Run: `node scripts/validate-quiz-data.mjs --self-test`
Expected: non-zero exit because validator helpers are not implemented yet.

- [ ] **Step 3: Implement minimal validator helpers**

Implement `validateSubjectData`, `extractLocalImageRefs`, and `runSelfTest`.

- [ ] **Step 4: Run the self-test to verify it passes**

Run: `node scripts/validate-quiz-data.mjs --self-test`
Expected: exit 0 with `Self-test passed`.

### Task 2: Subject Registry

**Files:**
- Create: `subjects/subjects.js`
- Modify: `subjects/dataviz/dataviz-config.js`
- Modify: `subjects/electronics/electronics-config.js`

- [ ] **Step 1: Add shared subject metadata**

Create `SUBJECTS` with entries for `dataviz` and `electronics`.

- [ ] **Step 2: Reuse metadata in subject configs**

Import `SUBJECTS` and map it to each config's `subjects` array, marking the active slug.

- [ ] **Step 3: Build after config import changes**

Run: `npm run build`
Expected: Vite build exits 0.

### Task 3: Production Validation Command

**Files:**
- Modify: `scripts/validate-quiz-data.mjs`
- Modify: `package.json`

- [ ] **Step 1: Load registry-driven subject data**

Import `SUBJECTS`, clear `globalThis.window` per subject, import each config/questions pair with a cache-busting query, then validate.

- [ ] **Step 2: Add npm script**

Add `"validate": "node scripts/validate-quiz-data.mjs"` to `package.json`.

- [ ] **Step 3: Run validation**

Run: `npm run validate`
Expected: exit 0 with each subject reported.

### Task 4: README Alignment

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update positioning**

Describe the project as static-first and Vite-capable instead of strictly zero-dependency.

- [ ] **Step 2: Document validation**

Add `npm run validate` next to build/preview commands.

- [ ] **Step 3: Final verification**

Run: `npm run validate`
Run: `npm run build`
Expected: both exit 0.
