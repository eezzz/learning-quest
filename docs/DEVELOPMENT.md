# Development guide

Learning Quest is a static web app: plain HTML, CSS and classic `<script>` files, with no build step, framework or server. GitHub Pages serves the `main` branch.

## Running it

```
python -m http.server 8791
```

Open `http://localhost:8791/`. Any static server works. Use an iPad-sized window (768 × 1024) to check layouts.

## How the scripts fit together

`index.html` loads every script in a fixed order. There are no modules; each file adds globals.

1. **Content** (`data/content/*.js`): constants only, such as `LANG_ITEMS`, `SOCIAL`, `EF_ITEMS`, `DISCOVERIES` and `EXPERT`.
2. **Subject logic** (`js/subjects/*.js`): math generators (`GEN`), the math curriculum, interests and themes, and daily vocabulary.
3. **Bank** (`data/bank.js`, then `data/packs/*.js`): the bank version and `pack()`, which appends newer content to the base banks.
4. **Text** (`js/i18n/en.js`): the `STR` interface strings.
5. **App** (`js/app/*.js`), each layer building on the one before:

| File | Adds |
| --- | --- |
| `app.js` | Core: views, question types (`mkChoice`, `rChoice`, `rSort`, …), missions, `R` (the running round), saving |
| `family.js` | Several children, "who is learning", grown-up gate, check-in, voice mode, daily plan builders, parent dashboard |
| `phase2.js` | Mastery, spaced review (Leitner 1/3/7/14/30 days), frustration signals, Brain Skills, weekly report |
| `rewards.js` | One-step-a-day lock, Discovery cards, gold cards, tomorrow's preview |
| `expert.js` | Expert words, stamps and titles |
| `report.js` | Feedback report, focus skills and adaptive practice, light/dark appearance |
| `main.js` | Brings each child up to the current bank version, then calls `boot()` |

**Extending behavior.** A later file wraps an earlier global function instead of editing it:

```js
const _renderHomeX = window.renderHome;
window.renderHome = function () { _renderHomeX(); /* add to the home screen */ };
```

Top-level `function` declarations are properties of `window`, so internal calls pick up the wrapped version. Keep the wrapper order in mind when debugging: the last file loaded runs outermost.

## Saved state

Everything is saved in `localStorage` under `learning-quest-v3` as `ROOT = {v:3, children:{id: child}, order, active}`. `S` is the active child. Main fields of a child:

| Field | Meaning |
| --- | --- |
| `profile` | Name, age, grade, `math` and `lang` levels, `interests`, `support` (voice, autoRead, breaks, surprise, bigText, perPart, extra, adapt) |
| `today` | Today's plan: `{d, n, plan:['dw','dm','ds'], done, topics, words, card, cardGot, rewarded, checkin, checkout}` |
| `stars`, `done`, `best`, `days`, `fullDays`, `log` | Rewards and history (`log` entries include first-try `good/total` and `sec`) |
| `mistakes`, `review`, `mastery` | Mistakes, Leitner boxes, mastery per skill (`m = 0.7·m + 0.3·c`) |
| `skillHist`, `posStats`, `focus`, `focusOff` | Feedback report inputs and focus skills |
| `cards`, `cardIdx`, `expert` | Discovery cards owned, next card per interest, expert stamps |
| `bankV`, `bankNew` | Question bank version this child's progress is on |

Saved keys point at bank items: `lg:<id>`, `ef:<id>`, `v:<word>`, `so:<position>`, `mt:<generator>`, and positions for the Word Lab lists. That is why banks only grow by appending (see [CONTENT.md](CONTENT.md)).

The appearance choice is stored per device under `learning-quest-theme`. It is applied in `index.html` before the page draws.

## Product rules the code keeps

- **One small step a day.** The daily plan is the whole day's practice. The Labs are view-only unless a parent turns on "Allow extra practice".
- **The day never changes under the child.** The plan, focus skills and settings changes take effect with the next day's plan.
- **Rewards only go up.** There are no lost points or disappearing rewards, and surprises are predictable.
- **Right is always green, wrong is always red,** in every question type and both themes.
- **Calm by default.** Motion is small and stops in calm mode or with reduced motion. Nothing flashes more than 3 times per second, and there are no timers.
- **Neurodiversity-affirming wording.** Explain what others may think; never demand eye contact or "act normal".

## Testing

There is no test runner. Before a release:

1. Run `node tools/bank-check.js`. It must print OK.
2. Open the app and watch the console for errors.
3. In the console, render every item and check that each has exactly one right answer. Use `langR`, `soR`, `efR` and `vocabQ`, then check `opts.filter(o => o.ok).length === 1`.
4. Build the daily plan for each grade (K–5) and check the parts are the right size and fit the grade.
5. Check the home screen, a question, the results screen and the parent dashboard in both themes.

Use a throwaway test child and delete it afterwards: `delete ROOT.children[id]`, remove it from `ROOT.order`, then call `save()`.

## Releasing

1. Raise the `?v=` number of every changed file in `index.html`, so tablets don't keep an old cached copy.
2. Open a pull request into `main` and merge it. GitHub Pages publishes within a minute or two.
3. Check the live site: https://eezzz.github.io/learning-quest/

## House rules for this public repository

- No diagnosis labels on public pages, in the README, or in the repository description.
- Never commit photos of children's homework or worksheets, or any personal data.
