# New Subject Workflow

Use this checklist when adding a new Quiz Hub subject. The goal is to keep content, routing, validation, and deployment predictable.

## Files

Create a lowercase kebab-case subject folder under `subjects/<slug>/`:

- `<slug>.html`
- `<slug>-config.js`
- `<slug>-questions.js`
- `<slug>-init.js`
- optional images under `subjects/<slug>/images/`

Register the subject in `subjects/subjects.js` with `slug`, `name`, `icon`, `homeHref`, `dir`, `config`, `questions`, `html`, `storageKey`, `setNames`, question counts, description, and tags.

## Data Rules

- `storageKey` must be unique and versioned, for example `machine_learning_quiz_v1`.
- Use `window.QUIZ_CONFIG` in `<slug>-config.js`.
- Use `window.QUIZ_QUESTIONS` in `<slug>-questions.js`.
- Every question needs a stable `id`, valid `type`, `q`, and answer fields.
- Choice questions need `opts` and `ans`; fill and short-like questions need `ansText`.
- Local images must use paths relative to the subject folder and must exist in `images/`.

## Content Handoff Prompt

Ask the content generator for:

```text
Generate only practice questions for <subject>. Do not split into mock exams unless real past papers exist. Return <slug>-config.js and <slug>-questions.js using window.QUIZ_CONFIG and window.QUIZ_QUESTIONS. Keep IDs stable, answers explicit, and explanations concise. Include setNames/setSize or setSizes that match the total question count.
```

## Verification

Run from the project root:

```bash
npm run validate
npm run test:icons
npm run test:home
npm run build
npm run check:startup
```

For UI or image-heavy subjects, also run `npm run capture:visuals` after starting `npm run dev`.
