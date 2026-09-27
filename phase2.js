/* Phase 2: mastery and spaced review, frustration signals, Brain Skills (executive function),
   and the parent weekly report. Loaded after family.js; function declarations here replace older ones. */

/* ================= MASTERY + SPACED REVIEW =================
   Every answered item updates the mastery of its skill: m = 0.7·m + 0.3·c (c = 1 when right the first time).
   A missed item enters a Leitner box and comes back after 1, 3, 7, 14 and 30 days; a right answer in review
   moves it up a box, a wrong one sends it back to box 1. */
const REVIEW_DAYS=[1,3,7,14,30];
function addDays(d,n){const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return dayStr(x)}
function skillOf(k){
  const p=k.split(':'),a=p[0];
  if(a==='mt')return'math:'+p[1];
  if(a==='lg'){const it=LANG_BY_ID[p[1]];return'lang:'+(it?it.skill:'other')}
  if(a==='so'){const it=SOCIAL[+p[1]];return'social:'+(it?it.m:'other')}
  if(a==='ef'){const it=EF_BY_ID[p[1]];return'ef:'+(it?it.skill:'other')}
  if(a==='v')return'lang:vocab';if(a==='af')return'lang:affix';
  return'lang:grammar-'+a;
}
function ensureReview(){
  if(!S)return;S.mastery=S.mastery||{};S.masterySnap=S.masterySnap||{};S.frustration=S.frustration||[];
  if(!S.review){S.review={};Object.keys(S.mistakes||{}).forEach(k=>S.review[k]={box:1,due:dayStr()})}// older mistakes start in box 1
}
function recordAnswer(k,right){
  if(!k||!S)return;ensureReview();
  const sk=skillOf(k),m=S.mastery[sk]??0.5;S.mastery[sk]=+(0.7*m+0.3*(right?1:0)).toFixed(3);
  const r=S.review[k],d=dayStr();
  if(!right){S.review[k]={box:1,due:addDays(d,1)};return}
  if(r&&r.due<=d){if(r.box>=REVIEW_DAYS.length){delete S.review[k];delete S.mistakes[k]}else S.review[k]={box:r.box+1,due:addDays(d,REVIEW_DAYS[r.box])}}
}
function addMistake(k){if(!k)return;S.mistakes[k]=(S.mistakes[k]||0)+1;recordAnswer(k,false)}
function clearMistake(k){if(!k)return;if(S.mistakes[k]){S.mistakes[k]--;if(S.mistakes[k]<=0)delete S.mistakes[k]}recordAnswer(k,true)}
// Items due for review today, lowest box first. test = filter on the key.
function dueKeys(test){ensureReview();const d=dayStr();return Object.entries(S.review).filter(([k,r])=>r.due<=d&&test(k)).sort((a,b)=>a[1].box-b[1].box).map(e=>e[0])}

/* ================= DAILY SETS USE THE REVIEW QUEUE ================= */
function buildDailyMath(N){
  const topic=MISS[today().topics.m],lv=lvFor(topic);
  if(!topic.gen.length)return topic.build(lv).slice(0,N);
  const main=topic.build(lv).slice(0,N-2),path=WORLDS.m.missions.filter(m=>m.id!==topic.id&&m.gen.length),inPath=k=>path.some(m=>m.gen.includes(k));
  const due=dueKeys(k=>k.startsWith('mt:')).map(k=>k.slice(3)).filter(k=>GEN[k]&&inPath(k)&&!topic.gen.includes(k));
  const done=path.filter(m=>S.done[m.id]).flatMap(m=>m.gen);
  const pool=[...new Set(due.concat(shuffle(done.length?done:path.flatMap(m=>m.gen))))].filter(k=>GEN[k]).slice(0,2);
  return main.concat(pool.map(k=>GEN[k](lv)));
}
function langReview(tw,k){
  const g=S.profile.lang,out=[];
  dueKeys(x=>x.startsWith('lg:')).map(x=>LANG_BY_ID[x.slice(3)]).filter(it=>it&&it.grade<=g&&it.skill!==tw.skill).slice(0,k).forEach(it=>out.push(langR(it)));
  const doneSk=LANG_MISSIONS.filter(m=>m.grade<=g&&m.id!==tw.id&&S.done[m.id]).map(m=>m.skill);
  const pool=LITEMS.filter(it=>it.skill!==tw.skill&&!out.some(o=>o.key==='lg:'+it.id)&&(doneSk.length?doneSk.includes(it.skill):it.grade===Math.min(g,5)));
  take(pool,k-out.length).forEach(it=>out.push(langR(it)));
  return out;
}
function wordReview(){
  const k=dueKeys(x=>/^[wspfq]:/.test(x));
  if(k.length){const r=fromKey(k[0]);if(r)return r}
  return pick([()=>sortR(pick(sort4Words())),()=>punctR(rnd(PUNCT.length)),()=>pairR(rnd(ADV_SENTS.length)),()=>proofR(rnd(PROOF.length)),()=>sentR(sentIdx('a',1)[0],'a')])();
}
function buildDailySocial(N){
  const topic=MISS[today().topics.s],g=S.profile.grade;
  const main=topic.ef?efBuild(topic.ef,N-1):topic.build().slice(0,topic.sm===3?N:N-1);
  if(topic.sm===3)return main;// the calm-tools topic already starts with a breathing exercise
  const due=dueKeys(k=>k.startsWith('so:')).map(k=>+k.slice(3)).filter(i=>SOCIAL[i]&&fitG(SOCIAL[i],g)&&SOCIAL[i].m!==topic.sm);
  const other=SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m!==topic.sm&&fitG(SOCIAL[i],g)&&S.done['s'+SOCIAL[i].m]);
  const i=due[0]??(other.length?pick(other):null);
  return i==null?main:main.concat([soR(i)]);
}

/* ================= BRAIN SKILLS (executive function) ================= */
const EFS=typeof EF_SKILLS!=='undefined'?EF_SKILLS:[],EFI=typeof EF_ITEMS!=='undefined'?EF_ITEMS:[];
const EF_BY_ID={};EFI.forEach(it=>EF_BY_ID[it.id]=it);
const EF_MISSIONS=EFS.map(k=>({id:'e-'+k.key,world:'s',ef:k.key,name:k.name,icon:k.icon,short:k.short,learn:k.learn,tip:k.tip,card:k.card,spec:k.spec,bonus:null,what:k.what||k.short,why:k.why||k.learn,build:()=>efBuild(k.key,5)}));
EF_MISSIONS.forEach(m=>MISS[m.id]=m);
SOCIAL_MISSIONS.forEach((m,i)=>m.sm=i+1);
function efFit(it){const g=S.profile.grade,r=it.g||[0,5];return g>=r[0]&&g<=r[1]}
function efR(it){
  if(it.kind==='order')return{type:'order',key:'ef:'+it.id,it};
  if(it.kind==='memory')return{type:'memory',key:'ef:'+it.id,it};
  const long=it.choices.some(c=>strip(c.t).length>14);
  return{type:'choice',key:'ef:'+it.id,prompt:it.prompt,say:it.say||it.prompt,visual:it.visual||'',wide:long,explain:it.explain,hint:it.hint,opts:it.choices.map(c=>({t:c.t,say:c.say||strip(c.t),ok:!!c.ok,why:c.why}))};
}
function efBuild(key,n){
  const all=EFI.filter(it=>it.skill===key),fit=all.filter(efFit),pool=fit.length>=n?fit:fit.concat(all.filter(i=>!fit.includes(i)));
  const due=dueKeys(k=>k.startsWith('ef:')).map(k=>EF_BY_ID[k.slice(3)]).filter(it=>it&&it.skill===key&&efFit(it));
  const items=[...new Set(due.concat(shuffle(pool)))].slice(0,n);
  return[ruleR(MISS['e-'+key])].concat(items.map(efR));
}
// Social topics with a Brain Skills level after every two (a fourth strand in the People part).
function socialPath(){
  if(!EF_MISSIONS.length)return SOCIAL_MISSIONS;
  const out=[],ef=EF_MISSIONS.slice();SOCIAL_MISSIONS.forEach((m,i)=>{out.push(m);if(i%2===1&&ef.length)out.push(ef.shift())});return out.concat(ef);
}
// Put steps in order: tap them one by one.
function rOrder(r,st){
  const it=r.it,steps=it.steps;let next=0,tries=0;
  setPrompt(it.prompt,it.say||it.prompt);
  const done=el('ol','orderdone');st.appendChild(done);
  const box=el('div','choices wide');st.appendChild(box);
  shuffle(steps.map((s,i)=>({s,i}))).forEach(o=>{const b=el('button','choice',o.s);b.dataset.say=strip(o.s);
    b.onclick=()=>{if(R.cur.done||b.disabled)return;
      if(o.i===next){b.disabled=true;b.classList.add('right');done.appendChild(el('li','',o.s));next++;SFX.tap();$('#hint').textContent='';
        if(next===steps.length){R.cur.done=true;st.classList.add('locked');R.cur.err?addMistake(r.key):clearMistake(r.key);finish(!R.cur.err,[it.explain].filter(Boolean),null,R.cur.err)}}
      else{R.cur.err=true;tries++;shake(b);SFX.bad();$('#hint').innerHTML='🤔 '+(tries>=2&&it.hint?it.hint:`What has to happen first? Step ${next+1} comes next.`)}};
    box.appendChild(b)});
}
// Working memory: see a short sequence, then tap it back in order or find the missing one.
function rMemory(r,st){
  const it=r.it,seq=it.seq,names=it.names||seq,showMs=1500+seq.length*900;let shown=0;
  const stageBox=el('div','memseq');st.appendChild(stageBox);
  const play=()=>{shown++;stageBox.innerHTML=seq.map(e=>`<span>${e}</span>`).join('');setPrompt('Remember these! 👀',`Remember these: ${names.join(', ')}.`);
    $('#actions').innerHTML='';setTimeout(()=>{stageBox.innerHTML=seq.map(()=>'<span class="hid">?</span>').join('');ask()},showMs)};
  const again=()=>{if(shown<2){const b=el('button','ghost','👀 Show me again');b.onclick=()=>{b.remove();box&&box.remove();play()};$('#actions').appendChild(b)}};
  let box=null;
  const ask=()=>{
    if(it.ask==='missing'){const miss=rnd(seq.length),left=seq.filter((_,i)=>i!==miss);
      stageBox.innerHTML=left.map(e=>`<span>${e}</span>`).join('');
      setPrompt(it.prompt||'Which one is missing?','Which one is missing?');
      const others=['🍎','⭐','🐟','🌙','🚗','🎈','🐸','🍌','🔑','🌼'].filter(e=>!seq.includes(e));
      box=el('div','choices');st.appendChild(box);let tries=0;
      shuffle([seq[miss]].concat(take(others,2))).forEach(e=>{const b=el('button','choice pic',e);b.dataset.say=e===seq[miss]?names[miss]:'this one';
        b.onclick=()=>{if(R.cur.done||b.disabled)return;if(e===seq[miss]){R.cur.done=true;b.classList.add('right');st.classList.add('locked');stageBox.innerHTML=seq.map(x=>`<span>${x}</span>`).join('');R.cur.err?addMistake(r.key):clearMistake(r.key);finish(!R.cur.err,[it.tip].filter(Boolean),null,R.cur.err)}
          else{R.cur.err=true;tries++;b.disabled=true;b.classList.add('wrong');shake(b);SFX.bad();$('#hint').textContent=it.tip||'Try saying the names quietly.';if(tries>=2){R.cur.done=true;st.classList.add('locked');finish(false,[`The missing one was ${seq[miss]}.`,it.tip].filter(Boolean))}}};box.appendChild(b)});
      again();return}
    setPrompt(it.prompt||'Tap them in the same order.','Tap them in the same order.');
    box=el('div','choices');st.appendChild(box);let next=0,tries=0;
    shuffle(seq.map((e,i)=>({e,i}))).forEach(o=>{const b=el('button','choice pic',o.e);b.dataset.say=names[o.i];
      b.onclick=()=>{if(R.cur.done||b.disabled)return;
        if(seq[next]===o.e){b.disabled=true;b.classList.add('right');stageBox.children[next].textContent=o.e;stageBox.children[next].classList.remove('hid');next++;SFX.tap();
          if(next===seq.length){R.cur.done=true;st.classList.add('locked');R.cur.err?addMistake(r.key):clearMistake(r.key);finish(!R.cur.err,[it.tip].filter(Boolean),null,R.cur.err)}}
        else{R.cur.err=true;tries++;shake(b);SFX.bad();$('#hint').textContent=it.tip||'Say the names quietly to help you remember.';
          if(tries>=3){R.cur.done=true;st.classList.add('locked');stageBox.innerHTML=seq.map(x=>`<span>${x}</span>`).join('');addMistake(r.key);finish(false,[`The order was ${seq.join(' ')}.`,it.tip].filter(Boolean))}}};
      box.appendChild(b)});
    again();
  };
  play();
}

/* ================= FRUSTRATION SIGNALS =================
   3 wrong in a row, fast repeated wrong taps, or 2 minutes on one question → a gentle choice: break, easier, or keep going. */
let wrongTaps=[],idleTimer=null,frustShown=false;
const _bad=SFX.bad;SFX.bad=()=>{_bad();const now=Date.now();wrongTaps=wrongTaps.filter(t=>now-t<4000);wrongTaps.push(now);if(wrongTaps.length>=4)frustrated('taps')};
const _finish=window.finish;
window.finish=function(ok,lines,fact,fixed){
  clearTimeout(idleTimer);
  R.wrongRun=ok||fixed?0:(R.wrongRun||0)+1;
  _finish(ok,lines,fact,fixed);
  if(R.wrongRun>=3)frustrated('streak');
};
const _renderRound=window.renderRound;
window.renderRound=function(){
  _renderRound();wrongTaps=[];clearTimeout(idleTimer);
  idleTimer=setTimeout(()=>{if(!$('#v-play').hidden&&R&&R.cur&&!R.cur.done){$('#hint').innerHTML='Take your time. Tap 💡 <b>Show me how</b>, or take a break with 🫧.';logFrust('idle')}},120000);
};
function logFrust(kind){ensureReview();S.frustration.push({d:dayStr(),kind});if(S.frustration.length>300)S.frustration.shift();save()}
function frustrated(kind){
  if(frustShown||$('#v-play').hidden)return;frustShown=true;wrongTaps=[];logFrust(kind);
  const ov=$('#overlay');
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Need a break?"><h2>That was tricky.</h2><p>Tricky questions help brains grow. What would help right now?</p>
    <div class="btnrow"><button class="big" id="frCalm">🫧 Take a break</button><button class="ghost" id="frEasy">Try an easier one</button><button class="ghost" id="frGo">Keep going</button></div></div>`;
  ov.hidden=false;if(autoRead())speak('That was tricky. What would help right now? Take a break, try an easier one, or keep going.');
  $('#frCalm').onclick=()=>{closeSheet();openCalm();frustShown=false};
  $('#frGo').onclick=()=>{closeSheet();frustShown=false;R.wrongRun=0};
  $('#frEasy').onclick=()=>{closeSheet();frustShown=false;R.wrongRun=0;
    const m=R.m.link?MISS[R.m.link]:R.m;
    if(m.world==='m'){S.adapt[m.id]=Math.max(-1,(S.adapt[m.id]||0)-1);const lv=lvFor(m),g=m.gen&&m.gen[0];if(g&&GEN[g]){R.rounds.splice(R.i+1,0,GEN[g](lv))}}
    save();$('#hint').textContent='OK! The next one is a little easier.'};
}

/* ================= WEEKLY REPORT ================= */
function weekData(){
  const days=times(7,i=>addDays(dayStr(),i-6)),inWeek=d=>days.includes(d),log=S.log.filter(l=>inWeek(l.d));
  const by={w:[0,0],m:[0,0],s:[0,0]};log.forEach(l=>{const m=MISS[l.m];if(m){by[m.world][0]+=l.good;by[m.world][1]+=l.total}});
  const learned=Object.entries(S.done).filter(([,d])=>inWeek(d)).map(([id])=>MISS[id]).filter(Boolean);
  const ci=S.checkins.filter(c=>inWeek(c.d)),avg=a=>a.length?(a.reduce((s,x)=>s+x,0)/a.length).toFixed(1):'–';
  const snap=S.masterySnap[days[0]]||S.masterySnap[Object.keys(S.masterySnap).sort()[0]]||{};
  const moved=Object.entries(S.mastery||{}).map(([k,m])=>[k,m,snap[k]??null]).filter(x=>x[2]!=null&&Math.abs(x[1]-x[2])>=0.1).sort((a,b)=>(b[1]-b[2])-(a[1]-a[2]));
  const weak=Object.entries(S.mastery||{}).filter(([,m])=>m<0.5).sort((a,b)=>a[1]-b[1]).slice(0,4);
  const due=dueKeys(()=>true).length,frust=(S.frustration||[]).filter(f=>inWeek(f.d)).length,calm=(S.calmUses||[]).filter(inWeek).length;
  const practiced=days.filter(d=>S.days.includes(d)).length,full=days.filter(d=>(S.fullDays||[]).includes(d)).length;
  return{days,practiced,full,by,learned,ciStart:avg(ci.map(c=>c.start).filter(Boolean)),ciEnd:avg(ci.map(c=>c.end).filter(Boolean)),moved,weak,due,frust,calm};
}
function skillName(k){const[a,b]=k.split(':');
  if(a==='math'){const m=MATH_CURRICULUM.find(x=>x.gen.includes(b));return m?`Math: ${m.name}`:`Math: ${b}`}
  if(a==='lang'){const m=LANG_MISSIONS.find(x=>x.skill===b);return m?`Language: ${m.name}`:b==='vocab'?'Language: new words':b==='affix'?'Language: prefixes and suffixes':`Language: grammar`}
  if(a==='social'){const m=SOCIAL_MISSIONS[+b-1];return`Social: ${m?m.name:b}`}
  if(a==='ef'){const m=MISS['e-'+b];return`Brain Skills: ${m?m.name:b}`}
  return k}
function weekSuggestions(w){
  const out=[],pct=x=>x[1]?Math.round(x[0]/x[1]*100):null;
  if(w.practiced<4)out.push('Aim for 4 or more short days a week. A fixed time (for example right after a snack) makes it easier to start.');
  if(w.ciEnd!=='–'&&w.ciStart!=='–'&&+w.ciEnd>+w.ciStart)out.push('Feelings were worse at the end than at the start. Try fewer questions per part (Children → Edit) or keep breaks on.');
  if(w.frust>=3)out.push(`There were ${w.frust} tricky moments this week. Sit nearby for the first part tomorrow, and praise the effort, not the score.`);
  ['w','m','s'].forEach(k=>{const p=pct(w.by[k]);if(p!=null&&p<60)out.push(`${WORLDS[k].name} first-try accuracy was ${p}%. That is fine while learning; if it stays low, lower the level one step in the profile.`);else if(p!=null&&p>=90&&w.by[k][1]>=15)out.push(`${WORLDS[k].name} first-try accuracy was ${p}%. If it feels easy, raise the level one step.`)});
  if(w.weak.length)out.push(`Practice at home: ${w.weak.map(x=>skillName(x[0])).join(', ')}. Use real objects or talk it through together.`);
  if(!out.length)out.push('A steady week. Keep the same routine.');
  return out;
}
function weekHTML(){
  const w=weekData(),pct=x=>x[1]?`${Math.round(x[0]/x[1]*100)}% (${x[0]} of ${x[1]})`:'–',sug=weekSuggestions(w);
  const text=`Learning Quest weekly report for ${kidName()} (${w.days[0]} to ${w.days[6]})
Days practiced: ${w.practiced} of 7 (all three parts on ${w.full})
First-try accuracy: Words ${pct(w.by.w)}, Math ${pct(w.by.m)}, People ${pct(w.by.s)}
Topics learned: ${w.learned.map(m=>m.name).join(', ')||'none yet'}
Feelings check-in average (1 great, 5 very upset): start ${w.ciStart}, end ${w.ciEnd}
Calm Corner used: ${w.calm} · Tricky moments: ${w.frust} · Items due for review: ${w.due}
Suggestions:
${sug.map(s=>'- '+s).join('\n')}`;
  return`<section><h2>This week for ${esc(kidName())}</h2><p class="fact">${w.days[0]} to ${w.days[6]}</p>
   <div class="wk">${[['Days practiced',`${w.practiced} of 7`],['All three parts',`${w.full} days`],['Calm Corner',`${w.calm}×`],['Tricky moments',`${w.frust}`],['Due for review',`${w.due}`]].map(([a,b])=>`<div><small>${a}</small><b>${b}</b></div>`).join('')}</div>
   <div class="tbl"><table><tr><th>Part</th><th>First-try accuracy</th></tr>${['w','m','s'].map(k=>`<tr><td>${WORLDS[k].icon} ${WORLDS[k].name}</td><td>${pct(w.by[k])}</td></tr>`).join('')}</table></div>
   <p>Feelings check-in average (1 great … 5 very upset): start <b>${w.ciStart}</b>, end <b>${w.ciEnd}</b>.</p>
   <h3>Topics learned this week</h3><p>${w.learned.map(m=>`${m.icon} ${m.name}`).join(' · ')||'None yet.'}</p>
   ${w.moved.length?`<h3>Skills that changed</h3><ul>${w.moved.slice(0,6).map(([k,m,o])=>`<li>${skillName(k)}: ${Math.round(o*100)}% → ${Math.round(m*100)}% ${m>o?'⬆️':'⬇️'}</li>`).join('')}</ul>`:''}
   <h3>Suggestions</h3><ul>${sug.map(s=>`<li>${s}</li>`).join('')}</ul>
   <h3>Copy the report</h3><textarea id="wkOut" readonly>${esc(text)}</textarea><div class="btnrow" style="margin-top:8px"><button class="ghost" id="wkCopy">Copy report</button></div></section>`;
}
function wireWeek(){const b=$('#wkCopy');if(b)b.onclick=()=>{const tx=$('#wkOut');tx.select();(navigator.clipboard?navigator.clipboard.writeText(tx.value):Promise.reject()).then(()=>{b.textContent='Copied ✓'},()=>{try{document.execCommand('copy');b.textContent='Copied ✓'}catch(e){}})}}
// Mastery bars for the skill map.
function masteryHTML(){
  ensureReview();const rows=Object.entries(S.mastery).sort((a,b)=>a[1]-b[1]);
  if(!rows.length)return'';
  return`<h3>Mastery by skill</h3><p class="fact">Updated after every answer (70% the old value, 30% the newest answer). 80% or more counts as mastered.</p>
   <div class="mastery">${rows.map(([k,m])=>`<div><span>${skillName(k)}</span><i class="mbar"><b style="width:${Math.round(m*100)}%;background:${m>=0.8?'var(--mint)':m>=0.5?'var(--gold)':'var(--coral)'}"></b></i><small>${Math.round(m*100)}%</small></div>`).join('')}</div>`;
}
// A daily snapshot of mastery lets the weekly report show change.
function snapMastery(){ensureReview();const d=dayStr();if(!S.masterySnap[d]){S.masterySnap[d]=Object.assign({},S.mastery);const ks=Object.keys(S.masterySnap).sort();while(ks.length>21)delete S.masterySnap[ks.shift()];save()}}
const _today=window.today;window.today=function(){const t=_today();snapMastery();return t};
boot();
