/* Phase 1: several children, "who is learning" picker, grown-up gate, feelings check-in,
   voice mode for Kindergarten, language and social content by grade, and the parent dashboard v1.
   Loaded last. Function declarations here replace older ones with the same name. */

/* ================= CONTENT HOOK-UP ================= */
// People Lab items are saved by position: the K–2 set and then pack items are always added at the end (see bank.js).
if(typeof SOCIAL_K2!=='undefined')SOCIAL.push(...SOCIAL_K2);
if(typeof PACK_SOCIAL!=='undefined')SOCIAL.push(...PACK_SOCIAL);
if(GRADE_NAMES.length<6)GRADE_NAMES.push('Grade 5');
// The first math generators handle levels 0–4 (K–4); Grade 5 uses their top level.
['bond','ten','pv','cmp','add','sub','skip','time','len','eo','tf','miss','bal','bar','cbar','brk','grp','fact','frac','pat','logic','story'].forEach(k=>{const f=GEN[k];if(f)GEN[k]=lv=>f(Math.min(lv??0,4))});
MATH_CURRICULUM.forEach(m=>{if(+m.id.slice(1)<=21){const b=m.build;m.build=lv=>b(Math.min(lv??0,4))}});

// Language skills (K–3) from lang-data.js become Word Lab levels; the grammar levels serve Grades 2–3.
const LSK=(typeof LANG_SKILLS!=='undefined'?LANG_SKILLS:[]).concat(typeof LANG_SKILLS_45!=='undefined'?LANG_SKILLS_45:[]),LITEMS=(typeof LANG_ITEMS!=='undefined'?LANG_ITEMS:[]).concat(typeof LANG_ITEMS_45!=='undefined'?LANG_ITEMS_45:[]);
const LANG_BY_ID={};LITEMS.forEach(it=>LANG_BY_ID[it.id]=it);
const LANG_MISSIONS=LSK.map(k=>({id:'L-'+k.key,world:'w',skill:k.key,grade:k.grade,name:k.name,icon:k.icon,short:k.short||k.name,learn:k.learn,tip:k.tip,card:k.card,
  spec:k.spec||['📘',k.name,k.learn],bonus:null,what:k.name,why:k.learn,build:()=>langBuild(k.key,5)}));
LANG_MISSIONS.forEach(m=>MISS[m.id]=m);
WORD_MISSIONS.forEach(m=>{m.what=m.what||m.short+' (grammar)';m.why=m.why||m.learn});
const langItems=key=>LITEMS.filter(i=>i.skill===key);
function isPic(t){const s=strip(t).trim();return s.length>0&&s.length<=4&&/\p{Extended_Pictographic}/u.test(s)}
// In reading and spelling skills the child must read the word choices, so voice mode does not read them out.
const READ_SKILL=/cvc|sight|capital|silent|digraph|blend|vowel|compound|homophone|multisyllable|plural|past-tense|proof/;
function langR(it){const long=it.choices.some(c=>strip(c.t).length>14),quiet=READ_SKILL.test(it.skill);
  return{type:'choice',key:'lg:'+it.id,prompt:it.prompt,say:it.say||it.prompt,visual:it.visual||'',wide:long,explain:it.explain,hint:it.hint,
    opts:it.choices.map(c=>({t:c.t,say:quiet&&!isPic(c.t)?'This one':(c.say||strip(c.t)),ok:!!c.ok,why:c.why}))}}
function ruleR(m){return{type:'rule',m}}
function langBuild(key,n){return[ruleR(MISS['L-'+key])].concat(take(langItems(key),n).map(langR))}
// A teaching card before the questions (explicit instruction).
function rRule(r,st){
  const m=r.m,c=m.card||{title:m.name,text:m.learn,examples:[]};
  setPrompt(esc(c.title),`${c.title}. ${strip(c.text)} ${(c.examples||[]).map(strip).join('. ')}`);
  st.appendChild(el('div','rulecard',`<div class="ri">${m.icon}</div><p>${c.text}</p>${(c.examples||[]).length?`<div class="rex">${c.examples.map(x=>`<span>${x}</span>`).join('')}</div>`:''}`));
  const go=el('button','big',STR.ready);$('#actions').appendChild(go);
  go.onclick=()=>{$('#actions').innerHTML='';st.classList.add('locked');finish(true,[STR.practice])};
}
// K–1: skills only; Grades 2–3: skills + the grammar levels; Grades 4–5: skills only.
function langPath(L){let g=Math.min(L,5);while(g>0&&!LANG_MISSIONS.some(m=>m.grade===g))g--;const sk=LANG_MISSIONS.filter(m=>m.grade===g);return(!sk.length||g===2||g===3)?sk.concat(WORD_MISSIONS):sk}

/* ================= PROFILE → PATHS ================= */
function applyProfile(){
  if(!S)return;const P=S.profile;
  let ms=mathMissionsFor(P.math);if(!ms.length)ms=mathMissionsFor(4);ms.forEach((m,i)=>m.n=i+1);WORLDS.m.missions=ms;WORLDS.m.desc=`${GRADE_NAMES[P.math]} path · Singapore Math + RSM`;
  const ws=langPath(P.lang);ws.forEach((m,i)=>m.n=i+1);WORLDS.w.missions=ws;WORLDS.w.desc=`${GRADE_NAMES[P.lang]} path · ${P.lang<=1?'phonics, words, reading':P.lang>=4?'roots, figurative language, grammar, reading':'words, grammar, reading'}`;
  WORLDS.s.missions=typeof socialPath==='function'?socialPath():SOCIAL_MISSIONS;WORLDS.s.missions.forEach((m,i)=>m.n=i+1);
  document.title=`${kidName()}'s ${STR.appName}`;
  document.body.classList.toggle('calm',!!S.calm);document.body.classList.toggle('bigtext',!!P.support.bigText);
  const t=S.today;
  if(t&&t.topics){let ch=false;
    if(!t.done.includes('dm')&&!ms.some(m=>m.id===t.topics.m)){t.topics.m=planFor('m');ch=true}
    if(t.topics.w&&!t.done.includes('dw')&&!ws.some(m=>m.id===t.topics.w)){t.topics.w=planFor('w');ch=true}
    if(ch)registerDaily()}
}
// Levels run from 0 (Kindergarten) to 5 (Grade 5); each level moves at most one step from the profile.
function lvFor(m){return Math.max(0,Math.min(5,(S.profile.math|0)+((S.adapt||{})[m.id]||0)))}
const voiceOn=()=>!!(S&&S.profile.support.voice);
const autoRead=()=>!!(S&&(S.profile.support.voice||S.profile.support.autoRead));
function partSize(){const P=S.profile;return P.support.perPart||[5,5,6,6,7,7][P.grade]||6}

/* ================= DAILY PLAN (words, math, people) ================= */
function today(){
  const d=dayStr();
  if(S.today&&S.today.d===d&&S.today.topics&&!S.today.v3){S.today.v3=1;S.today.topics.w=null}// a plan made by the previous version today
  if(!S.today||S.today.d!==d||!S.today.topics){
    S.dayCount=(S.dayCount||0)+1;const n=S.dayCount,vocabDay=S.profile.lang>=3&&n%2===1;
    S.today={v3:1,d,n,plan:['dw','dm','ds'],done:[],rewarded:false,topics:{w:vocabDay?null:planFor('w'),m:planFor('m'),s:planFor('s')},words:vocabDay?nextWords():[],checkin:null,checkout:null};
    save();registerDaily();
  }
  if(!MISS.dw)registerDaily();
  return S.today;
}
function registerDaily(){
  const t=S&&S.today;if(!t||!t.topics)return;const N=partSize();
  const tm=MISS[t.topics.m],ts=MISS[t.topics.s],tw=t.topics.w&&MISS[t.topics.w];
  MISS.dw=tw?{id:'dw',daily:true,world:'w',link:tw.id,name:tw.name,icon:tw.icon,short:`${tw.short} + review`,learn:tw.learn,tip:tw.tip,build:()=>buildDailyTopicWords(tw,N),spec:tw.spec,bonus:tw.bonus}
    :{id:'dw',daily:true,world:'w',link:null,name:'New Words',icon:'📖',short:'4 new words + review',learn:'Meet 4 new words, use them, then a quick review.',tip:'Read each word card first. Use clues in the sentence.',build:buildDailyWords,spec:null,bonus:"Use one of today's new words when you talk to a grown-up today."};
  if(tm)MISS.dm={id:'dm',daily:true,world:'m',link:tm.id,name:tm.name,icon:tm.icon,short:`${tm.short} + review`,learn:tm.learn,tip:tm.tip,build:()=>buildDailyMath(N),spec:tm.spec,bonus:tm.bonus,gen:tm.gen};
  if(ts)MISS.ds={id:'ds',daily:true,world:'s',link:ts.id,name:ts.name,icon:ts.icon,short:`${ts.short} + review`,learn:ts.learn,tip:ts.tip,build:()=>buildDailySocial(N),spec:ts.spec,bonus:ts.bonus};
}
function langReview(tw,k){
  const g=Math.min(S.profile.lang,3),out=[];
  Object.keys(S.mistakes).filter(x=>x.startsWith('lg:')).map(x=>LANG_BY_ID[x.slice(3)]).filter(it=>it&&it.grade<=g&&it.skill!==tw.skill).slice(0,k).forEach(it=>out.push(langR(it)));
  const doneSk=LANG_MISSIONS.filter(m=>m.grade<=g&&m.id!==tw.id&&S.done[m.id]).map(m=>m.skill);
  const pool=LITEMS.filter(it=>it.skill!==tw.skill&&(doneSk.length?doneSk.includes(it.skill):it.grade===g));
  take(pool,k-out.length).forEach(it=>out.push(langR(it)));
  return out;
}
function buildDailyTopicWords(tw,N){
  if(tw.skill)return[ruleR(tw)].concat(take(langItems(tw.skill),N-2).map(langR),langReview(tw,2));
  return tw.build().slice(0,N-1).concat([wordReview()]);// a grammar level from the Word Lab
}
function buildDailyMath(N){
  const topic=MISS[today().topics.m],lv=lvFor(topic);
  if(!topic.gen.length)return topic.build(lv).slice(0,N);
  const main=topic.build(lv).slice(0,N-2),path=WORLDS.m.missions.filter(m=>m.id!==topic.id&&m.gen.length);
  const missed=Object.entries(S.mistakes).filter(e=>e[0].startsWith('mt:')).sort((a,b)=>b[1]-a[1]).map(e=>e[0].slice(3)).filter(k=>path.some(m=>m.gen.includes(k)));
  const done=path.filter(m=>S.done[m.id]).flatMap(m=>m.gen);
  const pool=[...new Set(missed.concat(shuffle(done.length?done:path.flatMap(m=>m.gen))))].filter(k=>GEN[k]).slice(0,2);
  return main.concat(pool.map(k=>GEN[k](lv)));
}
function buildDailySocial(N){
  const topic=MISS[today().topics.s],main=topic.build().slice(0,topic.n===3?N:N-1),g=S.profile.grade;
  if(topic.n===3)return main;
  const missed=Object.keys(S.mistakes).filter(k=>k.startsWith('so:')).map(k=>+k.slice(3)).filter(i=>SOCIAL[i]&&SOCIAL[i].m!==topic.n&&fitG(SOCIAL[i],g));
  const other=SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m!==topic.n&&fitG(SOCIAL[i],g)&&(S.done['s'+SOCIAL[i].m]||SOCIAL[i].m<topic.n));
  const i=missed[0]??(other.length?pick(other):null);
  return i==null?main:main.concat([soR(i)]);
}
// Social situations are filtered by grade: the K–2 set is simpler; items without a range are for Grades 2–5.
const fitG=(it,g)=>{const r=it.g||[2,5];return g>=r[0]&&g<=r[1]};
const gdist=(it,g)=>{const r=it.g||[2,5];return g<r[0]?r[0]-g:g>r[1]?g-r[1]:0};
function socialPool(filter){const g=S.profile.grade;return SOCIAL.map((_,i)=>i).filter(i=>filter(SOCIAL[i])).sort((a,b)=>gdist(SOCIAL[a],g)-gdist(SOCIAL[b],g))}
function socialBuild(m,n=5){
  const g=S.profile.grade,all=socialPool(it=>it.m===m),fit=all.filter(i=>fitG(SOCIAL[i],g));
  const pool=fit.length>=n?fit:fit.concat(all.filter(i=>!fit.includes(i)).slice(0,n-fit.length));
  return shuffle(pool).slice(0,n).map(soR);
}
function buildSocialMix(){
  const g=S.profile.grade;
  const miss=Object.keys(S.mistakes).filter(k=>k.startsWith('so:')).map(k=>+k.slice(3)).filter(i=>SOCIAL[i]&&SOCIAL[i].m!==8&&fitG(SOCIAL[i],g)).slice(0,3);
  const fill=take(socialPool(it=>it.m!==8&&fitG(it,g)),3-miss.length,miss);
  return socialBuild(8,3).concat(miss.concat(fill).map(soR));
}

/* ================= HOME EXTRAS ================= */
function homeFact(){
  if(/^stella/i.test(kidName()))return'Did you know? <b>Stella</b> means <b>"star"</b> in Latin. A star is a giant ball of hot gas, like our Sun.';
  const v=Object.values(FACTS);return`Did you know? ${esc(v[(S.dayCount||0)%v.length])}`;
}
let greeted=false;
function afterHome(){
  const t=S.today;
  if(t&&t.checkin==null)return openCheckin();
  if(voiceOn()&&!greeted){greeted=true;const nx=nextPlanStep();speak(`${greeting()}, ${kidName()}! ${nx?`Next: ${WORLDS[MISS[nx].world].name}. ${MISS[nx].name}. Tap it two times to start.`:'Today is done. Great work!'}`)}
}
function logCalm(){if(!S)return;S.calmUses=S.calmUses||[];S.calmUses.push(dayStr());if(S.calmUses.length>200)S.calmUses.shift();save()}

/* ================= FEELINGS CHECK-IN ================= */
function feelButtons(){return`<div class="feel">${STR.feel.map(([e,n],i)=>`<button class="feelb f${i+1}" data-v="${i+1}" data-say="${n}"><span>${e}</span><small>${n}</small></button>`).join('')}</div>`}
function openCheckin(){
  const ov=$('#overlay'),t=S.today;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${STR.feelTitle}"><h2>${STR.feelTitle}</h2><p>${STR.feelSub}</p>${feelButtons()}<p class="fact" id="ciMsg" aria-live="polite"></p><div class="btnrow" id="ciBtns"></div></div>`;
  ov.hidden=false;if(autoRead())speak(`Hi ${kidName()}. ${STR.feelTitle} ${STR.feelSub}`);
  ov.querySelectorAll('.feelb').forEach(b=>b.onclick=()=>{
    const v=+b.dataset.v;t.checkin=v;S.checkins.push({d:dayStr(),start:v});if(S.checkins.length>200)S.checkins.shift();save();
    ov.querySelectorAll('.feelb').forEach(x=>x.classList.toggle('on',x===b));
    if(v>=4){$('#ciMsg').textContent=STR.feelUpset;if(autoRead())speak(STR.feelUpset);
      $('#ciBtns').innerHTML=`<button class="big" id="ciCalm">${STR.feelCalm}</button><button class="ghost" id="ciGo">${STR.feelReady}</button>`;
      $('#ciCalm').onclick=()=>{closeSheet();openCalm()};$('#ciGo').onclick=()=>{closeSheet();afterHome()}}
    else{if(autoRead())speak(STR.feelThanks);closeSheet();afterHome()}
  });
}
function checkoutHTML(){return S.today.checkout!=null?'':`<div class="extra" id="coBox"><div class="eyebrow">${STR.feelEndTitle}</div>${feelButtons()}</div>`}
function wireCheckout(){
  const box=$('#coBox');if(!box)return;if(autoRead())setTimeout(()=>speak(STR.feelEndTitle),1500);
  box.querySelectorAll('.feelb').forEach(b=>b.onclick=()=>{const v=+b.dataset.v,t=S.today;t.checkout=v;
    const c=[...S.checkins].reverse().find(x=>x.d===t.d);if(c)c.end=v;else S.checkins.push({d:t.d,end:v});save();
    box.innerHTML=`<div class="eyebrow">${STR.feelThanks}</div>`;if(v>=4)box.innerHTML+=`<button class="ghost" id="coCalm">${STR.feelCalm}</button>`;
    const cc=$('#coCalm');if(cc)cc.onclick=openCalm});
}

/* ================= VOICE MODE: first tap reads, second tap chooses ================= */
document.addEventListener('click',e=>{
  if(!voiceOn())return;
  const b=e.target.closest('#stage .choice,#stage .bin,#stage .pm,#stage .opt,#v-home .step,#v-who .kid,.feelb,.xopt');
  if(!b||b.disabled||b.classList.contains('armed'))return;
  e.stopPropagation();e.preventDefault();
  document.querySelectorAll('.armed').forEach(x=>x.classList.remove('armed'));b.classList.add('armed');
  speak((b.dataset.say||b.textContent)+'. Tap again to choose.');
},true);

/* ================= WHO IS LEARNING ================= */
function renderWho(){
  const kids=ROOT.order.map(id=>[id,ROOT.children[id]]).filter(x=>x[1]);
  $('#v-who').innerHTML=`<div class="who"><h1>${kids.length?STR.whoTitle:STR.appName}</h1>${kids.length?'':`<p class="fact">${STR.noKids}</p>`}
    <div class="kids">${kids.map(([id,c])=>`<button class="kid" data-id="${id}" data-say="${esc(c.profile.name)}"><span class="ka">${c.profile.avatar}</span><b>${esc(c.profile.name)}</b><small>${GRADE_NAMES[c.profile.grade]}</small></button>`).join('')}
    <button class="kid add" id="addKid"><span class="ka">➕</span><b>${STR.addChild}</b><small>${STR.grownups}</small></button></div></div>`;
  $('#v-who').querySelectorAll('.kid[data-id]').forEach(b=>b.onclick=()=>switchChild(b.dataset.id));
  $('#addKid').onclick=()=>openParent('kids','new');
  refreshChips();
}
function switchChild(id){ROOT.active=id;S=ROOT.children[id];greeted=false;Object.keys(MISS).filter(k=>/^d[wms]$/.test(k)).forEach(k=>delete MISS[k]);applyProfile();save();show('home')}

/* ================= GROWN-UP GATE ================= */
let gateUntil=0,parTab='kids',parEdit=null;
function openParent(tab,edit){
  if(tab)parTab=tab;parEdit=edit||null;
  if(Date.now()<gateUntil){show('par');return}
  const a=between(6,9),b=between(6,9),ov=$('#overlay');
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${STR.gateTitle}"><h2>🔒 ${STR.gateTitle}</h2><p>${STR.gateAsk} <b>${a} × ${b}</b></p>
    <div class="pform"><label>Answer<input id="gateIn" type="number" inputmode="numeric" autocomplete="off"></label></div><p class="fact" id="gateMsg"></p>
    <div class="btnrow"><button class="big" id="gateOk">${STR.open}</button><button class="ghost" id="shX">${STR.cancel}</button></div></div>`;
  ov.hidden=false;$('#shX').onclick=closeSheet;$('#gateIn').focus();
  const go=()=>{if(+$('#gateIn').value===a*b){gateUntil=Date.now()+10*60e3;closeSheet();show('par')}else $('#gateMsg').textContent=STR.gateWrong};
  $('#gateOk').onclick=go;$('#gateIn').onkeydown=e=>{if(e.key==='Enter')go()};
}

/* ================= PARENT DASHBOARD v1 ================= */
const LV_DESC=['numbers to 10, counting, bonds, shapes, patterns','numbers to 20, make ten, simple equations, time','numbers to 1000, x equations, brackets, money, × ÷ intro','times tables, fractions, area, rounding, elapsed time','multi-digit × ÷, decimals, fraction operations, angles','decimals, fraction × ÷, volume, coordinates, expressions'];
const LANG_DESC=['letter sounds, rhyming, CVC words, sight words, listening','digraphs, silent e, nouns and verbs, short reading','vowel teams, prefixes, adjectives and adverbs, main idea','academic words, suffixes, homophones, idioms, inference','Latin roots, similes and metaphors, commas, theme, comparing texts','Greek roots, personification, verb tenses, summary, evidence'];
const SUPPORT_FIELDS=[['voice','Full voice mode: everything is read aloud; tap once to hear a choice, twice to choose (best for Kindergarten)'],['autoRead','Read each question aloud automatically'],['breaks','Movement break after each part (starts automatically)'],['surprise','Keep tomorrow’s card a surprise (off = show the exact card in advance)'],['bigText','Larger text'],['extra','Allow extra practice: replay finished parts and play any level in the Labs (off = one small step a day, recommended)']];
function childForm(c){
  const P=c?c.profile:fresh({grade:2}).profile,sel=(v,x)=>String(v)===String(x)?'selected':'';
  return`<section id="kidForm"><h2>${c?'Edit '+esc(P.name):'Add a child'}</h2>
   <div class="pform">
    <label>First name or nickname<input id="kfName" maxlength="20" value="${c?esc(P.name):''}"></label>
    <label>Age<select id="kfAge">${[4,5,6,7,8,9,10,11,12].map(a=>`<option ${sel(P.age,a)}>${a}</option>`).join('')}</select></label>
    <label>School grade<select id="kfGrade">${GRADE_NAMES.map((g,i)=>`<option value="${i}" ${sel(P.grade,i)}>${g}</option>`).join('')}</select></label>
    <label>Math level<select id="kfMath">${GRADE_NAMES.map((g,i)=>`<option value="${i}" ${sel(P.math,i)}>${g}</option>`).join('')}</select><small id="kfMathD">${LV_DESC[P.math]}</small></label>
    <label>Language level<select id="kfLang">${GRADE_NAMES.map((g,i)=>`<option value="${i}" ${sel(P.lang,i)}>${g}</option>`).join('')}</select><small id="kfLangD">${LANG_DESC[P.lang]}</small></label>
    <label>Questions per part<select id="kfPer"><option value="0" ${sel(P.support.perPart,0)}>Automatic by grade</option>${[4,5,6,7].map(n=>`<option ${sel(P.support.perPart,n)}>${n}</option>`).join('')}</select></label>
   </div>
   <p class="fact">Levels can differ from the school grade.</p>
   <fieldset class="pint"><legend>Picture</legend>${AVATARS.map(a=>`<label class="ichip"><input type="radio" name="kfAv" value="${a}" ${P.avatar===a?'checked':''}><span>${a}</span></label>`).join('')}</fieldset>
   <fieldset class="pint"><legend>Interests (pick at least one)</legend>${Object.entries(INTERESTS).map(([k,[e,n]])=>`<label class="ichip"><input type="checkbox" name="kfInt" value="${k}" ${P.interests.includes(k)?'checked':''}><span>${e} ${n}</span></label>`).join('')}</fieldset>
   <fieldset class="pint col"><legend>Support settings</legend>${SUPPORT_FIELDS.map(([k,l])=>`<label class="chk"><input type="checkbox" id="kfS-${k}" ${P.support[k]?'checked':''}> ${l}</label>`).join('')}</fieldset>
   <div class="btnrow" style="margin-top:12px"><button class="big" id="kfSave">${c?'Save changes':'Add child'}</button><button class="ghost" id="kfCancel">Cancel</button><span id="kfMsg" aria-live="polite"></span></div></section>`;
}
function wireChildForm(id){
  const c=id&&ROOT.children[id],touched={};
  ['kfMath','kfLang'].forEach(k=>$('#'+k).addEventListener('change',()=>touched[k]=1));
  $('#kfMath').onchange=()=>{touched.kfMath=1;$('#kfMathD').textContent=LV_DESC[+$('#kfMath').value]};
  $('#kfLang').onchange=()=>{touched.kfLang=1;$('#kfLangD').textContent=LANG_DESC[+$('#kfLang').value]};
  $('#kfAge').onchange=()=>{if(!c){const g=Math.max(0,Math.min(5,+$('#kfAge').value-5));$('#kfGrade').value=g;$('#kfGrade').onchange()}};
  $('#kfGrade').onchange=()=>{const g=+$('#kfGrade').value;
    if(!touched.kfMath){$('#kfMath').value=g;$('#kfMathD').textContent=LV_DESC[g]}
    if(!touched.kfLang){$('#kfLang').value=g;$('#kfLangD').textContent=LANG_DESC[g]}
    if(!c){const d=defaultSupport(g);SUPPORT_FIELDS.forEach(([k])=>$('#kfS-'+k).checked=!!d[k])}};
  $('#kfCancel').onclick=()=>{parEdit=null;renderParent()};
  $('#kfSave').onclick=()=>{
    const name=$('#kfName').value.trim(),ints=[...document.querySelectorAll('input[name=kfInt]:checked')].map(i=>i.value),av=(document.querySelector('input[name=kfAv]:checked')||{}).value||AVATARS[0];
    if(!name){$('#kfMsg').textContent='Please enter a name.';return}
    if(!ints.length){$('#kfMsg').textContent='Please pick at least one interest.';return}
    const support={perPart:+$('#kfPer').value};SUPPORT_FIELDS.forEach(([k])=>support[k]=$('#kfS-'+k).checked);
    const P={name,age:+$('#kfAge').value,grade:+$('#kfGrade').value,math:+$('#kfMath').value,lang:+$('#kfLang').value,avatar:av,interests:ints,support};
    if(c){const oldMath=c.profile.math;c.profile=P;c.profileSet=true;if(oldMath!==P.math)c.adapt={};if(c.today){c.today.topics=null}}// the new plan starts with the next visit
    else{const nid='c'+Date.now().toString(36);ROOT.children[nid]=fresh(P);ROOT.children[nid].profileSet=true;ROOT.order.push(nid);if(!ROOT.active){ROOT.active=nid;S=ROOT.children[nid]}}
    if(S){Object.keys(MISS).filter(k=>/^d[wms]$/.test(k)).forEach(k=>delete MISS[k]);applyProfile()}
    save();refreshChips();parEdit=null;renderParent();
  };
}
function mistakeGroups(){
  const g={Language:[],Math:[],'Social and emotional':[]};
  Object.entries(S.mistakes).sort((a,b)=>b[1]-a[1]).forEach(([k,c])=>{const p=k.split(':')[0];const grp=p==='mt'?'Math':(p==='so'||p==='ef')?'Social and emotional':'Language';g[grp].push([k,c])});
  return g;
}
const GROUP_TIPS={Language:'Read the words together and say the rule out loud ("the ___ rock", "tap the whole word"). Point to the clue in the sentence.',Math:'Use real objects or a quick drawing: blocks, coins, a paper "mystery bag". Ask "Can you show me with a picture?" before any numbers.','Social and emotional':'Talk about a real moment from today: "What clues did you see? What else could you try?" Never quiz during a hard moment.'};
function renderParent(){
  const tabs=Object.entries(STR.parTabs).map(([k,n])=>`<button class="ptab ${parTab===k?'on':''}" data-tab="${k}">${n}</button>`).join('');
  let body='';
  if(parTab==='kids'||!S){
    const rows=ROOT.order.map(id=>{const c=ROOT.children[id];if(!c)return'';const P=c.profile;
      return`<tr><td class="kav">${P.avatar}</td><td><b>${esc(P.name)}</b>${id===ROOT.active?' <span class="tag good">active</span>':''}<br><small>Age ${P.age} · ${GRADE_NAMES[P.grade]}</small></td><td>Math: ${GRADE_NAMES[P.math]}<br>Language: ${GRADE_NAMES[P.lang]}</td><td>${c.stars} ⭐<br><small>${(c.days||[]).length} day${(c.days||[]).length===1?'':'s'}</small></td>
        <td><div class="acts"><button class="ghost sm" data-edit="${id}">Edit</button>${id!==ROOT.active?`<button class="ghost sm" data-use="${id}">Switch to</button>`:''}<button class="ghost sm" data-del="${id}">Remove</button></div></td></tr>`}).join('');
    body=parEdit?childForm(parEdit==='new'?null:ROOT.children[parEdit]):`<section><h2>Children</h2>${ROOT.order.length?`<div class="tbl"><table class="kidtbl">${rows}</table></div>`:`<p>${STR.noKids}</p>`}
      <div class="btnrow" style="margin-top:12px"><button class="big" id="kNew">➕ ${STR.addChild}</button></div><p class="fact" id="kMsg"></p></section>`;
  }
  else if(parTab==='today'){
    const t=today(),log=S.log.filter(l=>l.d===t.d&&l.daily),feel=v=>v?`${STR.feel[v-1][0]} ${STR.feel[v-1][1]}`:'Not yet';
    const part=id=>{const m=MISS[id],l=log.find(x=>x.m===(m.link||m.id));return`<tr><td>${WORLDS[m.world].icon} ${WORLDS[m.world].name}</td><td>${m.icon} ${m.name}</td><td>${t.done.includes(id)?'<span class="tag good">Done</span>':'<span class="tag warn">Not yet</span>'}</td><td>${l?`${l.good} of ${l.total} right the first time`:''}</td></tr>`};
    const calm=(S.calmUses||[]).filter(d=>d===t.d).length;
    body=`<section><h2>Today for ${esc(kidName())} (day ${t.n})</h2>
      <div class="tbl"><table><tr><th>Part</th><th>Topic</th><th>Status</th><th>First-try accuracy</th></tr>${t.plan.map(part).join('')}</table></div>
      <p>Feelings check-in: start <b>${feel(t.checkin)}</b> · end <b>${feel(t.checkout)}</b> · Calm Corner used <b>${calm}</b> time${calm===1?'':'s'} today.</p>
      <p class="fact">A start check-in of 4–5 offers the Calm Corner before practice. If the end check-in is often worse than the start, try fewer questions per part or turn on breaks.</p></section>`;
  }
  else if(parTab==='progress'){
    const G=mistakeGroups(),wk=times(7,i=>{const d=new Date();d.setDate(d.getDate()-6+i);return dayStr(d)}).filter(d=>S.days.includes(d)).length;
    const lab=W=>`<h3>${W.icon} ${W.name}: ${W.desc}</h3><div class="tbl"><table><tr><th>#</th><th>Level</th><th>What it practices</th><th>Stars</th></tr>${W.missions.map((m,i)=>`<tr><td>${i+1}</td><td>${m.icon} ${m.name}</td><td>${m.what||m.learn}</td><td>${S.done[m.id]?`<span class="tag good">${'★'.repeat(S.best[m.id]||0)}</span>`:(S.best[m.id]?'★'.repeat(S.best[m.id]):'')}</td></tr>`).join('')}</table></div>`;
    const recent=S.log.slice(-12).reverse().map(l=>{const m=MISS[l.m];return m?`<li>${l.d}: ${WORLDS[m.world].name} · ${m.name}, ${l.good}/${l.total} right the first time, ${'★'.repeat(l.stars)}</li>`:''}).join('')||'<li>No activity yet</li>';
    body=`<section><h2>Progress for ${esc(kidName())}</h2><p>Total stars <b>${S.stars}</b> ⭐ · days practiced this week <b>${wk}</b> of 7 · words collected <b>${S.vocab.learned.length}</b></p>
      <h3>Mistakes to review</h3><p class="fact">Grouped by area. Higher counts need more practice; each comes back in spiral review until it is right.</p>
      ${Object.entries(G).map(([g,list])=>`<div class="mgroup"><h4>${g} <small>(${list.length})</small></h4><div class="mchips">${list.map(([k,c])=>`<span>${esc(mistakeLabel(k))} ×${c}</span>`).join('')||'<span>Nothing to review</span>'}</div>${list.length?`<p class="fact">At home: ${GROUP_TIPS[g]}</p>`:''}</div>`).join('')}
      <h3>Recent activity</h3><ul>${recent}</ul></section>
      <section><h2>Skill map</h2>${masteryHTML()}${lab(WORLDS.w)}${lab(WORLDS.m)}${lab(WORLDS.s)}</section>${S.legacyStella?LEGACY_NOTES:''}`;
  }
  else if(parTab==='week'){body=weekHTML()}
  else if(parTab==='curriculum'){
    const P=S.profile,mrows=MATH_CURRICULUM.slice().sort((a,b)=>a.order-b.order).map(m=>`<tr class="${m.grades.includes(P.math)?'on':''}" ${rowData('math',m.grades,m.grades.includes(P.math),m.name+' '+m.what+' '+m.src)}><td>${m.icon} ${m.name}</td><td>${m.what}</td><td>${m.src==='Both'?'Singapore + RSM':m.src}</td>${[0,1,2,3,4,5].map(g=>`<td class="c">${m.grades.includes(g)?'●':''}</td>`).join('')}</tr>`).join('');
    const lrows=LANG_MISSIONS.map(m=>`<tr class="${m.grade===P.lang?'on':''}" ${rowData('lang',[m.grade],m.grade===P.lang,m.name+' '+m.learn)}><td>${m.icon} ${m.name}</td><td>${m.learn}</td><td class="c">${m.grade===0?'K':m.grade}</td></tr>`).join('')+WORD_MISSIONS.map(m=>`<tr class="${P.lang===2||P.lang===3?'on':''}" ${rowData('lang',[2,3],P.lang===2||P.lang===3,m.name+' '+m.learn+' grammar')}><td>${m.icon} ${m.name}</td><td>${m.learn}</td><td class="c">2–3</td></tr>`).join('');
    const srows=SOCIAL_MISSIONS.map((m,i)=>{const k2=SOCIAL.filter(x=>x.m===i+1&&(x.g||[2,5])[0]<=2&&(x.g||[2,5])[1]<=2).length,old=SOCIAL.filter(x=>x.m===i+1&&!x.g).length;return`<tr ${rowData('social',[0,1,2,3,4,5],true,m.name+' '+m.learn)}><td>${m.icon} ${m.name}</td><td>${m.learn}</td><td class="c">${k2}</td><td class="c">${old}</td></tr>`}).join('')
      +(typeof EF_MISSIONS!=='undefined'?EF_MISSIONS:[]).map(m=>{const k2=EFI.filter(x=>x.skill===m.ef&&(x.g||[0,5])[0]<=2).length,old=EFI.filter(x=>x.skill===m.ef&&(x.g||[0,5])[1]>=3).length;return`<tr ${rowData('ef',[0,1,2,3,4,5],true,m.name+' '+m.learn+' brain skills executive function')}><td>${m.icon} ${m.name} <small class="tag good">Brain Skills</small></td><td>${m.learn}</td><td class="c">${k2}</td><td class="c">${old}</td></tr>`}).join('');
    body=`<section class="cfilter" aria-label="Filter the curriculum"><h2>Find a topic</h2>
      <div class="pform"><label>Search<input id="cfQ" type="search" placeholder="for example fractions, rhyme, feelings" autocomplete="off"></label>
       <label>Subject<select id="cfSubj"><option value="">All subjects</option><option value="math">Math</option><option value="lang">Language</option><option value="social">Social and emotional</option><option value="ef">Brain Skills</option></select></label>
       <label>Grade<select id="cfGrade"><option value="">All grades</option>${GRADE_NAMES.map((g,i)=>`<option value="${i}">${g}</option>`).join('')}</select></label></div>
      <label class="chk" style="margin-top:10px"><input type="checkbox" id="cfOn"> Only ${esc(kidName())}'s current path</label>
      <p class="fact" id="cfCount" aria-live="polite"></p></section>
      <section class="cfhide"><h2>How this app teaches</h2><ul>
      <li><b>Same order every day.</b> Words → math → people, then a reward. The plan is set in the morning and never changes during the day.</li>
      <li><b>Short parts with instant feedback.</b> ${partSize()} questions per part for ${esc(kidName())}; each answer gets a result and a reason at once.</li>
      <li><b>A hint before the answer.</b> The first wrong answer gets a hint and another try; the answer and reason come after the second. "Show me how" never costs anything.</li>
      <li><b>Pictures before symbols.</b> Balance scales, bar models, ten frames and picture choices come before numbers and words.</li>
      <li><b>Interests as the theme.</b> Objects, stories and reward cards use the interests in the profile.</li>
      <li><b>Social skills as short stories.</b> Every choice explains what others might think or feel; the child is never asked to act "normal" or make eye contact.</li>
      <li><b>Regulation first.</b> A feelings check-in starts each day; the Calm Corner is one tap away on every screen.</li></ul></section>
      <section class="csec"><h2>Math: Singapore Math + RSM</h2><p>Highlighted rows are on ${esc(kidName())}'s current path (${GRADE_NAMES[P.math]}).</p><div class="tbl"><table class="curr"><tr><th>Level</th><th>Topic</th><th>Method</th>${['K','1','2','3','4','5'].map(g=>`<th class="c">${g}</th>`).join('')}</tr>${mrows}</table></div></section>
      <section class="csec"><h2>Language (K–5)</h2><p>Aligned to Common Core Foundational Skills, Language and Reading. Highlighted rows are on the current path (${GRADE_NAMES[P.lang]}).</p><div class="tbl"><table class="curr"><tr><th>Level</th><th>What it practices</th><th class="c">Grade</th></tr>${lrows||'<tr><td colspan="3">Language skills are loading.</td></tr>'}</table></div></section>
      <section class="csec"><h2>Social and emotional (CASEL) and Brain Skills</h2><p>Situations are chosen for the child's grade: a simpler K–2 set and a Grades 2–5 set. Brain Skills items are split into K–2 and Grades 3–5.</p><div class="tbl"><table class="curr"><tr><th>Topic</th><th>What it practices</th><th class="c">K–2 situations</th><th class="c">Grades 2–5</th></tr>${srows}</table></div></section>`;
  }
  else{
    body=`<section><h2>Saving and backup</h2><p>Progress for every child saves automatically on this device. On an iPad, tap Share → Add to Home Screen and open the app from the icon. To move to another device, copy the backup code and keep it somewhere safe.</p>
      <textarea id="bkOut" readonly>${familyBackup()}</textarea><div class="btnrow" style="margin-top:8px"><button class="ghost" id="bkCopy">Copy backup code</button></div>
      <p style="margin-top:12px">To restore, paste a backup code and tap Restore. This replaces the children on this device.</p>
      <textarea id="bkIn" placeholder="Paste backup code"></textarea><div class="btnrow" style="margin-top:8px"><button class="ghost" id="bkLoad">Restore</button><span id="bkMsg"></span></div>
      <h3>Start over for ${esc(kidName())}</h3><div class="btnrow" id="resetRow"><button class="ghost" id="resetBtn">Erase ${esc(kidName())}'s progress</button></div></section>`;
  }
  $('#v-par').innerHTML=`<div class="parent"><div class="ptabs" role="tablist">${tabs}</div>${body}</div>`;
  $('#v-par').querySelectorAll('.ptab').forEach(b=>b.onclick=()=>{if(!S&&b.dataset.tab!=='kids')return;parTab=b.dataset.tab;parEdit=null;renderParent()});
  if(parTab==='kids'||!S){
    if(parEdit)wireChildForm(parEdit==='new'?null:parEdit);
    else{const n=$('#kNew');if(n)n.onclick=()=>{parEdit='new';renderParent()};
      $('#v-par').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{parEdit=b.dataset.edit;renderParent()});
      $('#v-par').querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>switchChild(b.dataset.use));
      $('#v-par').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const id=b.dataset.del,c=ROOT.children[id];
        $('#kMsg').innerHTML=`Remove ${esc(c.profile.name)} and all of their progress? <button class="ghost sm" id="kDelYes">Remove</button> <button class="ghost sm" id="kDelNo">Keep</button>`;
        $('#kDelNo').onclick=renderParent;$('#kDelYes').onclick=()=>{delete ROOT.children[id];ROOT.order=ROOT.order.filter(x=>x!==id);
          if(ROOT.active===id){ROOT.active=ROOT.order[0]||null;S=ROOT.active?ROOT.children[ROOT.active]:null;Object.keys(MISS).filter(k=>/^d[wms]$/.test(k)).forEach(k=>delete MISS[k]);applyProfile()}
          save();refreshChips();renderParent()}})}
  }
  if(parTab==='week')wireWeek();
  if(parTab==='curriculum'&&S)wireCurrFilter();
  if(parTab==='data'&&S){
    $('#bkCopy').onclick=()=>{const tx=$('#bkOut');tx.select();(navigator.clipboard?navigator.clipboard.writeText(tx.value):Promise.reject()).then(()=>{$('#bkCopy').textContent='Copied ✓'},()=>{try{document.execCommand('copy');$('#bkCopy').textContent='Copied ✓'}catch(e){}})};
    $('#bkLoad').onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($('#bkIn').value.trim()))));
        if(o&&o.v===3&&o.children){Object.values(o.children).forEach(migrate);ROOT=o}
        else if(o&&o.v===2){const c=migrate(Object.assign(fresh(),o)),nid='c'+Date.now().toString(36);ROOT.children[nid]=c;ROOT.order.push(nid);ROOT.active=nid}
        else throw 0;
        S=ROOT.active&&ROOT.children[ROOT.active]||null;Object.keys(MISS).filter(k=>/^d[wms]$/.test(k)).forEach(k=>delete MISS[k]);applyProfile();save();refreshChips();renderParent();$('#bkMsg').textContent='Restored ✓'}
      catch(e){$('#bkMsg').textContent='That backup code did not work. Copy the whole code and try again.'}};
    $('#resetBtn').onclick=()=>{$('#resetRow').innerHTML=`<span>Erase all stars and progress for ${esc(kidName())}? The profile stays.</span><button class="ghost" id="rsYes" style="border-color:var(--coral)">Erase</button><button class="ghost" id="rsNo">Cancel</button>`;
      $('#rsNo').onclick=renderParent;$('#rsYes').onclick=()=>{const P=S.profile,n=fresh(P);ROOT.children[ROOT.active]=n;S=n;Object.keys(MISS).filter(k=>/^d[wms]$/.test(k)).forEach(k=>delete MISS[k]);applyProfile();save();refreshChips();renderParent()}};
  }
}
function familyBackup(){try{return btoa(unescape(encodeURIComponent(JSON.stringify(ROOT))))}catch(e){return''}}
function rowData(subj,grades,on,text){return`data-subj="${subj}" data-grades=" ${grades.join(' ')} " data-on="${on?1:0}" data-text="${esc(strip(text).toLowerCase())}"`}
// Curriculum filter: search, subject, grade and "only the current path". Choices are remembered for this visit.
let CF={q:'',subj:'',grade:'',on:false};
function wireCurrFilter(){
  const q=$('#cfQ'),subj=$('#cfSubj'),grade=$('#cfGrade'),on=$('#cfOn');q.value=CF.q;subj.value=CF.subj;grade.value=CF.grade;on.checked=CF.on;
  const apply=()=>{
    CF={q:q.value.trim().toLowerCase(),subj:subj.value,grade:grade.value,on:on.checked};
    const filtering=CF.q||CF.subj||CF.grade||CF.on;let shown=0,total=0;
    document.querySelectorAll('#v-par .csec').forEach(sec=>{let vis=0;
      sec.querySelectorAll('tr[data-subj]').forEach(tr=>{total++;
        const ok=(!CF.subj||tr.dataset.subj===CF.subj)&&(!CF.grade||tr.dataset.grades.includes(' '+CF.grade+' '))&&(!CF.on||tr.dataset.on==='1')&&(!CF.q||CF.q.split(/\s+/).every(w=>tr.dataset.text.includes(w.length>4?w.replace(/(ing|es|s|e)$/,''):w)));
        tr.hidden=!ok;if(ok){vis++;shown++}});
      sec.hidden=!vis});
    document.querySelectorAll('#v-par .cfhide').forEach(x=>x.hidden=!!filtering);
    $('#cfCount').textContent=filtering?(shown?`Showing ${shown} of ${total} topics.`:'No topics match. Try a shorter word or clear a filter.'):`${total} topics in all.`;
  };
  [q,subj,grade,on].forEach(x=>x.addEventListener('input',apply));[subj,grade,on].forEach(x=>x.addEventListener('change',apply));apply();
}
const LEGACY_NOTES=`<section><h2>Worksheet notes (September 2026)</h2>
 <div class="tbl"><table><tr><th>Worksheet</th><th>Result</th></tr>
  <tr><td>Punctuation . ! ?</td><td><span class="tag good">13/13 correct</span></td></tr>
  <tr><td>Circle the verbs</td><td><span class="tag good">5/5 correct</span></td></tr>
  <tr><td>Camping proofreading</td><td><span class="tag good">Very good</span> Found the lowercase i, both "whent", "hade", the missing period, and the capital in "Swimming"</td></tr>
  <tr><td>Nouns Review</td><td><span class="tag warn">Missed 1</span> Did not mark "hair"</td></tr>
  <tr><td>Adjective Review</td><td><span class="tag warn">4 extra</span> Also circled tree, butterfly, flower and bus as adjectives</td></tr>
  <tr><td>Find the -ly Adverbs</td><td><span class="tag warn">Circled only "ly"</span> Found every -ly word but circled just the ending</td></tr>
  <tr><td>Write and solve an equation</td><td><span class="tag good">4/4 correct</span> Wrote an extra "=" at the end of a line; found x in (d) by trying additions</td></tr>
  <tr><td>Word problems</td><td><span class="tag good">All correct</span> Key numbers were circled with adult help; turning words into math is the hard step</td></tr>
 </table></div></section>`;

/* ================= START (called by the last script) ================= */
function boot(){
(function sky(){const s=$('#sky');for(let i=0;i<60;i++){const d=document.createElement('i');const z=Math.random()*2.2+.8;d.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${z}px;height:${z}px;animation-delay:${(Math.random()*3).toFixed(2)}s`;s.appendChild(d)}})();
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(!S&&b.dataset.nav!=='par')return;b.dataset.nav==='par'?openParent():show(b.dataset.nav)});
$('#whoBtn').onclick=()=>show('who');
$('#soundBtn').onclick=()=>{if(!S)return;S.sound=!S.sound;save();refreshChips()};
$('#calmBtn').onclick=()=>{if(!S)return;S.calm=!S.calm;save();refreshChips()};
$('#calmTop').onclick=()=>{if(S)openCalm()};
$('#quit').onclick=()=>show('home');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#overlay').hidden)closeSheet()});
if(window.speechSynthesis)try{speechSynthesis.getVoices()}catch(e){}
if(S){applyProfile();save()}
show(!S||ROOT.order.length>1?'who':'home');
}
