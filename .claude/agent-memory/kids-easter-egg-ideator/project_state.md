---
name: Maaltafels app current state
description: What the app already has and what easter egg ideas were generated in the first ideation session
type: project
---

As of 2026-03-25, the app has these delight features already implemented:
- Confetti burst from the correct MC button on right answer
- Shake + red flash animation on wrong answer
- Card dealing animation with staggered, scattered layout
- Finish screen: 1-3 star rating, motivational Dutch messages, staggered bounce-in animations
- Trophy emoji on finish screen that emits continuous confetti on hold/tap (only when 3 stars earned)
- Dark theme, mobile-first design

Key technical constraints for easter eggs:
- Vanilla HTML/CSS/JS, no build step, no npm
- localStorage available for persistence across sessions
- canvas-confetti already loaded (used for existing confetti)
- No audio API currently in use (but Web Audio API available in browser)
- State object in app.js tracks: correctCount, wrongCount, correctTimes, round, mode, selectedTables, selectedOps

Easter egg ideation session 1 (2026-03-25): generated 10 ideas across categories:
streak rewards, hidden interactions, session milestones, visual surprises, seasonal/time-based, meta/cleverness.
See conversation for full details.
