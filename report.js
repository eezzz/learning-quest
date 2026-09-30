/* Parent feedback report and practice that adapts to it.
   - Every answer is logged per skill (last 20 results) with where it fell in the part (first or second
     half), how long each part took, and which part a tricky moment happened in.
   - The Feedback tab turns this into plain-language findings: skills that need support now (with the
     evidence), what is going well, and observations about attention, feelings and routine.
   - Up to 3 weak skills become the child's focus. When "Adjust practice automatically" is on (default),
     tomorrow's plan brings focus skills back: one review question a day in their part, and every
     4th day a short review topic for a focus skill instead of a new one. The day's size never changes.
   - Parents can take a skill out of focus. Everything stays on this device.
   Also: Appearance (dark or light theme) in Parent → Children. Loaded before main.js. */

const adaptOn=()=>!!(S&&S.profile.support.adapt!==false);
const FOCUS_MAX=3,HIST=20,WINDOW=14;
function ensureInsight(){if(!S)return;S.skillHist=S.skillHist||{};S.posStats=S.posStats||{};S.focus=S.focus||[];S.focusOff=S.focusOff||[];if(S.profile.support.adapt===undefined)S.profile.support.adapt=true}
if(typeof ROOT!=='undefined'&&ROOT&&ROOT.children)Object.values(ROOT.children).forEach(c=>{if(c.profile&&c.profile.support&&c.profile.support.adapt===undefined)c.profile.support.adapt=true});
const _defaultSupportR=window.defaultSupport;
window.defaultSupport=function(g){return Object.assign(_defaultSupportR(g),{adapt:true})};
SUPPORT_FIELDS.push(['adapt','Adjust practice to weak spots automatically (see the Feedback report; changes start with the next day’s plan)']);

/* ---------- recording ---------- */
const _recordAnswerR=window.recordAnswer;
window.recordAnswer=function(k,right){
  _recordAnswerR(k,right);if(!k||!S)return;ensureInsight();
  const sk=skillOf(k),h=(S.skillHist[sk]||'')+(right?'1':'0');S.skillHist[sk]=h.slice(-HIST);
  if(typeof R!=='undefined'&&R&&R.rounds&&R.rounds.length>=4){const d=dayStr(),p=S.posStats[d]=S.posStats[d]||{e:[0,0],l:[0,0]},half=R.i<R.rounds.length/2?'e':'l';p[half][0]++;if(right)p[half][1]++;
    const ks=Object.keys(S.posStats).sort();while(ks.length>30)delete S.posStats[ks.shift()]}
};
const _logFrustR=window.logFrust;
window.logFrust=function(kind){_logFrustR(kind);const f=S&&S.frustration&&S.frustration[S.frustration.length-1];
  if(f&&typeof R!=='undefined'&&R&&R.m){f.w=R.m.world;const r=R.rounds&&R.rounds[R.i];if(r&&r.key)f.sk=skillOf(r.key);save()}};
let partStart=0;
const _startMissionR=window.startMission;
window.startMission=function(id){partStart=Date.now();return _startMissionR(id)};
const _endMissionR=window.endMission;
window.endMission=function(){const n=S&&S.log?S.log.length:0;_endMissionR();
  if(S&&S.log&&S.log.length>n&&partStart){S.log[S.log.length-1].sec=Math.round((Date.now()-partStart)/1000);partStart=0;save()}};

/* ---------- analysis ---------- */
const lastDays=n=>times(n,i=>addDays(dayStr(),i-n+1));
const pct=(a,b)=>b?Math.round(a/b*100):null;
function skillStats(){
  ensureInsight();const out={};
  Object.entries(S.skillHist).forEach(([sk,h])=>{out[sk]={sk,n:h.length,right:[...h].filter(c=>c==='1').length,m:S.mastery[sk]}});
  // Older progress has no history yet: items waiting in review still count as evidence.
  Object.keys(S.review||{}).forEach(k=>{const sk=skillOf(k);if(!out[sk])out[sk]={sk,n:0,right:0,m:S.mastery[sk],fromReview:0};if(out[sk].fromReview!=null)out[sk].fromReview++});
  Object.values(out).forEach(s=>{s.acc=s.n?s.right/s.n:null;s.due=dueKeys(k=>skillOf(k)===s.sk).length});
  return out;
}
function isWeak(s){return s.n>=5?(s.acc<0.6||(s.acc<0.7&&(s.m??1)<0.5)):(s.fromReview>=2&&(s.m??1)<0.5)}
function isStrong(s){return s.n>=8&&s.acc>=0.85}
function weakList(){return Object.values(skillStats()).filter(isWeak).sort((a,b)=>((a.acc??a.m??.5)-(b.acc??b.m??.5))||(b.n-a.n))}
// The mission in a Lab that teaches a skill, if the child has already learned it.
function missionFor(sk){
  const[a,b]=sk.split(':');let ms=[];
  if(a==='math')ms=WORLDS.m.missions.filter(m=>(m.gen||[]).includes(b));
  else if(a==='lang')ms=WORLDS.w.missions.filter(m=>m.skill===b);
  else if(a==='social')ms=WORLDS.s.missions.filter(m=>m.sm===+b);
  else if(a==='ef')ms=WORLDS.s.missions.filter(m=>m.ef===b);
  return ms.find(m=>S.done[m.id])||null;
}
function computeFocus(){
  ensureInsight();const off=new Set(S.focusOff),prev=Object.fromEntries(S.focus.map(f=>[f.sk,f.since]));
  S.focus=weakList().filter(s=>!off.has(s.sk)).slice(0,FOCUS_MAX).map(s=>({sk:s.sk,since:prev[s.sk]||dayStr()}));
}
const focusSk=pre=>adaptOn()?S.focus.map(f=>f.sk).filter(sk=>sk.startsWith(pre)):[];

/* ---------- adapting tomorrow's plan ---------- */
const _todayR2=window.today;
window.today=function(){if(S&&(!S.today||S.today.d!==dayStr())){computeFocus();save()}return _todayR2()};
// Every 4th day, one part may be a short review of a focus skill the child has already learned.
const REVISIT={w:1,m:2,s:3};
const _planForR=window.planFor;
window.planFor=function(w){
  const id=_planForR(w);if(!adaptOn()||(S.dayCount||0)%4!==REVISIT[w])return id;
  const pre={w:'lang:',m:'math:',s:''}[w];
  const m=S.focus.map(f=>f.sk).filter(sk=>w==='s'?/^(social|ef):/.test(sk):sk.startsWith(pre)).map(missionFor).find(Boolean);
  if(m&&m.id!==id)return m.id;
  return id;
};
// One review question a day comes from a focus skill.
const _buildDailyMathR=window.buildDailyMath;
window.buildDailyMath=function(N){
  const r=_buildDailyMathR(N),topic=MISS[today().topics.m];if(!topic.gen.length||r.length<N)return r;
  const g=focusSk('math:').map(s=>s.slice(5)).find(k=>GEN[k]&&!topic.gen.includes(k)&&WORLDS.m.missions.some(m=>(m.gen||[]).includes(k)));
  if(g)r[r.length-1]=GEN[g](lvFor(topic));return r;
};
const _langReviewR=window.langReview;
window.langReview=function(tw,k){
  const r=_langReviewR(tw,k),sk=focusSk('lang:').map(s=>s.slice(5)).find(s=>s!==tw.skill);
  const pool=sk?LITEMS.filter(it=>it.skill===sk&&it.grade<=S.profile.lang):[];
  if(pool.length&&r.length)r[0]=langR(pick(pool));return r;
};
const _buildDailySocialR=window.buildDailySocial;
window.buildDailySocial=function(N){
  const r=_buildDailySocialR(N),topic=MISS[today().topics.s];if(topic.sm===3||topic.ef||r.length<N)return r;
  const m=focusSk('social:').map(s=>+s.slice(7)).find(x=>x!==topic.sm),g=S.profile.grade;
  const pool=m?SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m===m&&fitG(SOCIAL[i],g)):[];
  if(pool.length)r[r.length-1]=soR(pick(pool));return r;
};

/* ---------- words for parents ---------- */
const HOME_TIPS=[
  [/^math:story/,'Turn short spoken stories into math: “We had 5 apples and ate 2.” Draw the bar model together before writing numbers.'],
  [/^math:(frac|fr)/,'Cut real food or paper into equal parts and name them: halves, thirds, fourths.'],
  [/^math:bal/,'Use a real or toy balance, or LEGO towers, to show that both sides must be equal.'],
  [/^math:/,'Show the problem with real objects (coins, LEGO, snacks) first, then write it down together.'],
  [/^lang:.*reading/,'Read one short paragraph together and ask one “How do you know?” question. Point to the words that prove it.'],
  [/^lang:.*(literal|idiom|simile|metaphor|personification|hyperbole)/,'When you use an expression like “it’s raining cats and dogs”, say what it really means right after.'],
  [/^lang:.*homophone/,'Make two cards (for example their / there) and play a quick “which one?” game with spoken sentences.'],
  [/^lang:.*(sound|rhyme|cvc|blend|digraph|vowel|silent|syllable)/,'Play a 2-minute sound game: clap syllables, find rhymes, or say words slowly sound by sound.'],
  [/^lang:vocab/,'Use one of this week’s new words in conversation and ask your child to spot it.'],
  [/^lang:/,'Do a 2-minute warm-up with this skill during a car ride or snack, out loud, no writing.'],
  [/^social:1$/,'Name your own feelings out loud with a clue: “I’m frustrated. My shoulders feel tight.”'],
  [/^social:2$/,'When something goes wrong, ask together: small, medium or big problem? Then match the reaction.'],
  [/^social:3$/,'Practice one calm tool together when everyone is calm, not only when upset.'],
  [/^social:4$/,'At dinner, take turns asking one follow-up question about what someone said.'],
  [/^social:5$/,'While watching a show, wonder aloud what a character knows or thinks.'],
  [/^social:6$/,'Explain jokes and sarcasm plainly. It is always okay to ask “Are you joking?”'],
  [/^social:7$/,'Play a short board game and practice one good-sport sentence for winning and for losing.'],
  [/^social:8$/,'Practice a help script: “Excuse me, can you help me with …?”'],
  [/^ef:memory/,'Give 2–3 step instructions and have your child say them back or draw a quick list.'],
  [/^ef:plan/,'Use a first-then card or a picture checklist for one daily routine.'],
  [/^ef:time/,'Use a visual timer. Guess how long a task takes, then check together.'],
  [/^ef:flex/,'When a plan changes, name one other good option together (“Plan B”).'],
  [/^ef:check/,'Make a check-it habit: read it again and point to each part before saying “done”.'],
];
const homeTip=sk=>(HOME_TIPS.find(([re])=>re.test(sk))||[,''])[1];
function appAction(sk){
  const m=missionFor(sk),review=/^(math|lang|social):/.test(sk)&&!/^lang:(vocab|affix|grammar)/.test(sk);
  if(!adaptOn())return'Automatic adjusting is off, so practice stays on the normal path.';
  return[review?'One review question a day comes from this skill.':'Missed items come back in spaced review.',m?`Every 4th day, “${m.name}” may come back as a short review topic.`:''].filter(Boolean).join(' ');
}
function evidence(s){return s.n?`${s.right} of the last ${s.n} right the first time`+(s.due?`, ${s.due} waiting for review`:''):`${s.fromReview} items waiting for review`}

function observations(){
  const days=lastDays(WINDOW),inW=d=>days.includes(d),log=S.log.filter(l=>inW(l.d)),out=[];
  const practiced=days.filter(d=>S.days.includes(d)).length,full=days.filter(d=>(S.fullDays||[]).includes(d)).length;
  out.push({k:'routine',t:`Practiced on ${practiced} of the last ${WINDOW} days (all three parts on ${full}).`,tip:practiced<8?'A fixed time (for example right after a snack) makes it easier to start. Short and regular beats long and rare.':''});
  const by={w:[0,0,0,0],m:[0,0,0,0],s:[0,0,0,0]};
  log.forEach(l=>{const m=MISS[l.m];const w=m&&m.world;if(!by[w])return;by[w][0]+=l.good;by[w][1]+=l.total;if(l.sec){by[w][2]+=l.sec;by[w][3]++}});
  const parts=['w','m','s'].filter(w=>by[w][1]).map(w=>`${WORLDS[w].name} ${pct(by[w][0],by[w][1])}%`+(by[w][3]?` (about ${Math.max(1,Math.round(by[w][2]/by[w][3]/60))} min a part)`:''));
  if(parts.length)out.push({k:'accuracy',t:`First-try accuracy: ${parts.join(' · ')}.`,tip:''});
  const slow=['w','m','s'].filter(w=>by[w][3]>=3&&by[w][2]/by[w][3]>600);
  if(slow.length)out.push({k:'time',t:`${slow.map(w=>WORLDS[w].name).join(' and ')} parts often take over 10 minutes.`,tip:'Long parts can drain attention. Try fewer questions per part (Children → Edit) or keep movement breaks on.'});
  const ps=Object.entries(S.posStats||{}).filter(([d])=>inW(d)).map(e=>e[1]),e=ps.reduce((a,p)=>[a[0]+p.e[0],a[1]+p.e[1]],[0,0]),l=ps.reduce((a,p)=>[a[0]+p.l[0],a[1]+p.l[1]],[0,0]);
  if(e[0]>=15&&l[0]>=15){const pe=pct(e[1],e[0]),pl=pct(l[1],l[0]);
    if(pe-pl>=15)out.push({k:'attention',t:`Accuracy drops in the second half of each part (${pe}% → ${pl}%).`,tip:'This often means attention is running out, not that the work is too hard. Try 4 questions per part, or a movement break between parts.'});
    else if(pl-pe>=15)out.push({k:'warmup',t:`The first questions of each part go less well than later ones (${pe}% → ${pl}%).`,tip:'Your child may need a moment to warm up. Sitting together for the first question, or reading it aloud, can help.'})}
  const fr=(S.frustration||[]).filter(f=>inW(f.d));
  if(fr.length){const w={};fr.forEach(f=>{if(f.w)w[f.w]=(w[f.w]||0)+1});const top=Object.entries(w).sort((a,b)=>b[1]-a[1])[0];
    out.push({k:'tricky',t:`${fr.length} tricky moment${fr.length>1?'s':''} (several wrong taps in a row, or a long pause)`+(top&&WORLDS[top[0]]?`, most in ${WORLDS[top[0]].name}`:'')+'.',tip:fr.length>=4?'Sit nearby at the start of that part, and praise effort (“you kept trying”) rather than scores.':''})}
  const ci=S.checkins.filter(c=>inW(c.d)),avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,st=avg(ci.map(c=>c.start).filter(Boolean)),en=avg(ci.map(c=>c.end).filter(Boolean));
  const upset=ci.filter(c=>c.start>=4||c.end>=4).length;
  if(st!=null||en!=null)out.push({k:'feelings',t:`Feelings check-in (1 great … 5 very upset): start ${st!=null?st.toFixed(1):'–'}, end ${en!=null?en.toFixed(1):'–'}`+(upset?`; worried or upset on ${upset} day${upset>1?'s':''}`:'')+'.',tip:en!=null&&st!=null&&en>st+0.4?'Feelings get worse during practice. Try fewer questions per part, or practice at a calmer time of day.':upset>=3?'Several upset days. Check sleep, hunger and what happened before practice; it is fine to skip a day.':''});
  const calm=(S.calmUses||[]).filter(inW).length;if(calm)out.push({k:'calm',t:`Used the Calm Corner ${calm} time${calm>1?'s':''}.`,tip:'Using calm tools on their own is a real skill. Notice it and name it.'});
  return out;
}

function reportData(){
  ensureInsight();const st=skillStats(),all=Object.values(st),weak=weakList(),off=new Set(S.focusOff);
  const strong=all.filter(isStrong).sort((a,b)=>b.acc-a.acc).slice(0,5),answers=all.reduce((s,x)=>s+x.n,0);
  return{weak,strong,answers,obs:observations(),off,hidden:weak.filter(s=>off.has(s.sk)),active:weak.filter(s=>!off.has(s.sk)).slice(0,FOCUS_MAX),more:weak.filter(s=>!off.has(s.sk)).slice(FOCUS_MAX)};
}
function reportText(d){
  const L=[`Learning Quest feedback report for ${kidName()} (${dayStr()})`,''];
  L.push('Needs more support now:');d.active.length?d.active.forEach(s=>L.push(`- ${skillName(s.sk)}: ${evidence(s)}. At home: ${homeTip(s.sk)}`)):L.push('- Nothing stands out right now.');
  if(d.strong.length){L.push('','Going well:');d.strong.forEach(s=>L.push(`- ${skillName(s.sk)}: ${s.right} of ${s.n}`))}
  L.push('','Observations:');d.obs.forEach(o=>L.push(`- ${o.t}${o.tip?' '+o.tip:''}`));
  L.push('',adaptOn()?'Practice adjusts automatically: one review question a day from these skills, and a short review topic every 4th day.':'Automatic adjusting is off.');
  return L.join('\n');
}
function reportHTML(){
  const d=reportData(),few=d.answers<30;
  const row=(s,isOff)=>`<li class="rpw"><div><b>${skillName(s.sk)}</b> <small class="fact">${evidence(s)}</small></div>
    ${isOff?'':`<div class="rpa">🔁 ${appAction(s.sk)}</div><div class="rph">🏠 ${homeTip(s.sk)}</div>`}
    <button class="ghost rpbtn" data-${isOff?'on':'off'}="${s.sk}">${isOff?'Focus on this again':'Don’t focus on this'}</button></li>`;
  return`<section><h2>Feedback report for ${esc(kidName())}</h2>
    <p class="fact">Made on this device from ${kidName()}’s answers, pauses, calm breaks and feelings check-ins. Updated every time you open it. Changes to practice start with the next day’s plan.</p>
    ${few?`<p class="tag warn" style="display:inline-block">Early days: ${d.answers} answers so far. Patterns get clearer after about a week of practice.</p>`:''}
    <h3>Needs more support now</h3>${d.active.length?`<ul class="rplist">${d.active.map(s=>row(s,false)).join('')}</ul>`:'<p>Nothing stands out right now. 🎉</p>'}
    ${d.more.length?`<p class="fact">Also a bit shaky: ${d.more.map(s=>skillName(s.sk)).join(', ')}. These will become focus skills when the ones above improve.</p>`:''}
    ${d.strong.length?`<h3>Going well</h3><ul>${d.strong.map(s=>`<li>${skillName(s.sk)}: ${s.right} of the last ${s.n} right the first time</li>`).join('')}</ul>`:''}
    <h3>What we noticed</h3><ul class="rplist">${d.obs.map(o=>`<li>${o.t}${o.tip?`<div class="rph">💡 ${o.tip}</div>`:''}</li>`).join('')}</ul>
    <h3>How practice adjusts</h3>
    <label class="chk"><input type="checkbox" id="rpAdapt" ${adaptOn()?'checked':''}> Adjust practice to weak spots automatically</label>
    <p class="fact">The day stays the same size and keeps its order. Up to ${FOCUS_MAX} focus skills get one review question a day in their part, and every 4th day one part may be a short review of a focus topic instead of a new one. Missed items still come back after 1, 3, 7, 14 and 30 days.</p>
    ${d.hidden.length?`<h3>Taken out of focus by you</h3><ul class="rplist">${d.hidden.map(s=>row(s,true)).join('')}</ul>`:''}
    <h3>Copy the report</h3><textarea id="rpOut" readonly>${esc(reportText(d))}</textarea><div class="btnrow" style="margin-top:8px"><button class="ghost" id="rpCopy">Copy report</button></div></section>`;
}
function wireReport(){
  const v=$('#v-par');
  v.querySelectorAll('[data-off]').forEach(b=>b.onclick=()=>{S.focusOff=[...new Set(S.focusOff.concat(b.dataset.off))];S.focus=S.focus.filter(f=>f.sk!==b.dataset.off);save();renderParent()});
  v.querySelectorAll('[data-on]').forEach(b=>b.onclick=()=>{S.focusOff=S.focusOff.filter(x=>x!==b.dataset.on);save();renderParent()});
  const a=$('#rpAdapt');if(a)a.onchange=()=>{S.profile.support.adapt=a.checked;save();renderParent()};
  const c=$('#rpCopy');if(c)c.onclick=()=>{const tx=$('#rpOut');tx.select();(navigator.clipboard?navigator.clipboard.writeText(tx.value):Promise.reject()).then(()=>{c.textContent='Copied ✓'},()=>{try{document.execCommand('copy');c.textContent='Copied ✓'}catch(e){}})};
}

/* ---------- appearance ---------- */
const THEMES_UI=[['dark','🌙 Dark','The original deep-sky look'],['light','☀️ Light','Bright, clean and calm'],['auto','🌓 Match this device','Follows the iPad’s light or dark setting']];
function themePref(){try{return localStorage.getItem('learning-quest-theme')||'dark'}catch(e){return'dark'}}
function appearanceHTML(){const cur=themePref();
  return`<section><h2>Appearance</h2><p class="fact">For this device. Children see the same look.</p><div class="themes">${THEMES_UI.map(([k,n,d])=>`<label class="themeopt"><input type="radio" name="theme" value="${k}" ${cur===k?'checked':''}><span><b>${n}</b><small>${d}</small></span></label>`).join('')}</div></section>`}
function wireAppearance(){document.querySelectorAll('#v-par input[name=theme]').forEach(r=>r.onchange=()=>{try{localStorage.setItem('learning-quest-theme',r.value)}catch(e){}applyTheme()})}
if(window.matchMedia)try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{if(themePref()==='auto')applyTheme()})}catch(e){}

/* ---------- parent dashboard hook-up ---------- */
STR.parTabs=Object.fromEntries(Object.entries(STR.parTabs).flatMap(e=>e[0]==='week'?[e,['report','Feedback']]:[e]));
const _renderParentR=window.renderParent;
window.renderParent=function(){
  _renderParentR();const p=$('#v-par .parent');if(!p)return;
  if(parTab==='report'&&S){p.insertAdjacentHTML('beforeend',reportHTML());wireReport()}
  if(parTab==='kids'&&!parEdit){p.insertAdjacentHTML('beforeend',appearanceHTML());wireAppearance()}
};
