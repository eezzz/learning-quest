/* Question bank updates for each child, then start the app. Loaded last.
   - A child's progress remembers which bank version it was last used with (bankV).
   - When the bank is newer, the migrations in bank.js run once (they may only rename saved keys,
     never reset anything) and the child sees a short, calm note that new questions were added.
   - New children start on the current version. */

function bankSync(c){
  if(!c)return false;const from=c.bankV||1;if(from>=BANK.version)return false;
  for(let v=from+1;v<=BANK.version;v++){const f=BANK_MIGRATIONS[v];if(f)f(c)}
  c.bankV=BANK.version;c.bankNew={from,to:BANK.version,d:dayStr()};return true;
}
const _freshB=window.fresh;
window.fresh=function(p){const c=_freshB(p);c.bankV=BANK.version;return c};
const _applyProfileB=window.applyProfile;
window.applyProfile=function(){if(S&&bankSync(S))save();return _applyProfileB.apply(this,arguments)};

/* Vocabulary words can carry a grade (7th field; the first 48 are Grade 3). A child meets words up to
   their language level, at least Grade 3 words, in list order. */
window.nextWords=function(){
  const L=Math.max(3,S.profile.lang),learned=new Set((S.vocab&&S.vocab.learned)||[]);
  const ok=VOCAB.filter(v=>(v[6]||3)<=L).map(v=>v[0]),fresh=ok.filter(w=>!learned.has(w));
  return(fresh.length>=4?fresh:shuffle(ok)).slice(0,4);
};

/* ---------- home: a short note for two days after an update ---------- */
const _renderHomeB=window.renderHome;
window.renderHome=function(){
  _renderHomeB();if(!S||!S.bankNew)return;
  const days=(new Date(dayStr()+'T12:00:00')-new Date(S.bankNew.d+'T12:00:00'))/864e5;
  if(days>1)return;
  const h=$('#v-home .plan');if(h)h.insertAdjacentHTML('beforebegin',`<p class="fact banknew">🆕 New questions, words and stories were added. Your stars, cards and levels are all safe.</p>`);
};

/* ---------- parent dashboard → Data: bank version and what changed ---------- */
function bankCounts(){return{language:LITEMS.length,peopleLab:SOCIAL.length,brainSkills:EFI.length,vocabulary:VOCAB.length,discoveryCards:Object.values(DISCOVERIES).flat().length}}
const _renderParentB=window.renderParent;
window.renderParent=function(){
  _renderParentB();if(parTab!=='data')return;
  const n=bankCounts(),log=BANK.log.slice().reverse();
  const kids=ROOT.order.map(id=>ROOT.children[id]).filter(Boolean);
  const sec=`<section><h2>Question bank</h2><p>Version <b>${BANK.version}</b> · ${n.language} language questions · ${n.peopleLab} People Lab situations · ${n.brainSkills} Brain Skills items · ${n.vocabulary} vocabulary words · ${n.discoveryCards} Discovery cards.</p>
    <p class="fact">New versions only add questions. Stars, levels, cards, review items and mistakes are kept; nothing is reset.</p>
    ${kids.length?`<ul>${kids.map(c=>`<li>${esc(c.profile.name)}: version ${c.bankV||1}${c.bankNew?` (updated from version ${c.bankNew.from} on ${c.bankNew.d})`:''}</li>`).join('')}</ul>`:''}
    <h3>What's new</h3><ul>${log.map(l=>`<li><b>Version ${l.v}</b> (${l.d}): ${esc(l.notes)}</li>`).join('')}</ul></section>`;
  $('#v-par .parent').insertAdjacentHTML('beforeend',sec);
};

/* ---------- start: bring every child up to date, then boot ---------- */
if(typeof ROOT!=='undefined'&&ROOT&&ROOT.children){let ch=false;Object.values(ROOT.children).forEach(c=>{if(bankSync(c))ch=true});if(ch)save()}
boot();
