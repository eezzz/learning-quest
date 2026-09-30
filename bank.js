/* Question bank versions.
   Progress is saved against item keys, so the bank only ever grows in ways that keep old keys valid:
   - Items with ids (language, Brain Skills) and words (vocabulary) can be added anywhere.
   - Items saved by position (People Lab situations, Discovery cards, expert words, punctuation,
     proofreading and sentence lists) are only ever appended at the end. People Lab items from packs
     are added after the Kindergarten–Grade 2 set (see family.js), so no position moves.
   New content comes in packs (packs/v2-*.js) that call pack(). tools/bank-check.js compares the bank
   with bank-lock.json and fails if any saved key would move or disappear; run it before every release.
   Loaded after the data files and before the packs. */

const BANK={version:1,log:[
  {v:1,d:'2026-09-27',notes:'First release: K–5 language, math, People Lab, Brain Skills, 48 vocabulary words, Discovery cards and expert words.'}
]};
// One migration per version, run once for each child whose progress is older. They must only rename
// or move saved keys, never reset progress. Versions that only add items need none.
const BANK_MIGRATIONS={};
const PACK_SOCIAL=[];
function pack(p){
  (p.lang||[]).forEach(it=>(it.grade>=4?LANG_ITEMS_45:LANG_ITEMS).push(it));
  (p.ef||[]).forEach(it=>EF_ITEMS.push(it));
  (p.vocab||[]).forEach(v=>VOCAB.push(v));
  (p.social||[]).forEach(it=>PACK_SOCIAL.push(it));
}
