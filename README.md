# Learning Quest

A daily learning game for K–5 kids: three short parts a day (words, math, people skills), one small step at a time, with a Discovery card for every finished day.

Live: https://eezzz.github.io/learning-quest/

It is a static web app (no build step, no server). Progress is saved in the browser on each device; the parent dashboard has a backup code.

## Run locally

Serve the folder with any static server and open `http://localhost:<port>/`, for example:

```
python -m http.server 8791
```

## Folder structure

```
index.html              the page; loads every script in a fixed order (see below)
manifest.webmanifest    "Add to Home Screen" settings
assets/icons/           app icons
css/styles.css          all styles (dark theme first, then the light theme)

data/                   content only: question banks and their versions
  content/              the base banks
    words-data.js         word lists, sentences, punctuation and proofreading (Word Lab)
    lang-data.js          language questions K–3
    lang-data-45.js       language questions Grades 4–5
    social-data.js        People Lab situations, Grades 2–5
    social-k2.js          People Lab situations, K–2
    ef-data.js            Brain Skills (executive function) items
    discover-data.js      Discovery cards: 17 interests × 12
    expert-data.js        one expert word per Discovery card
  bank.js               question bank version, changelog, and pack()
  packs/                content added in later versions (v2-*.js)
  bank-lock.json        every saved key of the released bank (written by tools/bank-check.js)

js/
  subjects/             subject logic
    math-lab.js           word-problem stories and bar models
    curriculum.js         math generators, the math path, interests and themes
    math-more.js          more math generators (Grades 3–5)
    daily.js              daily vocabulary and word review
  i18n/en.js            interface text (English)
  app/                  the app, in load order; later files wrap earlier functions
    app.js                core: screens, question types, missions, saving
    family.js             several children, grown-up gate, voice mode, parent dashboard
    phase2.js             mastery, spaced review, frustration signals, Brain Skills, weekly report
    rewards.js            one-step-a-day lock, Discovery cards, gold cards
    expert.js             expert words, stamps and titles
    report.js             Feedback report, adaptive practice, light/dark appearance
    main.js               brings each child up to the current bank version, then boot()

tools/bank-check.js     release check for the question bank (run with Node)
docs/                   DEVELOPMENT.md (architecture, saved state, testing), CONTENT.md (bank formats, packs)
CHANGELOG.md            what changed, by date
```

More detail: [Development guide](docs/DEVELOPMENT.md) · [Content guide](docs/CONTENT.md) · [Changelog](CHANGELOG.md)

## Adding questions

1. Put new items in a new pack under `data/packs/` that calls `pack({...})`, and add it to `index.html` after the other packs. Never insert, reorder or remove existing People Lab items: they are saved by position.
2. Raise `BANK.version` in `data/bank.js` and add a changelog line.
3. Run `node tools/bank-check.js`. It must print OK. Then run `node tools/bank-check.js --update` to record the release.

## Releasing

Bump the `?v=` number of every changed file in `index.html` so tablets load the new version, then merge to `main`. GitHub Pages publishes `main`.
