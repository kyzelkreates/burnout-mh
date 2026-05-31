# 🌿 Recharge — Burnout Recovery & Energy Restoration Platform

A structured, self-guided Progressive Web App for burnout recovery.

## What This Is

Recharge is a burnout recovery and energy restoration PWA built around evidence-informed recovery science. It helps users:

- Track their daily energy levels through structured check-ins
- Follow a 5-phase guided recovery program
- Practice breathwork, grounding, and restorative activities
- Monitor recovery progress over time
- Access an AI recovery guide for common questions

## Structure

```
/
├── index.html                    → Root redirect to demo
├── fp-courses.js                 → Full recovery program content (SSOT)
├── ap3x/
│   ├── companion/                → The main PWA (user-facing)
│   │   ├── index.html            → Recovery Dashboard (Home)
│   │   ├── log.html              → Energy Check-In
│   │   ├── course-picker.html    → Recovery Programs list
│   │   ├── course-view.html      → Program detail + session viewer
│   │   ├── courses.html          → In-app curriculum view
│   │   ├── progress.html         → Recovery tracking dashboard
│   │   ├── enrichment.html       → Restorative practices
│   │   ├── coach.html            → AI Recovery Guide
│   │   ├── app-shared.js         → SSOT: all data, state, utilities
│   │   ├── app.css               → Shared styles (calm teal palette)
│   │   ├── manifest.json         → PWA manifest
│   │   └── sw.js                 → Service worker (offline cache)
│   └── demo/
│       └── index.html            → Marketing/demo landing page
```

## Recovery Programs Included

1. **Burnout Reset Program** — 5 phases, 25 sessions (complete foundation)
2. **Stress Recovery Pathway** — 2 phases, 7 sessions (targeted stress relief)
3. **Focus & Clarity Rebuild** — 1 phase, 3 sessions (cognitive recovery)
4. **Energy Mastery Plan** — placeholder (advanced tier)

## Technical Notes

- **No dependencies.** Vanilla HTML/CSS/JS only.
- **Offline-first.** Service worker caches all assets.
- **Local storage.** All user data stored in localStorage — no server, no account.
- **Single Source of Truth.** All content flows from `app-shared.js` (curriculum, activities, tips, AI responses) and `fp-courses.js` (extended program library).
- **PWA installable.** Works on iOS, Android, and desktop.

## Deployment

Deploy to any static host (Netlify, Vercel, GitHub Pages):

```
netlify deploy --dir . --prod
# or
vercel --prod
```

The `netlify.toml` and `vercel.json` configs are included.

## Data Model

| Old (Dog Training) | New (Burnout Recovery) |
|---|---|
| course | recoveryProgram |
| module | recoveryPhase |
| lesson | recoverySession |
| quiz | energyCheckIn / knowledgeCheck |
| dog / puppy | user / individual |
| trainer | coach / guide |
| behaviour issue | burnout symptom / stress signal |
| training goal | recovery goal |
| XP | EP (Energy Points) |
