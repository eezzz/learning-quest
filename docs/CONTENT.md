# Content guide

All questions live in data files, separate from the code. This guide covers the formats, how to add content without breaking anyone's saved progress, and the quality bar.

## One pack for every platform

All content lives in `content/src/*.json`. Those files are the only place to edit questions. `tools/build-content.js` turns them into one pack:

| File | Read by |
| --- | --- |
| `content/bundle.js` | the web app |
| `content/bundle.json` | the native apps |
| `content/manifest.json` | apps checking for a new pack: `version`, `schema`, `bytes`, `sha256` |

Code never holds question content. The exceptions are math generators and `AFFIXES`, which contain logic and stay in `js/subjects/`.

**Web** gets a new pack as soon as `main` deploys (browsers may cache it for about 10 minutes).

**Native apps** check the manifest in the background at launch, download a newer pack, verify its size and checksum, and use it from the next launch, so questions never change in the middle of a day's practice. If anything is wrong with a stored pack, the app uses the pack it shipped with.

`schema` is the pack format. Raise it only when a change would break older apps; they then ignore the pack and keep the one they have until they are updated. Adding items never needs a schema change. Apple doesn't allow downloading code, so a pack must only ever hold data.

## Banks and their keys

A child's progress is saved against item **keys**. How a bank is keyed decides how it may change.

| Bank | File in `content/src` | Keyed by | Adding items |
| --- | --- | --- | --- |
| Language K–5 | `language.json` | `id` | Anywhere, with a new unique id |
| Brain Skills | `brain.json` | `id` | Anywhere, with a new unique id |
| Vocabulary | `vocabulary.json` | the word | Anywhere, with a new word |
| People Lab | `people.json` | **position** | **Only at the end** |
| Word Lab lists | `words.json` | **position** | **Only at the end** |
| Discovery cards and expert words | `discovery.json`, `expert.json` | interest + **position** | **Only at the end**, one expert word per card |

Never insert, reorder or remove a position-keyed item: every child's saved progress would point at the wrong question. Fixing the wording of an item in place is fine.

## Text markup

Pack text may only use this markup, so every platform can draw it. `tools/build-content.js` rejects anything else.

| Markup | Meaning |
| --- | --- |
| `<b>...</b>` | Bold |
| `<br>` | Line break |
| `<div class="bigletter">` | One big letter |
| `<div class="wx big">` | Big emoji |
| `<div class="wsent">` | A sentence panel |
| `<div class="passage">` | A reading passage |
| `<span class="blank">` | The blank in a sentence |

## Item formats

- **Language:** `{id, skill, grade, prompt, say?, visual?, choices:[{t, ok:true} | {t, why}], explain, hint}`. Exactly one choice has `ok:true`, and every wrong choice has a kind `why`.
- **People Lab:** `{m, g?, e, s, q, o:[[best, why], [other, why], …]}`.
  - The **first** option is the best one; options are shuffled on screen.
  - Problem-size items use `sz` (0 small, 1 medium, 2 big) and `why` instead of `q` and `o`.
  - `g` is `[minGrade, maxGrade]`; the default is `[2,5]`.
- **Brain Skills:** `kind:'choice'` (same shape as language items), `kind:'order'` (steps listed in the correct order) or `kind:'memory'` (`seq`, `names`, `ask`).
- **Vocabulary:** `[word, meaning, example with ___, synonym|null, antonym|null, emoji, grade?]`. Untagged words count as Grade 3.
- **Expert words:** `{jobs:[3 titles], words:[[word, sayIt, meaning, band m|h|c, question, [3 choices], answerIndex], …]}`, one word per Discovery card, in the same order.

## Releasing a pack

1. Edit `content/src/*.json`, adding new position-keyed items at the end.
2. In `content/src/meta.json`, raise `version` and add a `log` line.
3. Run `node tools/build-content.js`, then `node tools/bank-check.js`. The check fails when a locked key disappeared, position-keyed items moved, items were added without raising the version, or expert words and Discovery cards no longer match.
4. Run `node tools/bank-check.js --update` to record the release in `content/bank-lock.json`.
5. Merge to `main`. Every platform picks it up, with no app update.

The first launch after a pack, each child's progress moves to the new version once and nothing is reset. They see a calm two-day note on Home on the web. If keys must be renamed, add a migration to `BANK_MIGRATIONS` in `js/app/main.js`; that is code, so it needs an app release.

## Quality bar

Every new item is reviewed by someone other than its author:

- There is exactly one answer that is right, and no wrong choice can be argued right.
- Facts are true; passages about nature and science are checked.
- Pictures match the word a child would say. Avoid emoji that older iPads can't show.
- The reading level fits the grade: at most 12 words per sentence for K–2 and 18 for Grades 3–5.
- There is no slash notation like /k/ in text that is read aloud.
- Social items explain the hidden rule and how others feel, never demand eye contact, and treat stimming, breaks and headphones as valid.
- Nothing is scary or violent, and nothing mocks any group.
