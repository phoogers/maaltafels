# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Dutch-language flashcard app for children to practice multiplication and division tables (maaltafels). Parents select which tables to practice, the app shuffles cards, and the child answers. Wrong answers go into a retry pile that repeats until all cards are answered correctly.

## Architecture

This is a vanilla HTML/CSS/JS single-page app with no build step, no framework, and no dependencies. Open `index.html` directly in a browser (works via `file://`). Hosted on Vercel as a static deployment.

### Files

- **`maaltafels.json`** — Source of truth for all card data. 10 tables (1-10), each with `enabled` flag, `color`, `multiplication` (11 cards), and `division` (11 cards). Total: 220 cards. Each card has `front` (e.g., "6 X 3 =") and `back` (e.g., "18").
- **`index.html`** — Page structure + **inline copy of the JSON data** as `MAALTAFELS_DATA` (required because `fetch` doesn't work over `file://`). When updating card data, both `maaltafels.json` and the inline block in `index.html` must be kept in sync. Also includes Vercel Web Analytics and Google Analytics (GA4) scripts.
- **`style.css`** — Dark theme, mobile-first responsive design with touch-optimized targets.
- **`app.js`** — All application logic: multi-step setup flow, card dealing animation, two exercise modes (kind/ouder), statistics tracking, and telemetry.

### App Flow

1. **Step 1** — Select tables (toggle buttons, multi-select, "Alles selecteren")
2. **Step 2** — Select operations: multiplication (X) and/or division (:)
3. **Step 3** — Choose mode (Kind = multiple choice, Ouder = self-assessed juist/fout) and card count (10/20/30/40/50, disabled if exceeding available)
4. **Deal screen** — Cards are shuffled and dealt with staggered animation
5. **Exercise** — Mode-dependent:
   - *Kind mode*: 4 multiple choice answers shown per card. Correct answer triggers confetti from button, wrong answer triggers shake + red flash. Distractors are plausible answers from the same table (0 excluded unless correct answer is 0).
   - *Ouder mode*: Fout/Juist buttons to self-assess. "Spieken" button to peek at the answer (flip animation).
6. **Finish screen** — Confetti, stats (juist/fout/avg time per correct/total time), two buttons: restart with same options (goes back to deal screen) or full reset.

### Key Design Decisions

- **Dual data source**: JSON data is duplicated inline in `index.html` to avoid CORS issues with `file://` protocol. Any card data changes must update both files.
- **`enabled` flag per table**: Tables can be disabled in the JSON (set `"enabled": false`) to hide them from selection. The `getEnabledTables()` function filters these.
- **State object**: Single `state` object in `app.js` holds all app state (selections, mode, deck, piles, current card, round number, timing, counters).
- **Step navigation**: Steps are shown/hidden via `.active` CSS class. The `goToStep()` function manages transitions.
- **Exercise DOM rebuild**: `beginExercise()` builds the exercise DOM based on the selected mode. `showFinished()` replaces exercise innerHTML. `resetState()` reconstructs it and re-attaches event listeners.
- **Optiesinfo panel**: Sticky panel at top always shows all table and operation badges (selected = bright, unselected = dimmed), card count (selected/available), and mode as badges.
- **Hamburger menu**: Contains Info (about overlay) and Feedback (Web3Forms email form) items.
- **Analytics**: Vercel Web Analytics for pageviews + GA4 `round_completed` custom event with mode, tables, ops, card count, rounds, correct, wrong, avg time, total time.

## Language

The UI is in Dutch. Use Dutch for all user-facing text.
