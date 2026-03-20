# Maaltafels L2

Een oefenapp voor de maaltafels, gemaakt voor kinderen van het lager onderwijs. Ouders stellen de oefening in, het kind oefent — foute kaartjes komen terug tot alles juist is.

**Live:** [maaltafels-five.vercel.app](https://maaltafels-five.vercel.app)

## Functionaliteit

### Setup (3 stappen)

1. **Tafels kiezen** — Selecteer één of meerdere tafels (1 t/m 10). "Alles selecteren/deselecteren" knop beschikbaar.
2. **Bewerkingen kiezen** — Vermenigvuldigen (X), delen (:), of beide.
3. **Mode & aantal kaartjes kiezen**
   - **Kind-modus**: Multiple choice met 4 antwoorden. Foute antwoorden zijn altijd plausibel (uit dezelfde tafel, nooit 0 tenzij het juiste antwoord 0 is).
   - **Ouder-modus**: Bekijk de vraag, draai het kaartje om (spieken), en duid zelf juist of fout aan.
   - Kies 10, 20, 30, 40 of 50 kaartjes (opties worden uitgeschakeld als ze het beschikbare aantal overschrijden).

### Oefenen

- **Deal-animatie**: Kaartjes worden geschud en visueel uitgedeeld op het scherm.
- **Kaartjes beantwoorden**: Kaartjes verschijnen één voor één. Afhankelijk van de modus:
  - *Kind*: Klik op het juiste antwoord uit 4 opties. Juist antwoord geeft een confetti-burst vanuit de knop, fout antwoord laat de knop rood oplichten en schudden.
  - *Ouder*: Klik op "Juist" of "Fout". "Spieken" knop om het antwoord kort te zien (flip-animatie).
- **Fly-to-pile animatie**: Beantwoorde kaartjes vliegen naar de juist- of fout-stapel.
- **Rondes**: Foute kaartjes worden herschud en opnieuw aangeboden tot alles juist is.

### Eindscherm

- Confetti-animatie bij het voltooien.
- Statistieken: aantal juist, aantal fout, gemiddelde tijd per juist antwoord, totale tijd.
- **Oefen opnieuw met dezelfde opties** — nieuwe kaartjes uit dezelfde selectie, terug naar de deal-animatie.
- **Begin helemaal opnieuw** — terug naar stap 1.

### Overige

- **Optiesinfo-paneel** (sticky bovenaan): Toont altijd alle tafels en bewerkingen als badges (geselecteerd = helder, niet geselecteerd = gedimd), het gekozen aantal kaartjes vs. beschikbaar, en de geselecteerde modus.
- **Hamburger-menu** met:
  - **Info** — Uitleg over de app en de twee modi.
  - **Feedback** — Feedbackformulier dat via Web3Forms per email wordt verstuurd.
- **Reset-knop** (↺) — Opnieuw beginnen met bevestiging.
- **Analytics** — Vercel Web Analytics (pageviews) + Google Analytics GA4 met `round_completed` custom event (mode, tafels, bewerkingen, scores, tijden).

## Technisch

- Vanilla HTML/CSS/JS — geen framework, geen build step, geen dependencies.
- Werkt via `file://` (kaartdata staat inline in `index.html`).
- Bron van waarheid voor kaartdata: `maaltafels.json` (10 tafels × 11 vermenigvuldigingen + 11 delingen = 220 kaartjes).
- Dark theme, mobile-first responsive design met touch-geoptimaliseerde knoppen.
- Gehost op Vercel als static deployment.
