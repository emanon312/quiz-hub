# Repository Guidelines

## Project Structure & Module Organization

Quiz Hub is a Vite-built static quiz site. Shared runtime code lives in `js/` (`01-utils.js` through `11-app.js`), and shared styling lives in `css/app.css`. The homepage is `index.html`.

Subject content lives under `subjects/`. Each subject should have:

- `<slug>.html`
- `<slug>-config.js`
- `<slug>-questions.js`
- `<slug>-init.js`
- optional images under `subjects/<slug>/images/`

Register every subject in `subjects/subjects.js`; Vite inputs, homepage cards, validation, and startup checks read from this registry. Utility scripts live in `scripts/`; GitHub Pages deployment lives in `.github/workflows/deploy-pages.yml`.

## Build, Test, and Development Commands

Use Node/npm from the project root:

```bash
npm install
npm run dev
npm run validate
npm run test:state
npm run build
npm run check:startup
npm run preview
```

- `npm run dev`: starts Vite locally.
- `npm run validate`: validates subject configs, question data, image paths, and registry counts.
- `npm run test:state`: runs lightweight runtime-state regression tests.
- `npm run build`: builds the static site into `dist/`.
- `npm run check:startup`: checks built chunk startup order.
- `npm run preview`: serves the built output locally.

Do not rely on opening subject HTML files via `file://`; use Vite or GitHub Pages.

## Coding Style & Naming Conventions

Use plain JavaScript ES modules and follow the existing vanilla JS style. Prefer `const`/`let`, 2-space indentation in new files, and semicolons where local files already use them. Subject slugs should be lowercase kebab-case, for example `machine-learning`.

Keep quiz data in `window.QUIZ_QUESTIONS` and config in `window.QUIZ_CONFIG`. Storage keys must be unique, such as `machine_learning_quiz_v1`.

## Testing Guidelines

Run the full verification set before committing changes:

```bash
npm run validate
npm run test:state
npm run build
npm run check:startup
```

For UI changes, also verify browser screenshots on desktop and mobile. New subjects need enough questions for `setNames` / `setSize` or `setSizes`.

## Commit & Pull Request Guidelines

Recent commits use short conventional prefixes such as `feat:`, `fix:`, `ci:`, and `docs:`. Keep commit messages imperative and focused, for example `fix: count only checked answers as completed`.

Pull requests should include:

- Summary of user-facing changes
- Test plan with commands run
- Screenshots for UI changes
- Notes for subject/content changes

## Security & Configuration Tips

This is a static site; progress is stored in browser `localStorage`, not on a server. Do not add secrets. Treat question HTML as trusted author content; add sanitization before accepting external submissions.
