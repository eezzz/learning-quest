/* Stella's Science Quest: app logic.
   Data: words-data.js (Word Lab), social-data.js (People Lab). Math questions are generated here.
   Teaching approach: short fixed-shape missions, a visual daily schedule, explicit rules with
   their exceptions, concrete visuals for math, a second try before the answer is shown,
   a "why" for every answer, movement and calm-down breaks, and science as the reward. */

/* ================= HELPERS ================= */
const $=s=>document.querySelector(s);
const rnd=n=>Math.floor(Math.random()*n);
const between=(a,b)=>a+rnd(b-a+1);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const take=(arr,n,not=[])=>shuffle(arr.filter(x=>!not.includes(x))).slice(0,n);
const times=(n,f)=>Array.from({length:n},(_,k)=>f(k));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,'');
const pad2=n=>String(n).padStart(2,'0');
const tagSpan=t=>`<span class="${t}">${TAGNAME[t]}</span>`;
const parseS=s=>s.split(' ').map(x=>{const [w,t]=x.split('/');return{w,tag:t||''}});
const plain=s=>s.replace(/\/\w/g,'').replace(/\|/g,'').replace(/ _$/,'').replace(/ ([.?!,])/g,'$1');
const isP=w=>/^[.?!,]$/.test(w);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
function starPath(cx,cy,R,r){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r:R;d+=(i?'L':'M')+(cx+q*Math.cos(a)).toFixed(1)+' '+(cy+q*Math.sin(a)).toFixed(1)}return d+'Z'}
function novaSVG(mood){
  const mouth=mood==='oops'?'<ellipse cx="50" cy="63" rx="5" ry="6" fill="#2a1f55"/>':'<path d="M41 60 Q50 70 59 60" stroke="#2a1f55" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return `<svg class="nova" viewBox="0 0 100 100" aria-hidden="true"><path d="${starPath(50,54,47,21)}" fill="#ffc94d" stroke="#e0a21c" stroke-width="3.5" stroke-linejoin="round"/><circle cx="41" cy="50" r="5" fill="#2a1f55"/><circle cx="59" cy="50" r="5" fill="#2a1f55"/><circle cx="42.5" cy="48.5" r="1.6" fill="#fff"/><circle cx="60.5" cy="48.5" r="1.6" fill="#fff"/>${mouth}<circle cx="33" cy="59" r="4.5" fill="#ff9fb3" opacity=".75"/><circle cx="67" cy="59" r="4.5" fill="#ff9fb3" opacity=".75"/></svg>`;
}
function dayStr(d=new Date()){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
$('#logostar').setAttribute('d',starPath(50,53,46,20));

/* ================= WORD LAB round builders ================= */
function cloud(t){
  const k=2+rnd(3);let tg,dis;
  if(t==='n'){const tr=take(TRICKY_N,1);tg=tr.concat(take(NOUNS,k-1,tr.concat(NO_CLOUD)));dis=take(ADJS.concat(VERBS),6-k)}
  else{tg=take(ADJS,k);const nn=take(CONCRETE,Math.min(2,6-k));dis=nn.concat(take(VERBS,6-k-nn.length))}
  return{type:'select',layout:'cloud',target:t,tokens:shuffle(tg.concat(dis)).map(w=>({w,tag:WORDTAG[w]}))};
}
function sentIdx(t,n){return shuffle(SENTS.map((_,i)=>i).filter(i=>SENTS[i].includes('/'+t))).slice(0,n)}
function sentR(i,t){return{type:'select',layout:'sentence',target:t,idx:i,tokens:parseS(SENTS[i])}}
function sortR(w,bins=['n','v','a','d']){return{type:'sort',w,tag:WORDTAG[w],bins}}
function punctR(i){return{type:'punct',idx:i}}
function proofR(i){return{type:'proof',idx:i}}
function pairR(i){return{type:'pair',idx:i}}
function buildTwin(){const tr=take(['tree','butterfly','flower','bus','hair','grass'],3);return shuffle(tr.concat(take(ADJS,2))).map(w=>sortR(w,['n','a'])).concat([sentR(sentIdx('a',1)[0],'a')])}
function buildAdv(){const ids=shuffle(ADV_SENTS.map((_,i)=>i).filter(i=>i>0)).slice(0,3);return[pairR(0)].concat(ids.map(pairR),take(LY_TRAPS,2).map(w=>sortR(w)))}
function sort4Words(){const tr=take(['tree','butterfly','flower','hair','grass'],1);return shuffle(tr.concat(take(ADJS,1),take(VERBS,1,['fly']),take(ADVS,2),take(LY_TRAPS,1,tr)))}
function fromKey(k){const p=k.split(':');
  if(p[0]==='w')return WORDTAG[p[1]]?sortR(p[1]):null;
  if(p[0]==='s')return SENTS[+p[1]]?sentR(+p[1],p[2]):null;
  if(p[0]==='p')return PUNCT[+p[1]]?punctR(+p[1]):null;
  if(p[0]==='f')return PROOF[+p[1]]?proofR(+p[1]):null;
  if(p[0]==='q')return ADV_SENTS[+p[1]]?pairR(+p[1]):null;return null}
function buildWordReview(){
  const keys=Object.entries(S.mistakes).filter(e=>/^[wspfq]:/.test(e[0])).sort((a,b)=>b[1]-a[1]).map(e=>e[0]).slice(0,8);
  const r=keys.map(fromKey).filter(Boolean);
  const have=keys.filter(k=>k.startsWith('w:')).map(k=>k.slice(2));
  take(['tree','butterfly','flower','hair','grass','soft','fly','lily','slowly','bumpy'],Math.max(0,6-r.length),have).forEach(w=>r.push(sortR(w)));
  return shuffle(r);
}
function buildWordFinal(){return shuffle([cloud('n'),cloud('a'),sentR(sentIdx('v',1)[0],'v'),sentR(sentIdx('a',1)[0],'a'),pairR(rnd(ADV_SENTS.length))]
  .concat(sort4Words().slice(0,2).map(w=>sortR(w)),shuffle(PUNCT.map((_,i)=>i)).slice(0,2).map(punctR),[proofR(rnd(PROOF.length))]))}

/* ================= NUMBER LAB generators (2nd grade) ================= */
// Every generator returns a "choice" round with a concrete picture, a step-by-step "show me how", and a worked answer.
function mkChoice(key,prompt,visual,right,wrongs,o={}){
  const seen=new Set([String(right)]);
  const opts=[{t:String(right),ok:true,why:o.why}];
  wrongs.forEach(w=>{const[t,why]=Array.isArray(w)?w:[w,null];if(t==null||seen.has(String(t))||(typeof t==='number'&&t<0))return;seen.add(String(t));if(opts.length<4)opts.push({t:String(t),ok:false,why})});
  return Object.assign({type:'choice',key,prompt,visual,opts},o);
}
const SKIP_T=[[2,'🐦','birds','wings'],[5,'⭐','sea stars','arms'],[10,'🦀','crabs','legs'],[2,'🦋','butterflies','antennae'],[5,'🖐️','hands','fingers'],[10,'🐙','octopus arms','','x']];
function genSkip(){
  if(rnd(2)){
    let [s,e,name,part]=pick(SKIP_T.slice(0,5));const k=between(2,s===10?7:6),ans=s*k,seq=times(k,i=>s*(i+1));
    const vis=`<div class="groups">${times(k,()=>`<div class="grp"><span>${e}</span><b>${s}</b></div>`).join('')}</div>`;
    return mkChoice('mt:skip',`${k} ${name}. Each one has ${s} ${part}. How many ${part} in all?`,vis,ans,[ans+s,ans-s,k+s,ans+1],
      {hint:`Count by ${s}s, one number for each ${name.replace(/s$/,'')}:<br><b>${seq.join(', ')}</b>`,explain:`Count by ${s}s: ${seq.join(', ')}. That is ${ans}.`});
  }
  const s=pick([2,5,10]),start=s*between(1,6),seq=times(5,i=>start+s*i),miss=between(1,4),ans=seq[miss];
  const vis=`<div class="seq">${seq.map((n,i)=>i===miss?'<span class="blank">?</span>':`<b>${n}</b>`).join('<i>→</i>')}</div>`;
  return mkChoice('mt:skip',`Count by ${s}s. What number is missing?`,vis,ans,[ans+1,ans-1,ans+s,ans-s],
    {hint:`Each jump adds <b>${s}</b>. Start at ${seq[miss-1]} and add ${s}.`,explain:`${seq[miss-1]} + ${s} = ${ans}.`});
}
function blocksHTML(t,o){return`<div class="blocks">${times(t,()=>`<div class="ten">${'<i></i>'.repeat(10)}</div>`).join('')}<div class="ones">${times(o,()=>'<div class="one"></div>').join('')}</div></div>`}
function genPV(){
  if(rnd(3)===0){let n,ds;do{n=between(102,987);ds=String(n).split('').map(Number)}while(new Set(ds).size<3);
    const pos=rnd(3),vals=[ds[0]*100,ds[1]*10,ds[2]],ans=vals[pos],shown=vals.map((v,i)=>i===pos?'<span class="blank">?</span>':v).join(' + ');
    return mkChoice('mt:pv',`Fill in the blank: ${n} = ${vals.map((v,i)=>i===pos?'__':v).join(' + ')}`,`<div class="bignum">${ds.map((x,i)=>i===pos?`<u>${x}</u>`:x).join('')}</div><div class="eq sm">${n} = ${shown}</div>`,ans,[ds[pos]===ans?ds[pos]*10:ds[pos],ds[pos]*(pos===0?10:100),ans+10],
      {hint:`The missing part is the <b>${['hundreds','tens','ones'][pos]}</b>. The digit ${ds[pos]} in that place means ${ans}.`,explain:`${n} = ${vals.join(' + ')}.`});}
  if(rnd(2)){
    const t=between(1,9),o=between(0,9),n=t*10+o;
    return mkChoice('mt:pv','Each rod has 10 pebbles. Each cube is 1 pebble. How many pebbles?',blocksHTML(t,o),n,[o*10+t,t+o,n+10,n-1],
      {hint:`Count the rods by 10s: ${times(t,i=>(i+1)*10).join(', ')}.<br>Then count on the cubes: ${o} more.`,explain:`${t} tens = ${t*10}. ${o} ones = ${o}. ${t*10} + ${o} = ${n}.`});
  }
  let n,ds;do{n=between(102,987);ds=String(n).split('')}while(new Set(ds).size<3||ds.includes('0'));
  const pos=rnd(3),d=+ds[pos],val=d*[100,10,1][pos],name=['hundreds','tens','ones'][pos];
  const vis=`<div class="bignum">${ds.map((x,i)=>i===pos?`<u>${x}</u>`:x).join('')}</div><div class="pvlab"><span>hundreds</span><span>tens</span><span>ones</span></div>`;
  return mkChoice('mt:pv',`What is the value of the <u>${d}</u> in ${n}?`,vis,val,[d,d*10,d*100,n],
    {hint:`The ${d} is in the <b>${name}</b> place.<br>${name==='ones'?`${d} ones = ${d}`:`${d} ${name} = ${val}`}.`,explain:`The ${d} is in the ${name} place, so it means ${val}.`});
}
const CMP_T=[['🐢','turtles'],['🐸','frogs'],['🐜','ants'],['🐝','bees'],['🐚','shells'],['🌰','acorns']];
function genCmp(){
  const a=between(10,99),b=rnd(5)?(()=>{let x;do{x=between(10,99)}while(x===a);return x})():a;
  const sign=a<b?'<':a>b?'>':'=';const[ea,na]=pick(CMP_T);let eb,nb;do{[eb,nb]=pick(CMP_T)}while(nb===na);
  const vis=`<div class="cmp"><div><span>${ea}</span><b>${a}</b><small>${na}</small></div><span class="blank">?</span><div><span>${eb}</span><b>${b}</b><small>${nb}</small></div></div>`;
  const ta=Math.floor(a/10),tb=Math.floor(b/10);
  const why=a===b?'Both numbers are the same.':ta!==tb?`Look at the tens: ${ta} tens and ${tb} tens.`:`The tens are the same, so look at the ones: ${a%10} and ${b%10}.`;
  const r=mkChoice('mt:cmp',`Which sign goes in the middle?`,vis,sign,['<','>','='],{hint:'1. Look at the <b>tens</b> first.<br>2. If the tens are the same, look at the <b>ones</b>.<br>3. The open side of &lt; or &gt; faces the <b>bigger</b> number.',explain:`${a} ${sign} ${b}. ${why}`,fixed:true});
  r.opts=['<','=','>'].map(x=>({t:x,ok:x===sign}));r.opts.forEach(o=>o.label={'<':'less than','=':'equal to','>':'greater than'}[o.t]);
  return r;
}
const ADD_T=[['🐜','ants','anthill'],['🐚','shells','beach'],['🐧','penguins','ice'],['🌟','fireflies','garden'],['🐞','ladybugs','leaf'],['🐟','fish','pond']];
function genAdd(){
  const a=between(12,79),b=between(5,Math.min(60,99-a)),ans=a+b,[e,n,p]=pick(ADD_T);
  const at=a-a%10,bt=b-b%10,ao=a%10,bo=b%10;
  return mkChoice('mt:add',`There are ${a} ${n} on the ${p}. ${b} more come. How many ${n} now?`,`<div class="eq"><span>${e}</span> ${a} + ${b} = <span class="blank">?</span></div>`,ans,
    [ao+bo>=10?[ans-10,'Did you forget to carry the extra ten from the ones?']:ans+10,ans+1,ans-1,ans+10],
    {hint:`1. Add the tens: ${at} + ${bt} = ${at+bt}<br>2. Add the ones: ${ao} + ${bo} = ${ao+bo}<br>3. Put them together: ${at+bt} + ${ao+bo} = ?`,explain:`${at+bt} + ${ao+bo} = ${ans}. So ${a} + ${b} = ${ans}.`});
}
const SUB_T=[['🐚','shells','on the beach','washed away'],['🐦','birds','in the tree','flew away'],['🍂','leaves','on the branch','blew away'],['🐸','frogs','on the log','hopped away'],['🐝','bees','on the flowers','buzzed away']];
function genSub(){
  const a=between(25,99),b=between(5,a-5),ans=a-b,[e,n,p,v]=pick(SUB_T),bt=b-b%10,bo=b%10;
  const flip=(Math.floor(a/10)-Math.floor(b/10))*10+Math.abs(a%10-bo);
  return mkChoice('mt:sub',`There were ${a} ${n} ${p}. ${b} ${v}. How many are left?`,`<div class="eq"><span>${e}</span> ${a} − ${b} = <span class="blank">?</span></div>`,ans,
    [flip!==ans?[flip,'Careful: take the ones of the second number away from the first number. You may need to break a ten.']:ans+10,ans+10,ans+1,ans-1],
    {hint:`1. Take away the tens: ${a} − ${bt} = ${a-bt}<br>2. Take away the ones: ${a-bt} − ${bo} = ?`,explain:`${a} − ${bt} = ${a-bt}. Then ${a-bt} − ${bo} = ${ans}.`});
}
function clockSVG(h,m){
  const hand=(deg,len,w,c)=>{const a=(deg-90)*Math.PI/180;return`<line x1="100" y1="100" x2="${(100+len*Math.cos(a)).toFixed(1)}" y2="${(100+len*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`};
  let s=`<svg viewBox="0 0 200 200" class="clock" role="img" aria-label="clock"><circle cx="100" cy="100" r="92" fill="#fff8ea" stroke="#ffc94d" stroke-width="8"/>`;
  for(let i=0;i<60;i++){const a=(i*6-90)*Math.PI/180,r1=i%5?83:78;s+=`<line x1="${(100+r1*Math.cos(a)).toFixed(1)}" y1="${(100+r1*Math.sin(a)).toFixed(1)}" x2="${(100+87*Math.cos(a)).toFixed(1)}" y2="${(100+87*Math.sin(a)).toFixed(1)}" stroke="#10222c" stroke-width="${i%5?1:3}"/>`}
  for(let i=1;i<=12;i++){const a=(i*30-90)*Math.PI/180;s+=`<text x="${(100+63*Math.cos(a)).toFixed(1)}" y="${(100+63*Math.sin(a)+7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="#10222c" font-family="Andika,sans-serif">${i}</text>`}
  return s+hand(((h%12)+m/60)*30,42,9,'#10222c')+hand(m*6,70,5,'#e0602a')+'<circle cx="100" cy="100" r="7" fill="#10222c"/></svg>';
}
function genTime(){
  const h=between(1,12),m=5*between(0,11),ans=`${h}:${pad2(m)}`;
  return mkChoice('mt:time',pick(['What time is it?','The bats wake up at this time. What time is it?','Time to check the seedlings! What time is it?','The telescope opens at this time. What time is it?']),clockSVG(h,m),ans,
    [m?[`${h}:${pad2(m/5)}`,'The long hand points at a number, but you count by 5s for minutes.']:null,[`${h%12+1}:${pad2(m)}`,'Look at the short hand: it has not reached the next number yet.'],m?[`${m/5}:${pad2((h*5)%60)}`,'The short hand is the hour. The long hand is the minutes.']:null,`${h}:${pad2((m+30)%60)}`].filter(Boolean),
    {hint:`1. <b>Short</b> black hand = hour. It points at or just past <b>${h}</b>.<br>2. <b>Long</b> orange hand = minutes. Count by 5s from 12: ${times(m/5+1,i=>i*5).join(', ')}.`,explain:`The hour is ${h}. The minutes are ${m}. It is ${ans}.`});
}
const LEN_T=[['caterpillar','#7ed957'],['worm','#f4a0a0'],['twig','#b07a4a'],['crayon','#6cc6ff'],['snake','#c6e36b']];
function genLen(){
  const start=rnd(3)?0:between(1,3),L=between(3,11),end=start+L,[obj,col]=pick(LEN_T),u=36,x0=22;
  let s=`<svg viewBox="0 0 590 140" class="ruler" role="img" aria-label="ruler">`;
  s+=`<rect x="${x0+start*u}" y="22" width="${L*u}" height="28" rx="14" fill="${col}" stroke="#10222c" stroke-width="2"/>`;
  if(obj==='caterpillar'||obj==='worm'||obj==='snake')s+=`<circle cx="${x0+end*u-12}" cy="32" r="3" fill="#10222c"/>`;
  s+=`<line x1="${x0+start*u}" y1="50" x2="${x0+start*u}" y2="72" stroke="#ffe39a" stroke-width="2" stroke-dasharray="4 3"/><line x1="${x0+end*u}" y1="50" x2="${x0+end*u}" y2="72" stroke="#ffe39a" stroke-width="2" stroke-dasharray="4 3"/>`;
  s+=`<rect x="8" y="72" width="574" height="60" rx="6" fill="#ffe39a"/>`;
  for(let i=0;i<=15;i++){const x=x0+i*u;s+=`<line x1="${x}" y1="72" x2="${x}" y2="${i%5?92:98}" stroke="#10222c" stroke-width="2"/><text x="${x}" y="120" text-anchor="middle" font-size="17" font-weight="700" fill="#10222c" font-family="Andika,sans-serif">${i}</text>`;if(i<15)s+=`<line x1="${x+u/2}" y1="72" x2="${x+u/2}" y2="82" stroke="#10222c" stroke-width="1.5"/>`}
  s+='</svg>';
  return mkChoice('mt:len',`How long is the ${obj}?`,s,`${L} cm`,[start?[`${end} cm`,`The ${obj} does not start at 0. Count the spaces from ${start} to ${end}.`]:null,`${L+1} cm`,`${L-1} cm`,`${L+2} cm`].filter(Boolean),
    {hint:start?`It starts at <b>${start}</b>, not 0.<br>Count the jumps from ${start} to ${end}, or do ${end} − ${start}.`:`It starts at <b>0</b>. Read the number where it ends.`,explain:start?`${end} − ${start} = ${L}. It is ${L} cm long.`:`It starts at 0 and ends at ${end}. It is ${L} cm long.`});
}
const EO_T=[['🐧','penguins'],['🧦','socks'],['🐞','ladybugs'],['🥚','eggs'],['🦆','ducks']];
function genEO(){
  const n=between(3,20),[e,name]=pick(EO_T),even=n%2===0;
  const r=mkChoice('mt:eo',`There are ${n} ${name}. Can every one have a partner?`,`<div class="emoline">${e.repeat(n)}</div>`,even?'Yes. It is even.':'No, 1 is left over. It is odd.',[even?'No, 1 is left over. It is odd.':'Yes. It is even.'],
    {hint:'Make pairs: count by 2s. If one is left with no partner, the number is <b>odd</b>.',explain:`${n} is ${even?'even: everyone has a partner':'odd: one is left over'}. Even numbers end in 0, 2, 4, 6 or 8.`,fixed:true});
  return r;
}
const GEN={skip:genSkip,pv:genPV,cmp:genCmp,add:genAdd,sub:genSub,time:genTime,len:genLen,eo:genEO,tf:()=>genTF(),miss:()=>genMissing(),bal:()=>genBalance(1),bar:()=>genBarM(),grp:()=>genGroups(),story:()=>genStoryRound()};
function buildMathMix(){
  const miss=Object.entries(S.mistakes).filter(e=>e[0].startsWith('mt:')).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>GEN[e[0].slice(3)]).filter(Boolean);
  const rest=shuffle([genAdd,genSub,genTime,genLen,genPV,genCmp,genSkip,GEN.tf,GEN.miss,GEN.bal,GEN.bar,GEN.grp,GEN.story,GEN.story]).slice(0,6-miss.length);
  return shuffle([genEO].concat(miss,rest).map(g=>g()));
}

/* ================= PEOPLE LAB builders ================= */
const SIZE_OPTS=['🐜 Small problem','🐕 Medium problem','🐘 Big problem'];
function scene(it){return`<div class="scene"><div class="se">${it.e}</div><p>${esc(it.s)}</p></div>`}
function soR(i){
  const it=SOCIAL[i];
  if(it.sz!=null)return{type:'choice',key:'so:'+i,prompt:'How big is this problem?',say:it.s+' How big is this problem?',visual:scene(it),wide:true,fixed:true,
    opts:SIZE_OPTS.map((t,j)=>({t,ok:j===it.sz,why:j===it.sz?it.why:'Ask yourself: Can I fix it myself? Do I need a grown-up? Is someone hurt or in danger?'}))};
  return{type:'choice',key:'so:'+i,prompt:it.q,say:it.s+' '+it.q,visual:scene(it),wide:true,opts:it.o.map((x,j)=>({t:esc(x[0]),ok:j===0,why:x[1]}))};
}
function socialBuild(m,n=5){return shuffle(SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m===m)).slice(0,n).map(soR)}
function buildSocialMix(){
  const miss=Object.entries(S.mistakes).filter(e=>e[0].startsWith('so:')).sort((a,b)=>b[1]-a[1]).map(e=>+e[0].slice(3)).filter(i=>SOCIAL[i]&&SOCIAL[i].m!==8).slice(0,3);
  const fill=take(SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m!==8),3-miss.length,miss);
  return socialBuild(8,3).concat(miss.concat(fill).map(soR));
}

/* ================= MISSIONS ================= */
const WORD_MISSIONS=[
 {name:'Fossil Dig',icon:'🦴',short:'Nouns',learn:'Dig up the nouns: people, places, animals and things.',tip:'Noun test: can you say <b>"the ___"</b>? the fossil ✓ &nbsp;the shiny ✗',
  build:()=>times(5,()=>cloud('n')),spec:['🦖','T. rex tooth','A T. rex tooth could be as long as a banana.'],bonus:'Look out the window or go outside. Find 5 nouns in nature (tree, rock, cloud...).'},
 {name:'Rainforest',icon:'🌳',short:'Adjectives',learn:'Find the describing words.',tip:'Adjective test: <b>"the ___ rock"</b>. the shiny rock ✓ &nbsp;the tree rock ✗',
  build:()=>times(5,()=>cloud('a')),spec:['🦜','Scarlet macaw','Macaws can live for more than 50 years.'],bonus:'Pick up a leaf or a rock. Describe it with 3 adjectives: rough? green? tiny?'},
 {name:'Tide Pool',icon:'🦀',short:'Noun or Adj?',learn:'Noun or adjective? Sort each one.',tip:'A <b class="n">noun</b> is a thing you can see or touch. An <b class="a">adjective</b> tells what it is like.',
  build:buildTwin,spec:['🐚','Hermit crab','A hermit crab moves into a bigger shell when it grows.'],bonus:null},
 {name:'Volcano',icon:'🌋',short:'Verbs',learn:'Find the action word in each sentence.',tip:'Verb test: <b>"I can ___"</b>. I can dig ✓ &nbsp;Ask: what did it <b>do</b>?',
  build:()=>sentIdx('v',6).map(i=>sentR(i,'v')),spec:['🪨','Obsidian','Obsidian is black glass made by a volcano.'],bonus:'Act out 5 animal verbs with a grown-up: hop, slither, fly, swim, crawl!'},
 {name:'Bee Meadow',icon:'🌼',short:'Adverbs',learn:'Find the -ly adverb, then the verb it tells about.',tip:'An <b class="d">adverb</b> tells HOW. Tap the <b>whole word</b> (quietly), not just "ly". But careful: <b>fly</b>, <b>lily</b> and <b>butterfly</b> end in -ly and are not adverbs!',
  build:buildAdv,spec:['🐝','Honeybee','Bees dance to tell other bees where the flowers are.'],bonus:'Walk like a turtle: slowly! Now quickly! Now quietly! Adverbs tell HOW.'},
 {name:'Microscope Lab',icon:'🔬',short:'Sorting',learn:'Noun, verb, adjective or adverb? Sort each word.',tip:'<b class="n">the ___</b> · <b class="v">I can ___</b> · <b class="a">the ___ rock</b> · <b class="d">It moved ___</b>',
  build:()=>sort4Words().map(w=>sortR(w)),spec:['🦠','Microbes','Billions of tiny microbes live on your skin right now.'],bonus:null},
 {name:'Deep Ocean',icon:'🌊',short:'Punctuation',learn:'Pick the right mark for the end of each sentence.',tip:'<b>.</b> tells &nbsp; <b>?</b> asks &nbsp; <b>!</b> shows a strong feeling',
  build:()=>shuffle(PUNCT.map((_,i)=>i)).slice(0,6).map(punctR),spec:['🐋','Blue whale','The blue whale is the biggest animal that ever lived.'],bonus:'Ask a grown-up 2 science questions. Does your voice go up at the end?'},
 {name:'Arctic Base',icon:'🧊',short:'Proofreading',learn:'Find the mistake and fix it.',tip:'Check 3 things: capital letters, spelling, and the end mark.',
  build:()=>shuffle(PROOF.map((_,i)=>i)).slice(0,5).map(proofR),spec:['🐧','Emperor penguin','Emperor penguin dads keep the egg warm on their feet.'],bonus:null},
 {name:'Bat Cave',icon:'🦇',short:'Review',learn:'The words that tricked you before. Beat them now!',tip:'Take your time. Say each test out loud.',
  build:buildWordReview,spec:['🦇','Fruit bat','Bats are the only mammals that can really fly.'],bonus:null},
 {name:'Space Station',icon:'🚀',short:'Final Mission',learn:'A little bit of everything. Show what you know!',tip:'You learned all of this. You can do it, Stella!',
  build:buildWordFinal,spec:['🪐','Saturn','Saturn is so light that it could float in a giant bathtub.'],bonus:'Teach a grown-up the 4 word tests: the ___, the ___ rock, I can ___, It moved ___.'}
];
const MATH_MISSIONS=[
 {id:'m9',name:'Balance Check',icon:'⚖️',short:'Balance?',learn:'The = sign means both sides weigh the same.',tip:'Read <b>=</b> as <b>"is the same as"</b>. Work out each side. Same number? It balances.',
  build:()=>[genTF(),genTF(),genTF(),genMissing(),genTF(),genMissing()],spec:['⚖️','Balance scale','People have used balance scales to compare weights for more than 4,000 years.'],bonus:'Use a real scale, or hang two cups from a coat hanger. Put 3 coins in one cup. How many in the other to balance?'},
 {id:'m10',name:'Mystery Bag Lab',icon:'🎒',short:'Find x',learn:'Solve equations with a balance scale.',tip:'<b>1.</b> Add up each side. <b>2.</b> Take the same off both sides. <b>3.</b> Open the bag and check.',
  build:()=>[genBalance(0),genBalance(1),genBalance(1),genBalance(2),genBalance(2)],spec:['🥚','Ostrich egg','One ostrich egg weighs about as much as 24 chicken eggs.'],bonus:'Hide some blocks in a paper bag and put it on one side of a scale. Can a grown-up work out how many are inside?'},
 {id:'m11',name:'Bar Model Builder',icon:'🧱',short:'Bar Models',learn:'Use a bar to find the missing part.',tip:'The long bar is the <b>whole</b>. The small boxes are the <b>parts</b>. Missing part = whole − the parts you know.',
  build:()=>[genBarM(93,[55,28])].concat(times(5,()=>genBarM())),spec:['🦕','Argentinosaurus','This dinosaur was heavier than 10 elephants.'],bonus:null},
 {id:'m1',name:'Sea Star Count',icon:'⭐',short:'Skip Count',learn:'Count by 2s, 5s and 10s.',tip:'Skip counting is fast counting. Count by 5s: <b>5, 10, 15, 20</b>.',
  build:()=>times(6,genSkip),spec:['🌟','Sea star','Most sea stars have 5 arms. Some kinds have up to 40!'],bonus:'Count your fingers and toes by 5s with a grown-up: 5, 10, 15, 20!'},
 {id:'m12',name:'Giraffe Boots',icon:'🦒',short:'Equal Groups',learn:'Multiply and divide with equal groups.',tip:'<b>3 × 4</b> means 3 groups of 4: 4 + 4 + 4. Your book may write it as <b>3 · 4</b>.',
  build:()=>times(6,genGroups),spec:['🦒','Giraffe','Each giraffe leg is taller than most grown-ups.'],bonus:'Make 3 groups of 4 with toys. Count by 4s. Then share 12 toys between 3 people.'},
 {id:'m13',name:'Story Detective',icon:'🔎',short:'Word Problems',learn:'Turn a story into a number sentence.',tip:'<b>1.</b> Circle the numbers. <b>2.</b> What is happening? <b>3.</b> Pick the number sentence. <b>4.</b> Solve.',
  build:()=>take(STORIES.map((_,i)=>i),5).map(genStoryRound),spec:['🦉','Barn owl','A barn owl can find a mouse in the dark just by listening.'],bonus:'Make up a story problem about animals for a grown-up to solve. Then switch!'},
 {id:'m2',name:'Pebble Beach',icon:'🪨',short:'Place Value',learn:'Hundreds, tens and ones.',tip:'A rod is <b>10</b>. A cube is <b>1</b>. 3 rods and 4 cubes = <b>34</b>.',
  build:()=>times(6,genPV),spec:['💎','Quartz','Quartz crystals grow with 6 sides.'],bonus:'Make groups of 10 with small things (beans or blocks). How many tens? How many ones?'},
 {id:'m3',name:'Animal Olympics',icon:'🏅',short:'Compare',learn:'Which number is bigger? Use < > =.',tip:'Look at the <b>tens</b> first. The open side of &lt; or &gt; faces the <b>bigger</b> number.',
  build:()=>times(6,genCmp),spec:['🐆','Cheetah','A cheetah can run about 100 km per hour.'],bonus:null},
 {id:'m4',name:'Ant Hill',icon:'🐜',short:'Add',learn:'Add numbers up to 100.',tip:'Add the <b>tens</b>. Add the <b>ones</b>. Put them together.',
  build:()=>times(6,genAdd),spec:['🌻','Sunflower','Sunflower seeds grow in spiral patterns.'],bonus:null},
 {id:'m5',name:'Tide Pool Take-Away',icon:'🌊',short:'Subtract',learn:'Take away numbers up to 100.',tip:'Take away the <b>tens</b> first. Then take away the <b>ones</b>.',
  build:()=>times(6,genSub),spec:['🌙','The Moon','The Moon pulls on the oceans. That makes the tides.'],bonus:'Put 20 small things in a bowl. Take some away. How many are left?'},
 {id:'m6',name:'Night Watch',icon:'🕰️',short:'Clock',learn:'Tell time to 5 minutes.',tip:'Short hand = <b>hour</b>. Long orange hand = <b>minutes</b>. Count by 5s from 12.',
  build:()=>times(6,genTime),spec:['🌍','Earth','Earth spins around once every 24 hours. That is one day.'],bonus:'Look at a real clock 3 times today. Tell a grown-up the time.'},
 {id:'m7',name:'Measuring Lab',icon:'📏',short:'Measure',learn:'Measure with a ruler in centimeters.',tip:'Start at <b>0</b>. If it does not start at 0, count the spaces.',
  build:()=>times(6,genLen),spec:['🐍','Python','The longest snake ever measured was about 10 meters long.'],bonus:'Measure 3 things with a real ruler: a pencil, a leaf, your hand.'},
 {id:'m8',name:'Math Mix',icon:'🧮',short:'Math Mix',learn:'A mix of everything, plus odd and even.',tip:'Even numbers make pairs. Odd numbers have 1 left over.',
  build:buildMathMix,spec:['🍯','Honeycomb','Bees build honeycomb from 6-sided shapes called hexagons.'],bonus:null}
];
const SOCIAL_MISSIONS=[
 {name:'Feelings Detective',icon:'🕵️',short:'Feelings',learn:'Look for clues to see how someone feels.',tip:'Scientists look for clues. Feelings have clues too: <b>face</b>, <b>body</b>, <b>voice</b>, and <b>what happened</b>.',
  build:()=>socialBuild(1),spec:['🐘','Elephant','Elephants gently touch a sad friend with their trunk.'],bonus:'Play feelings charades: make a face, and a grown-up guesses the feeling. Then switch!'},
 {name:'Problem Sizes',icon:'📐',short:'Problem Size',learn:'Is it a small, medium or big problem?',tip:'🐜 <b>Small</b>: you can fix it. 🐕 <b>Medium</b>: you may need help. 🐘 <b>Big</b>: get a grown-up now. Small problem = small reaction.',
  build:()=>socialBuild(2,6),spec:['🐜','Leafcutter ant','Ants solve big problems by working together.'],bonus:null},
 {name:'Calm-Down Cave',icon:'🫧',short:'Calm Tools',learn:'Tools to calm your body and brain.',tip:'First calm the body. Then solve the problem.',
  build:()=>[{type:'breathe'}].concat(socialBuild(3,4)),spec:['🦦','Sea otter','Sea otters hold paws while they sleep so they do not float apart.'],bonus:'Show a grown-up your favorite calm tool.'},
 {name:'Conversation Ping-Pong',icon:'🏓',short:'Talking',learn:'Take turns when you talk.',tip:'Talking is like ping-pong: you say something, then the other person gets a turn.',
  build:()=>socialBuild(4),spec:['🐬','Dolphin','Each dolphin has its own whistle, like a name.'],bonus:'At dinner, ask someone about their day. Then ask one more question about their answer.'},
 {name:'Mind Reader Lab',icon:'🧠',short:'Other People',learn:'Other people know, like and feel different things.',tip:'Ask: <b>What does the other person know?</b> <b>How might they feel?</b>',
  build:()=>socialBuild(5),spec:['🐒','Chimpanzee','Chimpanzees can figure out what another chimp can and cannot see.'],bonus:null},
 {name:'Say What?!',icon:'💬',short:'Hidden Meanings',learn:'Some sayings do not mean exactly what the words say.',tip:'If the words sound silly or impossible, it might be an <b>idiom</b>. Ask: what do they really mean?',
  build:()=>socialBuild(6),spec:['🐛','Bookworm','A bookworm is not a worm. It is a person who loves books!'],bonus:'Ask a grown-up to tell you one idiom. Draw what it would look like if it were real!'},
 {name:'Playground Rules',icon:'🛝',short:'Playing',learn:'Joining in, taking turns and being a good sport.',tip:'Good sports say "good game," take turns, and are OK with Plan B.',
  build:()=>socialBuild(7),spec:['🐺','Wolf','Wolves do a "play bow" to say: let\'s play!'],bonus:null},
 {name:'Help Station',icon:'🙋',short:'Asking for Help',learn:'When and how to ask for help. Plus a review.',tip:'Asking for help is smart. Scientists ask questions all the time!',
  build:buildSocialMix,spec:['🦫','Beaver','Beaver families work together to build their dams.'],bonus:null}
];
const WORLDS={
 w:{key:'w',name:'Word Lab',icon:'📚',color:'#ffc94d',desc:'Nouns, verbs, adjectives, adverbs, punctuation',missions:WORD_MISSIONS},
 m:{key:'m',name:'Number Lab',icon:'🔢',color:'#6cc6ff',desc:'Skip counting, place value, adding, time, measuring',missions:MATH_MISSIONS},
 s:{key:'s',name:'People Lab',icon:'🤝',color:'#f59ae0',desc:'Feelings, calm tools, conversations, friends',missions:SOCIAL_MISSIONS}
};
const MISS={};
Object.values(WORLDS).forEach(W=>W.missions.forEach((m,i)=>{m.id=m.id||W.key+(i+1);m.n=i+1;m.world=W.key;MISS[m.id]=m}));
const BREAKS=['Hop like a frog 10 times! 🐸','Stretch up tall like a giraffe. Count to 10. 🦒','Waddle like a penguin across the room! 🐧','Flap your wings like a bird 10 times! 🐦','Curl up like a pill bug, then pop open! 🐛','Stomp like a dinosaur 10 times! 🦕','Slither like a snake to the door and back! 🐍','Spin slowly like a planet 3 times! 🪐','Hop like a kangaroo 10 times! 🦘','Swim like a fish with your arms for 10 seconds! 🐟','Sway like a tree in the wind. Count to 10. 🌳','Crawl like a crab sideways! 🦀','Take 5 slow breaths, like a sleeping bear. 🐻'];

/* ================= SAVED PROGRESS ================= */
const KEY='stella-science-quest-v2';
function fresh(){return{v:2,stars:0,best:{},done:{},bonus:{},days:[],sound:true,calm:false,log:[],today:null,
  // Seeded from her worksheets: nouns circled as adjectives, "hair" missed, and circling only "ly".
  mistakes:{'w:tree':1,'w:butterfly':1,'w:flower':1,'w:bus':1,'w:hair':1,'q:0':1}}}
function migrate(s){ // version 1 of this app stored Word Lab missions as numbers 1..10
  ['done','best','bonus'].forEach(k=>{const o=s[k]||{};Object.keys(o).forEach(id=>{if(/^\d+$/.test(id)){o['w'+id]=o[id];delete o[id]}})});
  (s.log||[]).forEach(l=>{if(typeof l.m==='number')l.m='w'+l.m});return s}
let S=(()=>{try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===2)return migrate(Object.assign(fresh(),s))}catch(e){}return fresh()})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}
function addMistake(k){if(k)S.mistakes[k]=(S.mistakes[k]||0)+1}
function clearMistake(k){if(k&&S.mistakes[k]){S.mistakes[k]--;if(S.mistakes[k]<=0)delete S.mistakes[k]}}
function streak(){const set=new Set(S.days);let n=0;const d=new Date();if(!set.has(dayStr(d)))d.setDate(d.getDate()-1);while(set.has(dayStr(d))){n++;d.setDate(d.getDate()-1)}return n}
const RANKS=[[0,'Junior Explorer'],[40,'Field Scientist'],[120,'Lab Scientist'],[250,'Expedition Leader'],[400,'Professor Stella']];
function rankInfo(){let i=0;RANKS.forEach((r,k)=>{if(S.stars>=r[0])i=k});const cur=RANKS[i],nx=RANKS[i+1];return{name:cur[1],next:nx,pct:nx?(S.stars-cur[0])/(nx[0]-cur[0])*100:100}}
function prevOf(m){return WORLDS[m.world].missions[m.n-2]}
function unlocked(m){return m.n===1||!!S.done[prevOf(m).id]||!!S.done[m.id]}
function nextIn(w){return WORLDS[w].missions.find(m=>!S.done[m.id])}
function doneCount(w){return WORLDS[w].missions.filter(m=>S.done[m.id]).length}
// Today's plan is fixed once per day, so the order never changes under her.
function planFor(w){const ms=WORLDS[w].missions;return(nextIn(w)||ms.slice().sort((a,b)=>(S.best[a.id]||0)-(S.best[b.id]||0))[0]).id}
function today(){const d=dayStr();if(!S.today||S.today.d!==d){S.today={d,plan:['w','m','s'].map(planFor),done:[],rewarded:false};save()}return S.today}
function nextPlanStep(){const t=today();return t.plan.find(id=>!t.done.includes(id))}

/* ================= SOUND, VOICE, CONFETTI ================= */
let AC;
function tone(fs,dur=.13,type='sine',gap=.09){if(!S.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const t0=AC.currentTime+.01;fs.forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=f;const s=t0+i*gap;g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(S.calm?.08:.18,s+.02);g.gain.exponentialRampToValueAtTime(.0001,s+dur);o.connect(g);g.connect(AC.destination);o.start(s);o.stop(s+dur+.05)})}catch(e){}}
const SFX={good:()=>tone([660,990]),bad:()=>tone([330,262],.18,'sine',.12),win:()=>tone([523,659,784,1047],.22,'sine',.11),tap:()=>tone([540],.05)};
function speak(t){if(!S.sound||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(strip(t));u.lang='en-US';u.rate=.85;const v=speechSynthesis.getVoices().find(v=>/en[-_]US/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch(e){}}
function confetti(n=80){
  if(S.calm||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const cols=['#ffc94d','#ffe39a','#6cc6ff','#f59ae0','#5ee3b1','#a6e36b'];
  const ps=times(n,()=>({x:c.width/2+(Math.random()-.5)*200,y:c.height*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:Math.random()*6+5,c:cols[rnd(6)],a:Math.random()*6,va:(Math.random()-.5)*.3}));
  let f=0;(function step(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.beginPath();for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,q=i%2?p.r*.45:p.r;x.lineTo(q*Math.cos(an),q*Math.sin(an))}x.fill();x.restore()});if(++f<110)requestAnimationFrame(step);else x.clearRect(0,0,c.width,c.height)})();
}

/* ================= EXPLANATIONS ================= */
function explain(t,layout){
  const w=esc(t.w),ly=/ly$/.test(t.w)&&t.tag!=='d'?` It ends in -ly, but it is <b>not</b> an adverb!`:'';
  if(t.tag==='n')return(PROPER.includes(t.w)?`<b>${w}</b> is a ${tagSpan('n')}. It is a name.`:`<b>${w}</b> is a ${tagSpan('n')}, a thing you can see or touch. Try: "the ${esc(t.w.toLowerCase())}" ✓`)+ly;
  if(t.tag==='a')return`<b>${w}</b> is an ${tagSpan('a')}. It describes. Try: "the ${w} rock" ✓`+ly;
  if(t.tag==='v')return(layout==='sentence'?`<b>${w}</b> is the ${tagSpan('v')}. It is the action in this sentence.`:`<b>${w}</b> is a ${tagSpan('v')}, an action. Try: "I can ${w}" ✓`)+ly;
  if(t.tag==='d')return`<b>${w}</b> is an ${tagSpan('d')}. It tells HOW. Try: "It moved ${w}" ✓`;
  return`<b>${w}</b> is a small helper word.`;
}
function factFor(words){for(const w of words){if(FACTS[w])return FACTS[w]}return null}
const CHEERS=['Correct!','Great science brain!','You got it!','Nailed it!','Exactly right!','Super sorting!','Scientist-level thinking!','That is a discovery!','Sharp eyes!','Perfect observation!','Brilliant!'];
const OOPS=['Not this time. Here is why:','Good try. Here is the rule:','Tricky one. Let\'s look:'];

/* ================= VIEWS ================= */
const VIEWS=['home','world','play','result','stk','par'];
let curWorld='w';
function show(v){VIEWS.forEach(n=>{$('#v-'+n).hidden=n!==v});
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('on',b.dataset.nav===v));
  if(v==='home')renderHome();if(v==='world')renderWorld(curWorld);if(v==='stk')renderCards();if(v==='par')renderParent();scrollTo(0,0)}
function refreshChips(bump){$('#starN').textContent=S.stars;$('#dayN').textContent=streak();$('#soundBtn').textContent=S.sound?'🔊':'🔇';$('#calmBtn').classList.toggle('on',S.calm);document.body.classList.toggle('calm',S.calm);
  if(bump&&!S.calm){const c=$('#starChip');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}}

function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
function renderHome(){
  const t=today(),nxt=nextPlanStep(),rk=rankInfo(),allDone=!nxt;
  const steps=t.plan.map((id,i)=>{const m=MISS[id],W=WORLDS[m.world],done=t.done.includes(id),now=id===nxt;
    return`<button class="step ${done?'done':''} ${now?'now':''}" data-go="${id}" style="--acc:${W.color}">
      <span class="stepn">${done?'✓':i+1}</span><span class="stepw">${W.icon} ${W.name}</span>
      <span class="stepm">${m.icon} ${m.name}</span><span class="steps2">${m.short} · about 5 minutes</span>
      <span class="stepst">${done?'Done!':now?'Now ▶':'Next'}</span></button>`}).join('<span class="arrow" aria-hidden="true">→</span>');
  const tiles=Object.values(WORLDS).map(W=>{const d=doneCount(W.key),n=W.missions.length;
    return`<button class="wtile" data-world="${W.key}" style="--acc:${W.color}"><span class="wi">${W.icon}</span><span class="wn">${W.name}</span><span class="wd">${W.desc}</span><span class="bar"><i style="width:${d/n*100}%"></i></span><span class="wc">${d} of ${n} places explored</span></button>`}).join('');
  $('#v-home').innerHTML=`
   <div class="hello">${novaSVG()}<div><h1>${greeting()}, Stella!</h1><p class="fact">Here is today's plan. Three short missions, in this order.</p></div></div>
   <section class="plan" aria-label="Today's plan"><div class="planrow">${steps}<span class="arrow" aria-hidden="true">→</span>
     <div class="step gift ${t.rewarded?'done':''}"><span class="stepn">🎁</span><span class="stepw">Surprise</span><span class="stepm">${t.rewarded?'Opened!':'+10 ⭐ and a mystery fact'}</span><span class="steps2">${t.rewarded?esc(t.fact||''):'Finish all 3 to open it'}</span></div></div>
     ${allDone?'<p class="fact" style="margin-top:10px">Today\'s plan is done. Great work! You can still explore any lab below.</p>':''}</section>
   <div class="homegrid"><div class="wtiles">${tiles}</div>
   <div class="side"><div class="rank"><div class="row"><span>🏅 ${rk.name}</span><span>${rk.next?`${S.stars} / ${rk.next[0]} ⭐`:S.stars+' ⭐'}</span></div><div class="bar"><i style="width:${Math.min(100,rk.pct)}%"></i></div>${rk.next?`<p class="fact">Next rank: <b>${rk.next[1]}</b></p>`:''}</div>
   <p class="fact">Did you know? <b>Stella</b> means <b>"star"</b> in Latin. A star is a giant ball of hot gas, like our Sun.</p>
   <button class="ghost" id="calmHome">🫧 Calm Corner</button></div></div>`;
  $('#v-home').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>startMission(b.dataset.go));
  $('#v-home').querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{curWorld=b.dataset.world;show('world')});
  $('#calmHome').onclick=openCalm;
  refreshChips();
}
const PTS=[[270,70],[175,48],[92,92],[78,178],[160,225],[255,272],[290,352],[235,432],[145,452],[68,400]];
function renderWorld(w){
  const W=WORLDS[w],nx=nextIn(w),ms=W.missions,pts=ms.map((_,i)=>{const row=Math.floor(i/3),col=i%3;return[(row%2?[290,180,70]:[70,180,290])[col],55+row*105]}),h=55+Math.ceil(ms.length/3)*105;
  let svg=`<svg class="trail" viewBox="0 0 360 ${h}" role="group" aria-label="${W.name} map" style="--acc:${W.color}">`;
  for(let i=0;i<ms.length-1;i++){const[a,b]=[pts[i],pts[i+1]];svg+=`<line class="ln ${S.done[ms[i].id]?'lit':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`}
  ms.forEach((m,i)=>{const[x,y]=pts[i];const st=S.done[m.id]?'done':(unlocked(m)?'next':'locked');
    svg+=`<g class="node ${st}" data-id="${m.id}" tabindex="0" role="button" aria-label="${m.name}${st==='locked'?' (locked)':''}"><circle class="halo" cx="${x}" cy="${y}" r="27"/><circle class="bub" cx="${x}" cy="${y}" r="25"/><text class="emo" x="${x}" y="${y+8}">${m.icon}</text>${st==='done'?`<circle class="ck" cx="${x+19}" cy="${y-19}" r="9"/><text class="ckt" x="${x+19}" y="${y-15}">✓</text>`:''}<text class="lbl" x="${x}" y="${y+42}">${m.short}</text></g>`});
  svg+='</svg>';
  const card=nx?`<div class="eyebrow">Next in ${W.name} · ${nx.n} of ${ms.length}</div><h2>${nx.icon} ${nx.name}</h2><p>${nx.learn}</p><div class="tip">💡 ${nx.tip}</div>
      <p>Field Guide card to find: <b>${nx.spec[0]} ${nx.spec[1]}</b></p><div class="btnrow"><button class="big" id="goNext">Start ▶</button></div>`
    :`<div class="eyebrow">${W.name} complete!</div><h2>Every place explored!</h2><p>Tap any place on the map to play again and collect more stars.</p>`;
  $('#v-world').innerHTML=`<div class="wtitle" style="--acc:${W.color}"><button class="ghost" id="backHome">← Home</button><h1>${W.icon} ${W.name}</h1></div>
   <div class="mapgrid"><div class="today" style="--acc:${W.color}">${card}</div><div>${svg}</div></div>`;
  $('#backHome').onclick=()=>show('home');
  $('#v-world').querySelectorAll('.node').forEach(g=>{const go=()=>openSheet(g.dataset.id);g.addEventListener('click',go);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
  const gn=$('#goNext');if(gn)gn.onclick=()=>startMission(nx.id);
  refreshChips();
}
function openSheet(id){
  const m=MISS[id],ov=$('#overlay'),lock=!unlocked(m),b=S.best[id]||0;
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${m.name}"><div class="eyebrow">${WORLDS[m.world].name} · ${m.short}</div><h2>${m.icon} ${m.name}</h2>
    ${b?`<div class="mini-stars" aria-label="${b} stars">${'★'.repeat(b)}${'☆'.repeat(3-b)}</div>`:''}
    <p>${m.learn}</p><div class="tip">💡 ${m.tip}</div>
    ${lock?`<p>🔒 Finish "${prevOf(m).name}" first. Then this place opens.</p>`:''}
    <div class="btnrow"><button class="big" id="shGo" ${lock?'disabled':''}>${S.done[id]?'Play again ▶':'Start ▶'}</button><button class="ghost" id="shX">Close</button></div></div>`;
  ov.hidden=false;
  $('#shX').onclick=closeSheet;ov.onclick=e=>{if(e.target===ov)closeSheet()};
  if(!lock)$('#shGo').onclick=()=>{closeSheet();startMission(id)};
}
function closeSheet(){$('#overlay').hidden=true;$('#overlay').innerHTML='';clearInterval(breathTimer)}

/* ================= CALM CORNER ================= */
let breathTimer=null;
function runBreath(circle,label,cycles,onDone){
  let n=0,phase=0;const P=[['Breathe in...',1.6],['Hold...',1.6],['Breathe out...',1]];
  const step=()=>{const[t,s]=P[phase];label.textContent=t+(cycles?` (${n+1} of ${cycles})`:'');circle.style.transform=`scale(${s})`;
    phase=(phase+1)%3;if(phase===0){n++;if(cycles&&n>=cycles){clearInterval(breathTimer);setTimeout(()=>{label.textContent='Well done.';circle.style.transform='scale(1)';onDone&&onDone()},4000)}}};
  clearInterval(breathTimer);step();breathTimer=setInterval(step,4000);
}
function openCalm(){
  const ov=$('#overlay');
  ov.innerHTML=`<div class="sheet calmsheet" role="dialog" aria-modal="true" aria-label="Calm Corner"><h2>🫧 Calm Corner</h2>
   <p>Watch the bubble. Breathe in while it grows. Breathe out while it shrinks.</p>
   <div class="breathwrap"><div class="breath" id="cb"></div></div><p class="blabel" id="cbl"></p>
   <div class="tip"><b>Other calm tools:</b><ul><li>Squeeze your hands tight, then let go. Do it 3 times.</li><li>Drink some water.</li><li>5-4-3-2-1: find 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.</li><li>Ask a grown-up for a break.</li></ul></div>
   <div class="btnrow"><button class="big" id="shX">I feel calmer</button></div></div>`;
  ov.hidden=false;$('#shX').onclick=closeSheet;
  runBreath($('#cb'),$('#cbl'),0);
}

/* ================= PLAYING ================= */
let R=null;
function startMission(id){const m=MISS[id];R={m,rounds:m.build(),i:0,errs:0,good:0,combo:0,best:0};curWorld=m.world;$('#rk').textContent=m.icon;
  document.documentElement.style.setProperty('--acc',WORLDS[m.world].color);show('play');renderRound()}
function setProgress(){const p=R.i/R.rounds.length*100,left=R.rounds.length-R.i;$('#fill').style.width=p+'%';$('#rk').style.left=Math.max(3,Math.min(97,p))+'%';
  $('#count').innerHTML=`${R.i+1} / ${R.rounds.length}<small>${left===1?'Last one!':R.combo>=3?`🔥 ×${R.combo}`:''}</small>`}
function renderRound(){
  const r=R.rounds[R.i];R.cur={r,err:false,done:false};setProgress();clearInterval(breathTimer);
  const st=$('#stage');st.innerHTML='';st.className='stage';$('#hint').textContent='';$('#actions').innerHTML='';$('#fb').hidden=true;$('#fb').innerHTML='';
  ({select:rSelect,sort:rSort,punct:rPunct,proof:rProof,pair:rPair,choice:rChoice,breathe:rBreathe,balance:rBalance,story:rStory})[r.type](r,st);
}
function setPrompt(html,say){$('#prompt').innerHTML=html;$('#sayBtn').onclick=()=>speak(say||html)}
function shake(b){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake')}

function rSelect(r,st){
  const n=r.tokens.filter(t=>t.tag===r.target).length,sentence=r.layout==='sentence';
  setPrompt(n===1&&sentence?`Tap the ${tagSpan(r.target)} in the sentence.`:`Tap ALL the ${tagSpan(r.target)}s${sentence?' in the sentence':''}. Then tap Check.`,
    sentence?plain(SENTS[r.idx]):`Tap all the ${TAGNAME[r.target]}s. Then tap Check.`);
  const box=el('div',sentence?'sentence':'cloud'),sel=new Set(),btns=[];
  r.tokens.forEach((t,i)=>{
    if(isP(t.w)){box.appendChild(el('span','p',t.w));return}
    const b=el('button','tok');b.textContent=t.w;
    if(!sentence)b.style.transform=`rotate(${(Math.random()*8-4).toFixed(1)}deg)`;
    b.onclick=()=>{if(sel.has(i)){sel.delete(i);b.classList.remove('sel')}else{sel.add(i);b.classList.add('sel');if(!sentence)speak(t.w)}SFX.tap();chk.disabled=!sel.size};
    btns[i]=b;box.appendChild(b)});
  st.appendChild(box);
  const chk=el('button','big','Check ✓');chk.disabled=true;$('#actions').appendChild(chk);
  chk.onclick=()=>{
    $('#actions').innerHTML='';st.classList.add('locked');const wrong=[],missed=[];
    r.tokens.forEach((t,i)=>{if(!btns[i])return;const isT=t.tag===r.target,s=sel.has(i);btns[i].classList.remove('sel');
      if(s&&isT){btns[i].classList.add('ok');if(!sentence)clearMistake('w:'+t.w)}
      else if(s){btns[i].classList.add('no');wrong.push(t)}
      else if(isT){btns[i].classList.add('miss');missed.push(t)}});
    const ok=!wrong.length&&!missed.length;
    if(!sentence)wrong.concat(missed).forEach(t=>{if(WORDTAG[t.w])addMistake('w:'+t.w)});
    else ok?clearMistake(`s:${r.idx}:${r.target}`):addMistake(`s:${r.idx}:${r.target}`);
    const lines=wrong.map(t=>explain(t,r.layout)).concat(missed.map(t=>'You missed one: '+explain(t,r.layout))).slice(0,3);
    finish(ok,lines,factFor(shuffle(r.tokens.map(t=>t.w))));
  };
}
function rSort(r,st){
  setPrompt(r.bins.length>2?'What kind of word is it?':`Is it a ${r.bins.map(tagSpan).join(' or ')}?`,r.w);
  st.appendChild(el('div','word',esc(r.w)));
  const bins=el('div','bins');
  r.bins.forEach(t=>{const b=el('button','bin '+t,`<b>${TAGNAME[t][0].toUpperCase()+TAGNAME[t].slice(1)}</b><small>${TAGTEST[t].replace('___',esc(r.w))}</small>`);
    b.onclick=()=>{st.classList.add('locked');const ok=t===r.tag;b.classList.add(ok?'picked-ok':'picked-no');ok?clearMistake('w:'+r.w):addMistake('w:'+r.w);
      finish(ok,ok&&!/ly$/.test(r.w)?[]:[explain({w:r.w,tag:r.tag},'cloud')],factFor([r.w]))};bins.appendChild(b)});
  st.appendChild(bins);setTimeout(()=>speak(r.w),150);
}
const PWHY={'.':'It tells something, so it ends with a period.','?':'It asks something, so it ends with a question mark.','!':'It shows a strong feeling, so it ends with an exclamation mark!'};
function rPunct(r,st){
  const [s,ans]=PUNCT[r.idx];setPrompt('Which mark goes at the end?',s);
  const line=el('div','sentence');
  s.split(' ').forEach(w=>{const sp=el('span','tok');sp.style.pointerEvents='none';sp.textContent=w;line.appendChild(sp)});
  const bl=el('span','blank',' ');line.appendChild(bl);st.appendChild(line);
  const pms=el('div','pms');
  [['.','tells'],['?','asks'],['!','wow!']].forEach(([m,l])=>{const b=el('button','pm',`<b>${m}</b><small>${l}</small>`);b.setAttribute('aria-label',{'.':'period','?':'question mark','!':'exclamation mark'}[m]);
    b.onclick=()=>{st.classList.add('locked');bl.textContent=m;const ok=m===ans;bl.style.borderColor=ok?'var(--mint)':'var(--coral)';ok?clearMistake('p:'+r.idx):addMistake('p:'+r.idx);
      finish(ok,ok?[]:[`The answer is <b>${ans}</b>. ${PWHY[ans]}`])};pms.appendChild(b)});
  st.appendChild(pms);
}
function rProof(r,st){
  const [src,fix,opts,hint]=PROOF[r.idx];
  const toks=src.split(' ').map(x=>{const bad=/^\|.*\|$/.test(x);return{w:bad?x.slice(1,-1):x,bad}});
  setPrompt('There is 1 mistake. Tap it. 🔍',plain(src));
  const line=el('div','sentence'),optBox=el('div','opts');st.appendChild(line);st.appendChild(optBox);
  let tries=0;
  toks.forEach(t=>{
    const b=el('button',t.w==='_'?'blank':'tok');
    if(t.w==='_'){b.textContent=' ';b.setAttribute('aria-label','end of the sentence')}else b.textContent=t.w;
    b.onclick=()=>{
      if(R.cur.done)return;
      if(!t.bad){R.cur.err=true;tries++;shake(b);SFX.bad();$('#hint').textContent=tries>=2?'💡 '+hint:'That part is correct. Look at the other words and the end.';return}
      SFX.tap();optBox.innerHTML='<div class="lead">How should it be?</div>';
      shuffle(opts).forEach(o=>{const ob=el('button','opt');ob.textContent=o;
        ob.onclick=()=>{if(o===fix){R.cur.done=true;b.textContent=fix;b.className='tok fixed';optBox.innerHTML='';st.classList.add('locked');
            R.cur.err?addMistake('f:'+r.idx):clearMistake('f:'+r.idx);finish(!R.cur.err,R.cur.err?['💡 '+hint]:[],null,R.cur.err)}
          else{R.cur.err=true;ob.disabled=true;ob.style.opacity=.35;SFX.bad();$('#hint').textContent='💡 '+hint}};
        optBox.appendChild(ob)})};
    line.appendChild(b)});
}
// Two steps: tap the WHOLE -ly adverb, then the verb it describes (her worksheet asked for both).
function rPair(r,st){
  const toks=parseS(ADV_SENTS[r.idx]),say=plain(ADV_SENTS[r.idx]);let step=1,adv='';
  const setP=()=>setPrompt(step===1?`Step 1 of 2: Tap the whole ${tagSpan('d')}.`:`Step 2 of 2: <b class="d">${adv}</b> tells HOW. Tap the ${tagSpan('v')} it tells about.`,say);
  setP();
  const line=el('div','sentence');st.appendChild(line);
  toks.forEach(t=>{
    if(isP(t.w)){line.appendChild(el('span','p',t.w));return}
    const b=el('button','tok');b.textContent=t.w;
    b.onclick=()=>{
      if(R.cur.done)return;
      const want=step===1?'d':'v';
      if(t.tag===want){
        if(step===1){adv=t.w;b.className='tok ok';b.innerHTML=esc(t.w.slice(0,-2))+'<u>ly</u>';SFX.tap();$('#hint').innerHTML=`Yes! The <b>whole word</b> "${esc(t.w)}" is the adverb, not only "ly".`;step=2;setP()}
        else{R.cur.done=true;b.className='tok fixed';st.classList.add('locked');R.cur.err?addMistake('q:'+r.idx):clearMistake('q:'+r.idx);
          finish(!R.cur.err,[`<b class="d">${esc(adv)}</b> tells HOW it <b class="v">${esc(t.w)}</b>. The adverb and the verb go together.`],null,R.cur.err)}
      }else{R.cur.err=true;shake(b);SFX.bad();
        $('#hint').textContent=step===1?(/ly$/.test(t.w)?`"${t.w}" ends in -ly, but it is a ${TAGNAME[WORDTAG[t.w]]||'different word'}, not an adverb! Find the word that tells HOW.`:`"${t.w}" is not the adverb. Find the word that ends in -ly and tells HOW.`):`"${t.w}" is not the action. What did it do ${adv}?`}
    };
    line.appendChild(b)});
}
// Number Lab and People Lab: pick an answer. First miss = hint and a second try. Second miss = show the answer and why.
function rChoice(r,st){
  setPrompt(r.prompt,r.say||r.prompt);
  if(r.visual)st.appendChild(el('div','visual',r.visual));if(r.onShow)r.onShow(st);
  const box=el('div','choices'+(r.wide?' wide':'')),opts=r.fixed?r.opts:shuffle(r.opts);let tries=0;
  opts.forEach(o=>{const b=el('button','choice',o.t+(o.label?`<small>${o.label}</small>`:''));o.btn=b;
    b.onclick=()=>{
      if(R.cur.done||b.disabled)return;
      if(o.ok){R.cur.done=true;b.classList.add('right');st.classList.add('locked');if(r.onDone)r.onDone(st);R.cur.err?addMistake(r.key):clearMistake(r.key);
        finish(!R.cur.err,[o.why||r.explain].filter(Boolean),r.fact,R.cur.err);return}
      R.cur.err=true;tries++;b.classList.add('wrong');b.disabled=true;shake(b);SFX.bad();
      const left=opts.filter(x=>!x.btn.disabled);
      if(tries>=2||left.length<=1){R.cur.done=true;st.classList.add('locked');if(r.onDone)r.onDone(st);opts.find(x=>x.ok).btn.classList.add('right');addMistake(r.key);
        finish(false,[o.why,`The answer is <b>${strip(opts.find(x=>x.ok).t)}</b>. ${r.explain||opts.find(x=>x.ok).why||''}`].filter(Boolean),r.fact);return}
      $('#hint').innerHTML='🤔 '+(o.why||'Not this one.')+(r.hint&&!o.why?' Tap 💡 Show me how for help.':' Try again!');
    };box.appendChild(b)});
  st.appendChild(box);
  if(r.hint){const hb=el('button','ghost','💡 Show me how');hb.onclick=()=>{hb.remove();st.insertBefore(el('div','howto',r.hint),box)};$('#actions').appendChild(hb)}
}
function rBreathe(r,st){
  setPrompt('Calm tool: bubble breathing. Breathe with the bubble 3 times.','Calm tool: bubble breathing. Breathe in while the bubble grows. Breathe out while it shrinks. Three times.');
  const wrap=el('div','breathwrap','<div class="breath"></div>');st.appendChild(wrap);const lab=el('p','blabel');st.appendChild(lab);
  const b=el('button','big','I did it ✓');b.disabled=true;$('#actions').appendChild(b);
  runBreath(wrap.firstChild,lab,3,()=>{b.disabled=false});
  b.onclick=()=>{$('#actions').innerHTML='';finish(true,['You can use bubble breathing any time. Tap 🫧 at the top of the screen.'])};
}
function finish(ok,lines,fact,fixed){
  if(ok){R.good++;R.combo++;R.best=Math.max(R.best,R.combo);S.stars++;SFX.good();refreshChips(true)}else{R.errs++;R.combo=0;SFX.bad()}
  save();setProgress();
  let msg=ok?pick(CHEERS):fixed?'You fixed it! Next time, try to get it on the first try.':pick(OOPS);
  if(ok&&R.combo===3)msg='3 in a row! 🔥';if(ok&&R.combo===5){msg='5 in a row! 💥';confetti(50)}
  const last=R.i===R.rounds.length-1,fb=$('#fb'),good=ok||fixed;
  fb.className='fb '+(good?'good':'bad');fb.hidden=false;
  fb.innerHTML=`${novaSVG(good?'':'oops')}<div class="body"><h3>${good?'✓ ':''}${msg}${ok?' <span style="color:var(--gold2)">+1 ⭐</span>':''}</h3>${lines.length?'<ul>'+lines.map(l=>'<li>'+l+'</li>').join('')+'</ul>':''}${fact?`<div class="sci">🔬 Science fact: ${esc(fact)}</div>`:''}</div><button class="big go" id="nextBtn">${last?'Finish 🏁':'Next ➜'}</button>`;
  $('#hint').textContent='';$('#actions').innerHTML='';
  $('#nextBtn').onclick=()=>{R.i++;R.i>=R.rounds.length?endMission():renderRound()};
  fb.scrollIntoView({behavior:S.calm?'auto':'smooth',block:'nearest'});
}
const MYSTERY=()=>{const v=Object.values(FACTS);return v[rnd(v.length)]};
function endMission(){
  const m=R.m,id=m.id,total=R.rounds.length,stars=R.errs<=1?3:R.errs<=3?2:1,first=!S.done[id],t=today();
  const bonus=first?5:0;S.stars+=bonus;
  S.best[id]=Math.max(S.best[id]||0,stars);if(first)S.done[id]=dayStr();
  if(!S.days.includes(dayStr()))S.days.push(dayStr());
  if(t.plan.includes(id)&&!t.done.includes(id))t.done.push(id);
  let gift='';
  if(t.done.length===t.plan.length&&!t.rewarded){t.rewarded=true;t.fact=MYSTERY();S.stars+=10;gift=`<div class="spec gift"><span class="e">🎁</span><div><div class="eyebrow">Today's plan complete! +10 ⭐</div><div class="disp" style="font-size:1.2rem">Mystery fact</div><div>${esc(t.fact)}</div></div></div>`}
  S.log.push({d:dayStr(),m:id,good:R.good,total,stars});if(S.log.length>300)S.log.shift();
  save();refreshChips(true);
  const starSvg=(on,k)=>`<svg viewBox="0 0 100 100" class="${on?'on':''}" style="animation-delay:${k*.25}s"><path d="${starPath(50,54,46,20)}" fill="${on?'#ffc94d':'#1b4254'}" stroke="${on?'#e0a21c':'#3a7389'}" stroke-width="4" stroke-linejoin="round"/></svg>`;
  const np=nextPlanStep(),npm=np&&MISS[np];
  const planLine=t.plan.includes(id)?`<div class="miniplan">${t.plan.map(p=>`<span class="${t.done.includes(p)?'d':''}">${t.done.includes(p)?'✓':'○'} ${WORLDS[MISS[p].world].icon} ${MISS[p].name}</span>`).join('')}</div>`:'';
  $('#v-result').innerHTML=`<div class="card result"><div class="eyebrow">${WORLDS[m.world].name} · ${m.name}</div><h2 style="font-size:2.2rem">${stars===3?'Perfect!':stars===2?'Great job, Stella!':'Mission complete!'}</h2>
   <div class="bigstars">${[1,2,3].map(k=>starSvg(k<=stars,k)).join('')}</div>
   <p style="margin:0;font-size:1.2rem">You got <b>${R.good} of ${total}</b> right on the first try · <b style="color:var(--gold2)">+${R.good+bonus} ⭐</b></p>
   ${first?`<div class="spec"><span class="e">${m.spec[0]}</span><div><div class="eyebrow">New Field Guide card!</div><div class="disp" style="font-size:1.35rem">${m.spec[1]}</div><div>${m.spec[2]}</div></div></div>`:''}
   ${gift}${planLine}
   <div class="extra"><div class="eyebrow">Brain break (optional)</div><div style="font-size:1.15rem">${pick(BREAKS)}</div><div><button class="ghost" id="brkBtn">Start 20 seconds</button></div></div>
   ${m.bonus&&!S.bonus[id]?`<div class="extra bonus" id="bonusBox"><div class="eyebrow">Bonus mission · with a grown-up</div><div>${m.bonus}</div><div><button class="ghost" id="bonusBtn">We did it! +3 ⭐</button></div></div>`:''}
   <div class="btnrow" style="justify-content:center">${npm?`<button class="big" id="rsNext">Next: ${npm.icon} ${npm.name} ▶</button><button class="ghost" id="rsHome">Home</button>`:`<button class="big" id="rsHome">Home 🏠</button>`}<button class="ghost" id="rsAgain">Play again</button></div></div>`;
  show('result');SFX.win();confetti(stars===3?140:80);
  $('#rsHome').onclick=()=>show('home');$('#rsAgain').onclick=()=>startMission(id);
  if(npm)$('#rsNext').onclick=()=>startMission(np);
  $('#brkBtn').onclick=e=>{const b=e.currentTarget;let n=20;b.disabled=true;b.textContent='20...';const iv=setInterval(()=>{n--;b.textContent=n>0?n+'...':'Done! 🎉';if(n<=0){clearInterval(iv);SFX.win()}},1000)};
  const bb=$('#bonusBtn');if(bb)bb.onclick=()=>{S.bonus[id]=dayStr();S.stars+=3;save();refreshChips(true);SFX.win();$('#bonusBox').innerHTML='<div class="disp" style="font-size:1.2rem">Bonus done! +3 ⭐</div>'};
}

/* ================= FIELD GUIDE ================= */
function renderCards(){
  const all=Object.values(MISS),got=all.filter(m=>S.done[m.id]).length;
  $('#v-stk').innerHTML=`<h1 style="font-size:2rem;margin-bottom:6px">Stella's Field Guide</h1><p class="fact" style="margin-bottom:16px">Finish a mission to add a card. ${got} of ${all.length} cards found.</p>`+
  Object.values(WORLDS).map(W=>`<h2 class="gh" style="--acc:${W.color}">${W.icon} ${W.name}</h2><div class="cards">${W.missions.map(m=>{const g=S.done[m.id];
    return`<div class="stk ${g?'':'lock'}"><div class="e">${m.spec[0]}</div><div class="nm">${g?m.spec[1]:'???'}</div><p>${g?m.spec[2]:`Found at: ${m.icon} ${m.name}`}</p>${g?`<p style="color:var(--gold)">${'★'.repeat(S.best[m.id]||0)}</p>`:''}</div>`}).join('')}</div>`).join('');
}

/* ================= PARENT PAGE ================= */
const PLAN_EN={
 w:[['Nouns','Every round mixes in easy-to-miss nouns like hair, grass and water'],['Adjectives','Concrete nouns like tree and fossil appear as distractors, targeting her habit of circling nouns as adjectives'],['Noun or adjective?','Her weakest area, practiced on its own'],['Verbs in sentences','A strength, to build confidence'],['-ly adverbs and their verbs','Two steps: tap the whole adverb, then the verb. Includes -ly traps like fly, lily and butterfly'],['Sorting 4 word types','Nouns, verbs, adjectives and adverbs side by side'],['End punctuation','A strength, kept fresh'],['Proofreading','Same format as her Camping worksheet'],['Review','Mistakes from her worksheets and from the game'],['Final mix','Everything together']],
 m:[['What "=" means','True/false equations and "7 + 5 = __ + 4": the = sign means "the same as", not "the answer comes next"'],['Equations with x','Interactive balance: add up each side, take the same off both sides, open the bag and check. Mirrors her "Write and solve an equation" page'],['Bar models','The whole bar and its parts; missing part = whole − known parts. Starts with 93 = 55 + x + 28 from her homework'],['Skip counting (2s, 5s, 10s)','Foundation for multiplication; uses pictured groups'],['Equal groups (× ÷)','Repeated addition, arrays and fair sharing, with pictures. Mentions the 3 · 4 notation from her book'],['Word problems','Four fixed steps: circle the numbers, pick what is happening (a picture), pick the number sentence, solve'],['Place value','Ten-rods and cubes, digit values, and expanded form (675 = 600 + 70 + 5)'],['Comparing < > =','One fixed rule: tens first, then ones'],['Adding within 100','Tens, then ones; wrong choices target forgetting to carry'],['Subtracting within 100','Tens, then ones; wrong choices target the "smaller from bigger" mistake'],['Telling time to 5 minutes','A real clock face with an orange minute hand'],['Measuring with a ruler','Includes objects that do not start at 0'],['Mixed review','All question types; ones she missed come first']],
 s:[['Reading feelings','Find clues in the face, body and situation, like a detective'],['Size of the problem','Small, medium or big, and a reaction that matches'],['Calm-down tools','Bubble breathing, plus noise, anger, worry and changed plans'],['Conversation turn-taking','Like ping-pong; check before sharing more about a favorite topic'],['Understanding other minds','False-belief (Sally-Anne style) questions, gifts for the other person\'s taste, kind replies'],['Idioms and literal meaning','"Raining cats and dogs" and more, including her "circle only the ly" worksheet'],['Playing together','Turns, joining in, "good game", Plan B, personal space'],['Asking for help','When and how to ask an adult, plus review']]
};
function backupCode(){try{return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){return''}}
function mistakeLabel(k){const p=k.split(':'),MT={skip:'skip counting',pv:'place value',cmp:'comparing',add:'adding',sub:'subtracting',time:'clock',len:'measuring',eo:'odd and even',tf:'is it balanced (=)',miss:'balance the scale',bal:'mystery bag equations',bar:'bar models',grp:'equal groups (× ÷)',story:'word problems'};
  if(p[0]==='w')return p[1];if(p[0]==='s')return`Find the ${TAGNAME[p[2]]}: "${plain(SENTS[+p[1]])}"`;if(p[0]==='p')return`Punctuation: ${PUNCT[+p[1]][0]}`;
  if(p[0]==='f')return`Proofreading: ${plain(PROOF[+p[1]][0])}`;if(p[0]==='q')return`Adverb: ${plain(ADV_SENTS[+p[1]])}`;if(p[0]==='mt')return`Math: ${MT[p[1]]||p[1]}`;
  if(p[0]==='so'&&SOCIAL[+p[1]])return`Social: ${SOCIAL[+p[1]].s}`;return k}
function renderParent(){
  const planTable=W=>`<div class="tbl"><table><tr><th>#</th><th>Level</th><th>What she practices</th><th>Why it is designed this way</th><th>Progress</th></tr>${W.missions.map((m,i)=>`<tr><td>${i+1}</td><td>${m.icon} <b>${m.name}</b></td><td>${PLAN_EN[W.key][i][0]}</td><td>${PLAN_EN[W.key][i][1]}</td><td>${S.done[m.id]?`<span class="tag good">${'★'.repeat(S.best[m.id]||0)} ${S.done[m.id]}</span>`:'<span class="tag warn">Not yet</span>'}</td></tr>`).join('')}</table></div>`;
  const mk=Object.entries(S.mistakes).sort((a,b)=>b[1]-a[1]).map(([k,c])=>`<span>${esc(mistakeLabel(k))} ×${c}</span>`).join('')||'<span>No mistakes to review</span>';
  const recent=S.log.slice(-10).reverse().map(l=>{const m=MISS[l.m];return m?`<li>${l.d}: ${WORLDS[m.world].name} · ${m.name}, ${l.good}/${l.total} right on the first try, ${'★'.repeat(l.stars)}</li>`:''}).join('')||'<li>No activity yet</li>';
  const t=today();
  $('#v-par').innerHTML=`<div class="parent">
  <section><h2>How this app teaches</h2>
   <p>The app is built for a child who is easily distracted, likes rules and predictability, and has a deep interest in one area (here, natural science):</p>
   <ul>
    <li><b>A visual schedule in a fixed order.</b> Each day the home page lists 3 short missions (words → math → people) and a reward. The plan does not change during the day. She knows what is coming and how much, which lowers worry about the unknown and makes it easier to move from one task to the next.</li>
    <li><b>Short, fast, immediate feedback.</b> Each level has 5 to 7 questions and takes about 5 minutes. Every answer gets feedback right away. A progress bar and a "Last one!" note show when the end is near. Each level ends with a 20-second animal movement break.</li>
    <li><b>Clear rules, with the exceptions spelled out.</b> Each skill has one fixed test phrase (like "the ___ rock"), and exceptions are named directly (fly and lily end in -ly but are not adverbs). Instructions are worded precisely so a literal reading still leads to the right answer.</li>
    <li><b>A hint before the answer.</b> The first wrong answer only gives a hint and another try. The answer and the reason appear after the second miss. Math questions have a step-by-step "Show me how" with no penalty. Answers that end up correct show green.</li>
    <li><b>Concrete → picture → abstract.</b> Math starts with pictures (ten-rods, groups, a clock face, a ruler) before numbers. Wrong choices match real mistakes children make (forgetting to carry, reading the minute hand as its number).</li>
    <li><b>Her special interest as a bridge.</b> Content and rewards are about natural science. The People Lab treats studying people like scientific observation (looking for clues), and its rewards are cards about animal social behavior (elephants comforting a friend, a wolf's "let's play" bow).</li>
    <li><b>Social skills taught through short stories.</b> Each question is a short everyday situation. Every choice explains how it would make others feel and what the "hidden rule" is. She is not asked to pretend or change who she is; other people's thinking is made clear so she can choose.</li>
    <li><b>Tools for regulating feelings.</b> Tap 🫧 anytime for the Calm Corner: bubble breathing or 5-4-3-2-1. 🌙 Calm mode turns off confetti and most animation and makes sounds softer.</li>
   </ul></section>
  <section><h2>Worksheet analysis (September 2026)</h2>
   <div class="tbl"><table><tr><th>Worksheet</th><th>Result</th></tr>
    <tr><td>Punctuation . ! ?</td><td><span class="tag good">13/13 correct</span></td></tr>
    <tr><td>Circle the verbs</td><td><span class="tag good">5/5 correct</span></td></tr>
    <tr><td>Camping proofreading</td><td><span class="tag good">Very good</span> Found the lowercase i, both "whent", "hade", the missing period, and the capital in "Swimming"</td></tr>
    <tr><td>Nouns Review</td><td><span class="tag warn">Missed 1</span> Did not mark "hair"</td></tr>
    <tr><td>Adjective Review</td><td><span class="tag warn">4 extra</span> Also circled tree, butterfly, flower and bus as adjectives</td></tr>
    <tr><td>Find the -ly Adverbs</td><td><span class="tag warn">Circled only "ly"</span> Found every -ly word but circled just the ending; several verb underlines were under the adverb instead of the verb</td></tr>
   </table></div>
   <h3>Math homework</h3>
   <div class="tbl"><table><tr><th>Worksheet</th><th>Result</th></tr>
    <tr><td>Write and solve an equation (balance scales)</td><td><span class="tag good">4/4 correct</span> In (c) she wrote an extra "=" at the end of a line (13 + 7 = 3 + x + 4 =), a sign she reads "=" as "now work it out" rather than "both sides are the same". Problem (d) (85 + 8 = 55 + x + 28) took many erasures; she found x by trying 83 + 13 and 83 + 10 instead of subtracting</td></tr>
    <tr><td>Connect expressions with the same value</td><td><span class="tag warn">Unclear</span> Subtracting a bracket, e.g. 83 − (21 − 9) = 83 − 21 + 9, is an abstract rule. The lines in the photo are hard to read, and one line in a different pen looks like a correction</td></tr>
    <tr><td>Expanded form (675 = 600 + 70 + 5)</td><td><span class="tag good">Correct</span></td></tr>
    <tr><td>Equal groups (4 + 4 + 4 = 3 · 4)</td><td><span class="tag good">Correct</span></td></tr>
    <tr><td>Word problems (flowers, gifts, goody bags)</td><td><span class="tag good">All correct</span> The key numbers were circled and "same" was underlined, which looks like adult help. Turning words into math is the hard step, not the arithmetic</td></tr>
   </table></div>
   <h3>How the Number Lab makes abstract math visual</h3>
   <ul><li><b>"=" as a balance.</b> Say "is the same as" instead of "equals". One "=" per line, never at the end of a line. True/false questions ("7 = 7", "3 + 4 = 7 + 2") fix the "the answer comes next" idea.</li>
   <li><b>Concrete first.</b> A real scale (or a coat hanger with two cups), blocks, and a paper bag as the "mystery bag": take the same off both sides and it stays balanced.</li>
   <li><b>Bar models.</b> The whole bar and its parts turn "93 = 55 + x + 28" into a picture: missing part = whole − known parts. Her count-up strategy (83 → 93 is 10) is a real method too.</li>
   <li><b>Word problems in four fixed steps:</b> circle the numbers → pick what is happening (put together, take away, equal groups, share equally, compare) from pictures → pick the number sentence → solve. Keyword tricks are avoided on purpose: "in total" in the goody-bag problem actually means divide.</li>
   <li><b>Always check.</b> Put the answer back in: do both sides match? This makes "=" concrete and lets her check her own work.</li></ul></section>
  <section><h2>Learning plan</h2>
   <p>3 levels a day (one from each lab), about 15 to 20 minutes total, in the order shown on the home page. Each lab unlocks in order. Once a lab is finished, the daily plan picks the level with the fewest stars for review. Today's plan: ${t.plan.map(id=>MISS[id].name).join(' → ')}.</p>
   <h3>📚 Word Lab (10 levels)</h3>${planTable(WORLDS.w)}
   <h3>🔢 Number Lab (13 levels)</h3>${planTable(WORLDS.m)}
   <h3>🤝 People Lab (8 levels)</h3>${planTable(WORLDS.s)}
   <h3>Tips for parents</h3>
   <ul><li>Talk about People Lab topics in daily life, for example: "Did you have a problem today? What size was it?" Practice in real situations is what makes these skills stick.</li>
   <li>The "Bonus mission" on the results page needs a grown-up. Tap the button when it is done for 3 extra stars.</li>
   <li>Praise specific effort ("You used the 'the ___ rock' test!") rather than just "Great job."</li>
   <li>Send photos of new homework or quizzes to Claude to add them to the question banks.</li></ul></section>
  <section><h2>Progress</h2>
   <p>Total stars: <b>${S.stars}</b> ⭐ · Day streak: <b>${streak()}</b> · Completed: Words <b>${doneCount('w')}/10</b>, Math <b>${doneCount('m')}/${WORLDS.m.missions.length}</b>, People <b>${doneCount('s')}/8</b></p>
   <h3>Mistakes to review (higher count = more practice needed)</h3><div class="mchips">${mk}</div>
   <h3>Recent activity</h3><ul>${recent}</ul>
   <h3>Saving and backup</h3>
   <p>Progress saves automatically in Safari on this iPad. In Safari, tap Share → Add to Home Screen, and open the app from the home screen icon from then on. To move to another device, or just to be safe, copy the backup code below and keep it somewhere.</p>
   <textarea id="bkOut" readonly>${backupCode()}</textarea>
   <div class="btnrow" style="margin-top:8px"><button class="ghost" id="bkCopy">Copy backup code</button></div>
   <p style="margin-top:12px">To restore progress, paste a backup code below and tap Restore.</p>
   <textarea id="bkIn" placeholder="Paste backup code"></textarea>
   <div class="btnrow" style="margin-top:8px"><button class="ghost" id="bkLoad">Restore</button><span id="bkMsg"></span></div>
   <h3>Reset</h3>
   <div class="btnrow" id="resetRow"><button class="ghost" id="resetBtn">Erase all progress</button></div></section></div>`;
  $('#bkCopy').onclick=()=>{const tx=$('#bkOut');tx.select();(navigator.clipboard?navigator.clipboard.writeText(tx.value):Promise.reject()).then(()=>{$('#bkCopy').textContent='Copied ✓'},()=>{try{document.execCommand('copy');$('#bkCopy').textContent='Copied ✓'}catch(e){}})};
  $('#bkLoad').onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($('#bkIn').value.trim()))));if(!o||o.v!==2)throw 0;S=migrate(Object.assign(fresh(),o));save();refreshChips();renderParent();$('#bkMsg').textContent='Restored ✓'}catch(e){$('#bkMsg').textContent='That backup code did not work. Copy the whole code and try again.'}};
  $('#resetBtn').onclick=()=>{$('#resetRow').innerHTML='<span>Erase all stars and progress?</span><button class="ghost" id="rsYes" style="border-color:var(--coral)">Erase</button><button class="ghost" id="rsNo">Cancel</button>';
    $('#rsYes').onclick=()=>{S=fresh();save();refreshChips();renderParent()};$('#rsNo').onclick=renderParent};
}

/* ================= START ================= */
(function sky(){const s=$('#sky');for(let i=0;i<60;i++){const d=document.createElement('i');const z=Math.random()*2.2+.8;d.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${z}px;height:${z}px;animation-delay:${(Math.random()*3).toFixed(2)}s`;s.appendChild(d)}})();
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>show(b.dataset.nav));
$('#soundBtn').onclick=()=>{S.sound=!S.sound;save();refreshChips()};
$('#calmBtn').onclick=()=>{S.calm=!S.calm;save();refreshChips()};
$('#calmTop').onclick=openCalm;
$('#quit').onclick=()=>show('home');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#overlay').hidden)closeSheet()});
if(window.speechSynthesis)try{speechSynthesis.getVoices()}catch(e){}
save();show('home');
