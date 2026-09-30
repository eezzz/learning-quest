# Content guide

All questions live in data files, separate from the code. This guide covers the formats, how to add content without breaking anyone's saved progress, and the quality bar.

## Banks and their keys

A child's progress (mistakes, review boxes, stamps, cards) is saved against item **keys**. How a bank is keyed decides how it may change.

| Bank | File | Keyed by | Adding items |
| --- | --- | --- | --- |
| Language K–5 | `content/lang-data.js`, `content/lang-data-45.js` | `id` | Anywhere, with a new unique id |
| Brain Skills | `content/ef-data.js` | `id` | Anywhere, with a new unique id |
| Vocabulary | `js/subjects/daily.js` (`VOCAB`) | the word | Anywhere, with a new word |
| People Lab | `content/social-data.js`, then `content/social-k2.js`, then packs | **position** | **Only at the end** |
| Word Lab lists (sentences, punctuation, proofreading, affixes) | `content/words-data.js`, `daily.js` | **position** | **Only at the end** |
| Discovery cards and expert words | `content/discover-data.js`, `content/expert-data.js` | interest + **position** | **Only at the end**, one expert word per card |
| Math | generators in `js/subjects/` | generator name | New generators or levels |

Never insert, reorder or remove a position-keyed item: every child's saved progress would point at the wrong question. Fixing the wording of an item in place is fine.

## Item formats

- **Language** (`LANG_ITEMS`): `{id, skill, grade, prompt, say?, visual?, choices:[{t, ok:true} | {t, why}], explain, hint}`. Exactly one choice has `ok:true`, and every wrong choice has a kind `why`.
- **People Lab** (`SOCIAL`): `{m, g?, e, s, q, o:[[best, why], [other, why], …]}`.
  - The **first** option is the best one; options are shuffled on screen.
  - Problem-size items use `sz` (0 small, 1 medium, 2 big) and `why` instead of `q` and `o`.
  - `g` is `[minGrade, maxGrade]`; the default is `[2,5]`.
- **Brain Skills** (`EF_ITEMS`): `kind:'choice'` (same shape as language items), `kind:'order'` (steps listed in the correct order) or `kind:'memory'` (`seq`, `names`, `ask`).
- **Vocabulary** (`VOCAB`): `[word, meaning, example with ___, synonym|null, antonym|null, emoji, grade?]`. Untagged words count as Grade 3.
- **Expert words** (`EXPERT[interest]`): `{jobs:[3 titles], words:[[word, sayIt, meaning, band m|h|c, question, [3 choices], answerIndex], …]}`, one word per Discovery card, in the same order.

## Adding content: packs and versions

1. Create `data/packs/v<N>-<name>.js`:

   ```js
   pack({
     lang:   [ /* language items */ ],
     ef:     [ /* Brain Skills items */ ],
     vocab:  [ /* vocabulary entries */ ],
     social: [ /* People Lab items: appended after every earlier set, never reorder */ ]
   });
   ```

2. Add it to `index.html` after the existing packs.
3. In `data/bank.js`, raise `BANK.version` and add a changelog line. Only add a `BANK_MIGRATIONS[N]` if keys must be renamed; a migration must never reset progress.
4. Run `node tools/bank-check.js`. It fails when:
   - a locked key disappeared;
   - position-keyed items moved;
   - items were added without raising the version;
   - expert words and Discovery cards no longer match.
5. When it prints OK, run `node tools/bank-check.js --update` to record the release in `data/bank-lock.json`.

When a child opens the updated app, their progress moves to the new version once and nothing is reset. They see a calm two-day note on Home, and Parent → Backup shows the version and changelog.

## Quality bar

Every new item is reviewed by someone other than its author:

- There is exactly one answer that is right, and no wrong choice can be argued right.
- Facts are true; passages about nature and science are checked.
- Pictures match the word a child would say. Avoid emoji that older iPads can't show.
- The reading level fits the grade: at most 12 words per sentence for K–2 and 18 for Grades 3–5.
- There is no slash notation like /k/ in text that is read aloud.
- Social items explain the hidden rule and how others feel, never demand eye contact, and treat stimming, breaks and headphones as valid.
- Nothing is scary or violent, and nothing mocks any group.
