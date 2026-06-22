# Subject Registry And Validation Design

## Scope

This change is the first engineering cleanup pass for Quiz Hub. It keeps the existing static pages and ESM app flow intact, while adding a single subject registry and a repeatable validation command.

## Goals

- Add one shared source of truth for subject metadata.
- Add a validation script that can catch broken question data before deployment.
- Update README wording so it matches the current Vite-capable project.
- Avoid large page-template or `renderQuestion` refactors in this pass.

## Architecture

Create `subjects/subjects.js` as an ESM module exporting `SUBJECTS`. Each subject entry contains stable metadata used across the app: slug, name, icon, href, config path, questions path, and expected question counts when useful.

The existing per-subject `*-config.js` files will import this registry to generate their `subjects` switcher list. This keeps runtime behavior compatible with `window.QUIZ_CONFIG` while removing duplicated subject metadata.

Add `scripts/validate-quiz-data.mjs`, a Node script that imports each config and question file in a minimal browser-like global environment. It validates:

- question arrays exist and are not empty
- ids are present and unique within a subject
- question types are declared in config
- configured set sizes do not exceed available questions
- choice answers are non-empty arrays and stay within option bounds
- fill and short-like questions have `ansText`
- local image references in question or explanation HTML point to existing files

## Data Flow

The app still loads subject pages the same way:

1. subject page loads `*-config.js`
2. subject page loads `*-questions.js`
3. subject init imports `../../js/11-app.js`
4. `QuizApp.boot()` starts the shared app

Validation runs separately from the browser app:

1. `npm run validate`
2. script iterates `SUBJECTS`
3. script evaluates each config and question module
4. script reports all issues and exits non-zero if any are found

## Testing

Because the repo currently has no test runner, the validation script will include a small CLI test mode. The first implementation step is to add a failing fixture-based test command that proves missing images or invalid answers are detected. Production validation code is added only after that failure is observed.

The completion checks are:

- `npm run validate`
- `npm run build`

## Non-Goals

- No React/Vue/Svelte migration.
- No full HTML template extraction yet.
- No rewrite of `renderQuestion`.
- No behavior changes to answering, progress storage, streaks, search, or random mode.
