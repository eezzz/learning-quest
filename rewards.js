/* One small step a day, and something to look forward to every day.
   - The daily plan is the whole day's practice: finished parts can't be repeated and the Labs are
     view-only, unless a parent turns on "Allow extra practice".
   - Each finished day unlocks a new Discovery card from one of the child's interests (interests take
     turns). The 5th finished day in a week (Mon–Sun) makes it a gold card. Tomorrow's interest is
     previewed; with "surprise" off, the exact card is shown in advance.
   Loaded last; calls boot(). */

const DISC=typeof DISCOVERIES!=='undefined'?DISCOVERIES:{animals:Object.values(FACTS).slice(0,12).map((f,i)=>['⭐','Fact '+(i+1),f])};
const extraOn=()=>!!(S&&S.profile.support.extra);
function cardInterests(){const ks=(S.profile.interests||[]).filter(k=>DISC[k]&&DISC[k].length);return ks.length?ks:Object.keys(DISC)}
const interestFor=n=>{const ks=cardInterests();return ks[((n||1)-1)%ks.length]};
// The next unseen card for an interest; when an interest runs out, cards come from another interest with cards left.
function nextCard(k){
  S.cardIdx=S.cardIdx||{};const has=x=>(S.cardIdx[x]||0)<DISC[x].length;
  if(!has(k)){const alt=cardInterests().concat(Object.keys(DISC)).find(has);if(!alt)return{k,i:rnd(DISC[k].length),repeat:true};k=alt}
  return{k,i:S.cardIdx[k]||0};
}
function cardInfo(c){const d=DISC[c.k][c.i];return{e:d[0],title:d[1],fact:d[2],interest:INTERESTS[c.k]||['⭐',c.k]}}
function weekStart(d=new Date()){const x=new Date(d);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return dayStr(x)}
const fullDaysThisWeek=()=>(S.fullDays||[]).filter(d=>d>=weekStart()).length;

/* ---------- today's card is chosen when the plan is made ---------- */
const _todayR=window.today;
window.today=function(){const t=_todayR();if(t&&!t.card){const k=interestFor(t.n);t.card=nextCard(k);save()}return t};

/* ---------- lock: only today's unfinished parts can start ---------- */
function canStart(id){if(extraOn())return true;const t=today();return t.plan.includes(id)&&!t.done.includes(id)}
const _startMission=window.startMission;
window.startMission=function(id){if(!canStart(id))return showLocked(id);return _startMission(id)};
function tomorrowText(){const t=today(),k=interestFor(t.n+1),I=INTERESTS[k]||['⭐',k];
  if(S.profile.support.surprise===false){const c=nextCardAfterToday(k),ci=cardInfo(c);return`Tomorrow's card: ${ci.e} <b>${esc(ci.title)}</b> (${I[1]})`}
  return`Tomorrow: a new ${I[0]} <b>${I[1]}</b> card`}
function nextCardAfterToday(k){const t=today(),tmp=Object.assign({},S.cardIdx||{});if(t.card&&!t.rewarded)tmp[t.card.k]=(tmp[t.card.k]||0)+1;const saved=S.cardIdx;S.cardIdx=tmp;const c=nextCard(k);S.cardIdx=saved;return c}
function showLocked(id){
  const t=today(),left=t.plan.filter(p=>!t.done.includes(p)),ov=$('#overlay');
  const msg=left.length?`Today's practice is on the home page: <b>${left.map(p=>MISS[p].name).join(', ')}</b>.`:`Today's practice is all done. Great work!`;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="One step a day"><h2>🌱 One small step a day</h2><p>${msg}</p><p>New levels open one day at a time. Small steps every day help your brain grow.</p><p class="fact">${tomorrowText()}</p>
    <div class="btnrow"><button class="big" id="lkHome">🏠 Home</button><button class="ghost" id="shX">Close</button></div></div>`;
  ov.hidden=false;$('#shX').onclick=closeSheet;$('#lkHome').onclick=()=>{closeSheet();show('home')};
  if(autoRead())speak(strip(msg)+' New levels open one day at a time.');
}
const _openSheet=window.openSheet;
window.openSheet=function(id){_openSheet(id);if(!extraOn()){const b=$('#shGo');if(b){b.disabled=true;b.textContent='Opens one day at a time';b.insertAdjacentHTML('afterend','<p class="fact" style="width:100%">Today\'s practice starts on the home page.</p>')}}};
const _renderWorld=window.renderWorld;
window.renderWorld=function(w){_renderWorld(w);if(!extraOn()){const g=$('#goNext');if(g){g.textContent='🏠 Today\'s practice';g.onclick=()=>show('home')}}};

/* ---------- home: today's card preview, gold-card goal, day done ---------- */
const _renderHome=window.renderHome;
window.renderHome=function(){
  _renderHome();if(!S)return;const t=today(),gift=$('#v-home .step.gift'),I=INTERESTS[t.card.k]||['⭐',t.card.k],fw=fullDaysThisWeek();
  if(gift){
    if(t.rewarded&&t.cardGot){const ci=cardInfo(t.cardGot);gift.innerHTML=`<span class="stepn">${ci.e}</span><span class="stepw">${t.cardGot.gold?'Gold card!':'Today\'s card'}</span><span class="stepm">${esc(ci.title)}</span><span class="steps2">${esc(ci.fact)}</span>`;gift.classList.toggle('goldc',!!t.cardGot.gold)}
    else{const exact=S.profile.support.surprise===false?cardInfo(t.card):null;
      gift.innerHTML=`<span class="stepn">🎁</span><span class="stepw">Today's card</span><span class="stepm">${exact?`${exact.e} ${esc(exact.title)}`:`A new ${I[0]} ${I[1]} card`}</span><span class="steps2">Finish all 3 parts to open it</span>`}}
  const wk=$('#v-home .week');if(wk)wk.insertAdjacentHTML('afterend',`<p class="fact goldgoal">⭐ ${fw} of 5 days this week · 5 days = a <b>gold card</b></p>`);
  if(!nextPlanStep()){const plan=$('#v-home .plan .fact');const html=`All done for today! See you tomorrow. ${tomorrowText()}.`;if(plan)plan.innerHTML=html;else $('#v-home .plan').insertAdjacentHTML('beforeend',`<p class="fact" style="margin-top:10px">${html}</p>`)}
};

/* ---------- results: the day's card, gold card, tomorrow's preview ---------- */
const _endMission=window.endMission;
window.endMission=function(){
  const t=today(),was=t.rewarded;_endMission();
  if(!extraOn()){const a=$('#rsAgain');if(a)a.remove()}
  if(!was&&t.rewarded&&t.card){
    const c=nextCard(t.card.k),gold=fullDaysThisWeek()===5;
    S.cardIdx[c.k]=(S.cardIdx[c.k]||0)+(c.repeat?0:1);S.cards=S.cards||[];S.cards.push({d:t.d,k:c.k,i:c.i,gold});t.cardGot={k:c.k,i:c.i,gold};save();
    const ci=cardInfo(c),box=$('#v-result .spec.gift');
    const html=`<div class="dcard ${gold?'gold':''}"><div class="dci">${ci.e}</div><div><div class="eyebrow">${gold?'⭐ Gold card! 5 days this week':'New Discovery card'} · ${ci.interest[0]} ${ci.interest[1]}</div><div class="disp dct">${esc(ci.title)}</div><div>${esc(ci.fact)}</div><div class="fact">+10 ⭐ for finishing today</div></div></div><p class="fact tmr">${tomorrowText()}</p>`;
    if(box)box.outerHTML=html;else $('#v-result .bigstars').insertAdjacentHTML('afterend',html);
    if(autoRead())setTimeout(()=>speak(`${gold?'Gold card! ':''}New card: ${ci.title}. ${ci.fact}`),900);
  }
};

/* ---------- Field Guide: My Discoveries ---------- */
const _renderCards=window.renderCards;
window.renderCards=function(){
  _renderCards();const got=S.cards||[],byK={};got.forEach(c=>(byK[c.k]=byK[c.k]||[]).push(c));
  const ks=[...new Set(cardInterests().concat(Object.keys(byK)))];
  const sec=`<h2 class="gh" style="--acc:var(--gold)">🎴 My Discoveries (${got.length} card${got.length===1?'':'s'}, ${got.filter(c=>c.gold).length} gold)</h2><p class="fact">One new card for every finished day.</p>
    ${ks.map(k=>{const I=INTERESTS[k]||['⭐',k],mine=byK[k]||[],n=DISC[k].length;
      return`<h3 class="dgh">${I[0]} ${I[1]} <small>${new Set(mine.map(c=>c.i)).size} of ${n}</small></h3><div class="cards">${mine.map(c=>{const ci=cardInfo(c);return`<div class="stk ${c.gold?'goldc':''}"><div class="e">${ci.e}</div><div class="nm">${esc(ci.title)}${c.gold?' ⭐':''}</div><p>${esc(ci.fact)}</p><small class="fact">${c.d}</small></div>`}).join('')}${mine.length<n?`<div class="stk lock"><div class="e">🎴</div><div class="nm">${n-new Set(mine.map(c=>c.i)).size} more to discover</div></div>`:''}</div>`}).join('')}`;
  $('#v-stk').querySelector('p.fact').insertAdjacentHTML('afterend',sec);
};

boot();
