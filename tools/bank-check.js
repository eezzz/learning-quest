#!/usr/bin/env node
/* Question bank guard. Run before every release:
     node tools/bank-check.js            check the bank against data/bank-lock.json
     node tools/bank-check.js --update   check, then record the current bank as the new lock (data/bank-lock.json)
   Children's progress points at items by key: an id, a word, or a position in a list. This check fails
   when a locked key disappears or a position-keyed item moves, which would attach saved progress to the
   wrong question. Adding items is always fine. Editing the text of a position-keyed item is reported;
   add --accept-edits when it is only a wording fix of the same question. */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const ROOT=path.join(__dirname,'..'),LOCK=path.join(ROOT,'data','bank-lock.json');
const args=process.argv.slice(2),UPDATE=args.includes('--update'),ACCEPT=args.includes('--accept-edits');

// Load the data scripts in the order index.html loads them, up to the first program file.
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const data=scripts.slice(0,scripts.findIndex(f=>path.basename(f)==='en.js'));
const src=data.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n;\n')+`
;SOCIAL.push(...SOCIAL_K2,...PACK_SOCIAL);// same order as family.js
__out={BANK,SOCIAL,LANG:LANG_ITEMS.concat(LANG_ITEMS_45),EF:EF_ITEMS,VOCAB,AFFIXES,PUNCT,PROOF,SENTS,ADV_SENTS,WORDTAG,DISCOVERIES,EXPERT};`;
const ctx={console,Math,Date,JSON};vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'bank'});
const B=ctx.__out;
const fp=x=>crypto.createHash('sha1').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex').slice(0,10);

// Every bank: how its saved keys are formed. 'pos' banks are keyed by position, 'id' banks by a stable id.
const banks={
  social:{type:'pos',keys:B.SOCIAL.map((it,i)=>[String(i),fp([it.m,it.s,it.q||it.sz])])},
  lang:{type:'id',keys:B.LANG.map(it=>[it.id,fp(it.prompt+(it.visual||''))])},
  ef:{type:'id',keys:B.EF.map(it=>[it.id,fp(it.prompt||it.seq||'')])},
  vocab:{type:'id',keys:B.VOCAB.map(v=>[v[0],fp(v[1])])},
  wordtag:{type:'id',keys:Object.keys(B.WORDTAG).map(w=>[w,fp(B.WORDTAG[w])])},
  affixes:{type:'pos',keys:B.AFFIXES.map((a,i)=>[String(i),fp(a)])},
  punct:{type:'pos',keys:B.PUNCT.map((a,i)=>[String(i),fp(a)])},
  proof:{type:'pos',keys:B.PROOF.map((a,i)=>[String(i),fp(a)])},
  sents:{type:'pos',keys:B.SENTS.map((a,i)=>[String(i),fp(a)])},
  advsents:{type:'pos',keys:B.ADV_SENTS.map((a,i)=>[String(i),fp(a)])},
  discover:{type:'pos',keys:Object.entries(B.DISCOVERIES).flatMap(([k,l])=>l.map((c,i)=>[k+':'+i,fp(c[1])]))},
  expert:{type:'pos',keys:Object.entries(B.EXPERT).flatMap(([k,e])=>e.words.map((w,i)=>[k+':'+i,fp(w[0])]))}
};
// Discovery cards and expert words must stay paired card for card.
Object.keys(B.EXPERT).forEach(k=>{if(B.EXPERT[k].words.length!==(B.DISCOVERIES[k]||[]).length)throw new Error(`expert words for ${k} do not match its Discovery cards`)});

const errors=[],edits=[],added={};
for(const[name,b]of Object.entries(banks)){
  const seen=new Set();b.keys.forEach(([k])=>{if(seen.has(k))errors.push(`${name}: duplicate key "${k}"`);seen.add(k)});
}
const lock=fs.existsSync(LOCK)?JSON.parse(fs.readFileSync(LOCK,'utf8')):null;
if(lock){
  if(B.BANK.version<lock.version)errors.push(`BANK.version ${B.BANK.version} is older than the lock (${lock.version})`);
  for(const[name,old]of Object.entries(lock.banks)){
    const now=banks[name];if(!now){errors.push(`${name}: bank is missing`);continue}
    const cur=new Map(now.keys);
    old.keys.forEach(([k,f])=>{
      if(!cur.has(k))errors.push(`${name}: "${k}" was removed or renamed (saved progress points at it)`);
      else if(cur.get(k)!==f)(old.type==='pos'?edits:[]).push(`${name}: item ${k} changed`);
    });
    added[name]=now.keys.length-old.keys.length;
  }
  if(edits.length&&!ACCEPT){
    const by={};edits.forEach(e=>{const n=e.split(':')[0];(by[n]=by[n]||[]).push(e.split(' item ')[1].replace(' changed',''))});
    Object.entries(by).forEach(([n,ks])=>errors.push(ks.length>3
      ?`${n}: ${ks.length} position-keyed items changed (first: ${ks.slice(0,3).join(', ')}). It looks like items were inserted, removed or reordered. Put new items at the end instead.`
      :`${n}: item${ks.length>1?'s':''} ${ks.join(', ')} changed. If this is only a wording fix of the same question, rerun with --accept-edits.`));
  }
  if(Object.values(added).some(n=>n>0)&&B.BANK.version===lock.version)errors.push(`items were added but BANK.version is still ${lock.version}: raise it in bank.js and add a log entry`);
}
const counts=Object.fromEntries(Object.entries(banks).map(([n,b])=>[n,b.keys.length]));
console.log(`Bank version ${B.BANK.version}`+(lock?` (lock: version ${lock.version})`:' (no lock yet)'));
console.log(Object.entries(counts).map(([n,c])=>`  ${n.padEnd(9)} ${String(c).padStart(4)}${added[n]?`  (+${added[n]})`:''}`).join('\n'));
if(errors.length){console.error('\nFAILED\n- '+errors.join('\n- '));process.exit(1)}
if(edits.length)console.log(`\n${edits.length} wording edit(s) accepted.`);
if(UPDATE){fs.writeFileSync(LOCK,JSON.stringify({version:B.BANK.version,date:new Date().toISOString().slice(0,10),counts,banks},null,0)+'\n');console.log('\nbank-lock.json updated.')}
else console.log('\nOK: every saved key still points at the same item.');
