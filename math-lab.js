/* Number Lab extras: equations (balance scale), bar models, equal groups and word problems.
   Built from Stella's math homework (balance-scale equations, "write and solve", multiplication as
   equal groups, and multi-step word problems). Loaded before app.js and uses its helpers at run time.
   Everything goes picture first: scale, bars or groups, then the number sentence. */

/* ---------------- word problems ----------------
   type: join | take | groups | share | compare
   eq: the matching number sentence. wrong: other sentences. pic: what to draw after step 2. */
const STORIES=[
 {t:'8 grandchildren came to the party. Each child brought 2 gifts. How many gifts did Grandpa get?',type:'groups',eq:'8 × 2',ans:16,unit:'gifts',wrong:['8 + 2','8 − 2','8 ÷ 2'],pic:{n:8,each:2,e:'🎁'}},
 {t:'Grandpa had 80 treats in total. He put the same number in each of 8 goody bags. How many treats are in each bag?',type:'share',eq:'80 ÷ 8',ans:10,unit:'treats',wrong:['80 × 8','80 − 8','80 + 8'],pic:{total:80,n:8}},
 {t:'Michael picked 30 orange flowers and 22 yellow flowers. He shared them equally between his 2 sisters. How many flowers does each sister get?',type:'share',eq:'(30 + 22) ÷ 2',ans:26,unit:'flowers',wrong:['30 + 22','30 + 22 + 2','30 − 22'],pic:{total:52,n:2}},
 {t:'A spider has 8 legs. How many legs do 3 spiders have?',type:'groups',eq:'3 × 8',ans:24,unit:'legs',wrong:['3 + 8','8 − 3','8 ÷ 2'],pic:{n:3,each:8,e:'🦵'}},
 {t:'A beetle has 6 legs. 4 beetles sit on a log. How many legs are there?',type:'groups',eq:'4 × 6',ans:24,unit:'legs',wrong:['4 + 6','6 − 4','6 + 6'],pic:{n:4,each:6,e:'🦵'}},
 {t:'Stella found 45 shells. She gave 12 shells to her friend. How many shells does Stella have now?',type:'take',eq:'45 − 12',ans:33,unit:'shells',wrong:['45 + 12','12 − 45','45 × 12'],pic:{a:45,b:12}},
 {t:'There were 26 ducks on the pond. Then 17 more ducks landed. How many ducks are on the pond now?',type:'join',eq:'26 + 17',ans:43,unit:'ducks',wrong:['26 − 17','26 × 17','17 − 6'],pic:{a:26,b:17}},
 {t:'20 seeds are planted in 4 pots. Each pot gets the same number of seeds. How many seeds go in each pot?',type:'share',eq:'20 ÷ 4',ans:5,unit:'seeds',wrong:['20 × 4','20 − 4','20 + 4'],pic:{total:20,n:4,e:'🌱'}},
 {t:'A giraffe is 5 meters tall. A zebra is 2 meters tall. How much taller is the giraffe?',type:'compare',eq:'5 − 2',ans:3,unit:'meters',wrong:['5 + 2','5 × 2','2 − 5'],pic:{a:5,b:2,na:'giraffe',nb:'zebra'}},
 {t:'5 octopuses swim by. Each octopus has 8 arms. How many arms is that in total?',type:'groups',eq:'5 × 8',ans:40,unit:'arms',wrong:['5 + 8','8 − 5','8 ÷ 5'],pic:{n:5,each:8,e:'🐙'}},
 {t:'The class has 24 magnifying glasses. They are shared equally by 6 tables. How many does each table get?',type:'share',eq:'24 ÷ 6',ans:4,unit:'magnifying glasses',wrong:['24 × 6','24 − 6','24 + 6'],pic:{total:24,n:6,e:'🔍'}},
 {t:'A sea star has 5 arms. How many arms do 6 sea stars have?',type:'groups',eq:'6 × 5',ans:30,unit:'arms',wrong:['6 + 5','6 − 5','5 − 6'],pic:{n:6,each:5,e:'⭐'}},
 {t:'Stella read 18 pages about volcanoes on Monday and 25 pages on Tuesday. How many pages did she read in total?',type:'join',eq:'18 + 25',ans:43,unit:'pages',wrong:['25 − 18','18 × 25','25 ÷ 18'],pic:{a:18,b:25}},
 {t:'The bird feeder had 50 seeds. The birds ate 35 seeds. How many seeds are left?',type:'take',eq:'50 − 35',ans:15,unit:'seeds',wrong:['50 + 35','35 − 50','50 × 35'],pic:{a:50,b:35}},
 {t:'A bird has 2 wings. 9 birds sit on a wire. How many wings are there?',type:'groups',eq:'9 × 2',ans:18,unit:'wings',wrong:['9 + 2','9 − 2','9 ÷ 2'],pic:{n:9,each:2,e:'🪶'}},
 {t:'A hen laid 12 eggs. She put the same number of eggs in 3 nests. How many eggs are in each nest?',type:'share',eq:'12 ÷ 3',ans:4,unit:'eggs',wrong:['12 × 3','12 − 3','12 + 3'],pic:{total:12,n:3,e:'🥚'}},
 {t:'Mia has 34 rocks. Stella has 51 rocks. How many more rocks does Stella have than Mia?',type:'compare',eq:'51 − 34',ans:17,unit:'rocks',wrong:['51 + 34','34 − 51','51 × 34'],pic:{a:51,b:34,na:'Stella',nb:'Mia'}},
 {t:'A scientist had 60 test tubes. She broke 7 of them. How many test tubes does she have now?',type:'take',eq:'60 − 7',ans:53,unit:'test tubes',wrong:['60 + 7','60 × 7','7 − 60'],pic:{a:60,b:7}},
 {t:'There are 3 fish tanks. Each tank has 7 fish. How many fish are there altogether?',type:'groups',eq:'3 × 7',ans:21,unit:'fish',wrong:['3 + 7','7 − 3','7 ÷ 3'],pic:{n:3,each:7,e:'🐟'}},
 {t:'The zoo has 35 penguins and 28 seals. How many animals is that altogether?',type:'join',eq:'35 + 28',ans:63,unit:'animals',wrong:['35 − 28','35 × 28','28 − 5'],pic:{a:35,b:28}}
];
const STORY_TYPES={ // [icon, name, what it looks like, question to ask yourself]
 join:['➕','Put together','Two groups join into one bigger group.','Are two groups put together into one?'],
 take:['➖','Take away','Some things go away, get used up or are given away.','Does something go away or get used up?'],
 groups:['✖️','Equal groups','Several groups, and every group has the same number.','Are there groups that each have the same number?'],
 share:['➗','Share equally','A total is split into groups that are all the same size.','Is a total being split into equal parts?'],
 compare:['↔️','Compare','Two amounts side by side. How many more? How much taller?','Are we finding how many more one has than the other?']
};
const stName=k=>STORY_TYPES[k][0]+' '+STORY_TYPES[k][1];

/* ---------------- small drawing helpers ---------------- */
const sumOf=a=>a.reduce((s,v)=>s+(typeof v==='number'?v:0),0);
// One bar made of parts. parts: [{v:number (width), label, cls}]
function barHTML(total,parts,topLabel){
  return`<div class="barm">${topLabel!==null?`<div class="whole"><span>${topLabel??total}</span></div>`:''}<div class="parts">${parts.map(p=>`<div class="part ${p.cls||''}" style="flex:${Math.max(p.v,total*.08)}"><span>${p.label??p.v}</span></div>`).join('')}</div></div>`;
}
function groupsHTML(n,each,e){return`<div class="groups">${times(n,()=>`<div class="grp"><span class="gi">${e.repeat(each)}</span><b>${each}</b></div>`).join('')}</div>`}

/* ---------------- balance scale ---------------- */
function scaleSVG(){
  const pan=c=>`<g class="pan ${c}"><line x1="0" y1="0" x2="0" y2="-32" stroke="#e0602a" stroke-width="5"/><rect x="-100" y="-44" width="200" height="12" rx="6" fill="#b9e08f" stroke="#10222c" stroke-width="2"/><g class="its"></g></g>`;
  return`<svg class="scale" viewBox="0 30 520 250" role="img" aria-label="balance scale"><path d="M260 160 L224 272 L296 272 Z" fill="#8fc46a" stroke="#10222c" stroke-width="2" stroke-linejoin="round"/><g class="bm"><rect x="66" y="154" width="388" height="12" rx="6" fill="#b9e08f" stroke="#10222c" stroke-width="2"/></g><circle cx="260" cy="160" r="7" fill="#e0602a" stroke="#10222c" stroke-width="2"/>${pan('pl')}${pan('pr')}</svg>`;
}
function itemSVG(v,cx,side,o){
  const tap=o.tap&&o.tap[side]?' tapw':'';
  if(v==='x'){const lab=o.reveal!=null?o.reveal:'x';return`<g class="wt bag${tap}" data-side="${side}" data-v="x" transform="translate(${cx},-44)"><path d="M-25,0 Q-30,-30 -11,-40 L-15,-52 L15,-52 L11,-40 Q30,-30 25,0 Z" fill="${o.reveal!=null?'#ffe39a':'#e3d2ad'}" stroke="#10222c" stroke-width="2" stroke-linejoin="round"/><path d="M-12,-41 L12,-41" stroke="#b0412e" stroke-width="4" stroke-linecap="round"/><text y="-12" text-anchor="middle" font-size="${String(lab).length>2?16:21}" font-weight="700" font-style="${o.reveal!=null?'normal':'italic'}" fill="#10222c" font-family="Andika,sans-serif">${lab}</text></g>`}
  if(v==='?')return`<g class="wt" data-side="${side}" data-v="?" transform="translate(${cx},-44)"><rect x="-24" y="-46" width="48" height="46" rx="8" fill="none" stroke="#ffe39a" stroke-width="3" stroke-dasharray="6 4"/><text y="-15" text-anchor="middle" font-size="22" font-weight="700" fill="#ffe39a" font-family="Andika,sans-serif">${o.fill!=null?o.fill:'?'}</text></g>`;
  return`<g class="wt${tap}" data-side="${side}" data-v="${v}" transform="translate(${cx},-44)"><path d="M-9,-44 a9,9 0 0 1 18,0" fill="none" stroke="#2466c9" stroke-width="6"/><path d="M-25,0 L-21,-44 L21,-44 L25,0 Z" fill="#2466c9" stroke="#10222c" stroke-width="2" stroke-linejoin="round"/><text y="-15" text-anchor="middle" font-size="${String(v).length>2?16:20}" font-weight="700" fill="#fff" font-family="Andika,sans-serif">${v}</text></g>`;
}
// L and R hold numbers, 'x' (mystery bag) or '?' (blank). xv = what is really in the bag.
function drawScale(svg,L,R,xv,o={}){
  const w=v=>v==='x'?xv:v==='?'?(o.fillv||0):v;
  const diff=L.reduce((s,v)=>s+w(v),0)-R.reduce((s,v)=>s+w(v),0);
  const a=o.level||diff===0?0:(diff>0?-7:7),t=a*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
  svg.querySelector('.bm').style.transform=`rotate(${a}deg)`;
  const place=(g,x,y,items,side)=>{g.style.transform=`translate(${x}px,${y}px)`;const n=items.length,W=n*54+(n-1)*4;
    g.querySelector('.its').innerHTML=items.map((v,i)=>itemSVG(v,-W/2+27+i*58,side,o)).join('')};
  place(svg.querySelector('.pl'),260-190*c,160-190*s,L,'L');
  place(svg.querySelector('.pr'),260+190*c,160+190*s,R,'R');
  return diff;
}
const sideStr=a=>a.map(v=>v==='x'?'<b class="xv">x</b>':v==='?'?'<span class="blank sm">?</span>':v).join(' + ');

/* ---------------- generators ---------------- */
// Is it balanced? Tackles the idea that "=" means "the answer comes next".
function genTF(){
  const v=rnd(5);let L,R,note='';
  if(v===0){const a=between(3,30),b=between(2,20),c=a+b,f=rnd(2)?c:c+pick([1,2,-1,10]);L=[a,b];R=[f]}
  else if(v===1){const a=between(3,30),b=between(2,20),c=a+b,f=rnd(2)?c:c+pick([1,-1,2]);L=[f];R=[a,b];note='The answer can be on the left side, too.'}
  else if(v===2){const a=between(3,15),b=between(2,15),s=a+b,c=between(1,s-1),d=rnd(2)?s-c:s-c+pick([1,-1,2]);L=[a,b];R=[c,Math.max(1,d)]}
  else if(v===3){const a=between(2,9),b=between(2,9),d=between(2,9);L=[a,b];R=[a+b,d];note='The = sign does not mean "the answer comes next". It means both sides are the same.'}
  else{const a=between(4,40);L=[a];R=[a];note='A number is always the same as itself.'}
  const lv=sumOf(L),rv=sumOf(R),ok=lv===rv;
  const r=mkChoice('mt:tf','Is this true? Do both sides weigh the same?',`<div class="tfbox">${L.join(' + ')} <b>=</b> ${R.join(' + ')}</div>${scaleSVG()}`,
    ok?'✓ True: it balances':'✗ False: it tips',[ok?'✗ False: it tips':'✓ True: it balances'],
    {fixed:true,explain:`Left side: ${L.join(' + ')}${L.length>1?' = '+lv:''}. Right side: ${R.join(' + ')}${R.length>1?' = '+rv:''}. ${ok?'The same, so it balances.':'Not the same, so it tips.'} ${note}`,
     hint:'1. Work out the left side.<br>2. Work out the right side.<br>3. Are they the same number? Then it balances.'});
  r.opts=[{t:'✓ True: it balances',ok:ok},{t:'✗ False: it tips',ok:!ok}];
  r.onShow=st=>drawScale(st.querySelector('.scale'),L,R,0,{level:true});
  r.onDone=st=>drawScale(st.querySelector('.scale'),L,R,0);
  return r;
}
// Fill the blank so the scale balances: 7 + 5 = __ + 4
function genMissing(){
  const a=between(3,20),b=between(2,15),c=between(1,a+b-1),ans=a+b-c,blankLeft=rnd(4)===0;
  const L=blankLeft?['?',c]:[a,b],R=blankLeft?[a,b]:(rnd(2)?['?',c]:[c,'?']);
  const r=mkChoice('mt:miss','What number makes the scale balance?',`<div class="tfbox">${sideStr(L)} <b>=</b> ${sideStr(R)}</div>${scaleSVG()}`,ans,
    [[a+b,`${a+b} is the total of ${a} + ${b}. But the other side already has ${c}, so the blank must be smaller.`],[a+b+c,'Adding every number makes that side too heavy.'],ans+1],
    {hint:`1. The full side weighs ${a} + ${b} = ${a+b}.<br>2. The other side already has ${c}.<br>3. What goes with ${c} to make ${a+b}? Count up from ${c}.`,explain:`${a} + ${b} = ${a+b}, and ${ans} + ${c} = ${a+b}. Both sides weigh ${a+b}.`});
  r.onShow=st=>drawScale(st.querySelector('.scale'),L,R,0,{level:true});
  r.onDone=st=>drawScale(st.querySelector('.scale'),L,R,0,{fillv:ans,fill:ans});
  return r;
}
// Interactive mystery-bag scale, like her "Write and solve an equation" page.
// level 0: 2 + x = 11 style, 1: 3 + x + 5 = 19 / 13 + 7 = 3 + x + 4, 2: 85 + 8 = 55 + x + 28.
function genBalance(level=rnd(3)){
  for(;;){
    const big=level===2,xv=big?between(5,40):between(2,15);
    const xk=level===0?[between(2,9)]:level===1?times(between(1,2),()=>between(2,9)):[between(10,60),between(5,30)];
    const T=xv+sumOf(xk);if(T>99)continue;
    const on=level===0?1:level===1?between(1,2):between(1,2);
    let os=[T];if(on===2){const a=between(Math.max(2,Math.round(T*.5)),T-2);os=[a,T-a]}
    const xs=xk.length===2?[xk[0],'x',xk[1]]:(rnd(2)?[xk[0],'x']:['x',xk[0]]);
    const xLeft=rnd(3)===0;
    return{type:'balance',key:'mt:bal',L:xLeft?xs:os,R:xLeft?os:xs,xv};
  }
}
const BAR_T=[
 (W,a,b)=>`Stella has ${W} rocks. ${a} are gray${b?` and ${b} are white`:''}. The rest are sparkly. How many sparkly rocks does she have?`,
 (W,a,b)=>`There are ${W} birds at the feeder. ${a} are robins${b?` and ${b} are sparrows`:''}. The rest are blue jays. How many blue jays are there?`,
 (W,a,b)=>`A scientist counted ${W} fish. ${a} were orange${b?` and ${b} were striped`:''}. The rest were silver. How many fish were silver?`,
 (W,a,b)=>`The bar is ${W} long. The parts you know are ${a}${b?` and ${b}`:''}. What is x?`
];
function genBarM(W,known){
  if(!W){known=rnd(2)?[between(10,50)]:[between(10,45),between(5,30)];W=sumOf(known)+between(5,40);if(W>99)return genBarM()}
  const x=W-sumOf(known),k2=known.length===2,parts=k2?[{v:known[0]},{v:x,label:'x',cls:'px'},{v:known[1]}]:[{v:known[0]},{v:x,label:'x',cls:'px'}];
  const txt=pick(BAR_T)(W,known[0],known[1]);
  return mkChoice('mt:bar',txt,barHTML(W,parts),x,[[W,`${W} is the whole bar. x is only one part of it.`],k2?[sumOf(known),`${sumOf(known)} is the parts you know added together. x is what is left.`]:null,[W+sumOf(known),'x is a part, so it must be smaller than the whole.'],x+10].filter(Boolean),
    {hint:k2?`1. Add the parts you know: ${known[0]} + ${known[1]} = ${sumOf(known)}.<br>2. Whole minus that: ${W} − ${sumOf(known)} = x.<br>Or count up from ${sumOf(known)} to ${W}.`:`Whole minus the part you know: ${W} − ${known[0]} = x.<br>Or count up from ${known[0]} to ${W}.`,
     explain:`${W} = ${k2?`${known[0]} + x + ${known[1]}`:`${known[0]} + x`}. ${k2?`${known[0]} + ${known[1]} = ${sumOf(known)}. `:''}${W} − ${sumOf(known)} = ${x}, so x = ${x}.`});
}
const GROUP_T=[['🦒','giraffes','wears','boots',4],['🕷️','spiders','has','legs',8],['🐦','birds','has','wings',2],['⭐','sea stars','has','arms',5],['🐞','ladybugs','has','legs',6],['🐙','octopuses','has','arms',8]];
function genGroups(){
  const v=rnd(4);
  if(v===0){const[e,name,verb,part,each]=pick(GROUP_T),n=between(2,5),ans=n*each,add=times(n,()=>each).join(' + ');
    return mkChoice('mt:grp',`${n} ${name}. Each one ${verb} ${each} ${part}. How many ${part}?`,`${groupsHTML(n,each,e)}<div class="eq sm">${add} = ${n} × ${each} = <span class="blank">?</span></div>`,ans,[n+each,ans+each,ans-each,ans+1],
      {hint:`Count by ${each}s: ${times(n,i=>each*(i+1)).join(', ')}.<br>${n} × ${each} means ${n} groups of ${each}. (Your book may write it as ${n} · ${each}.)`,explain:`${add} = ${ans}. So ${n} × ${each} = ${ans} ${part}.`});}
  if(v===1){const r=between(2,5),c=between(2,6),ans=r*c;
    const grid=`<div class="arr" style="grid-template-columns:repeat(${c},auto)">${'<span>🌰</span>'.repeat(ans)}</div>`;
    return mkChoice('mt:grp',`How many acorns? There are ${r} rows. Each row has ${c}.`,`${grid}<div class="eq sm">${r} × ${c} = <span class="blank">?</span></div>`,ans,[r+c,ans+c,ans-1,ans+r],
      {hint:`Count by ${c}s, one row at a time: ${times(r,i=>c*(i+1)).join(', ')}.`,explain:`${r} rows of ${c}: ${times(r,()=>c).join(' + ')} = ${ans}. So ${r} × ${c} = ${ans}.`});}
  if(v===2){const k=between(2,5),m=between(2,6),total=k*m,[e,thing,box]=pick([['🌱','seeds','pots'],['🥚','eggs','nests'],['🌰','acorns','squirrels'],['🐚','shells','buckets']]);
    const r=mkChoice('mt:grp',`${total} ${thing} are shared equally into ${k} ${box}. How many ${thing} in each?`,`<div class="emoline">${e.repeat(total)}</div><div class="eq sm">${total} ÷ ${k} = <span class="blank">?</span></div><div class="dealt"></div>`,m,[total-k,total+k,k,m+1],
      {hint:`Deal them out one at a time, like cards, into ${k} ${box}. Or ask: ${k} × what = ${total}?`,explain:`${total} ÷ ${k} = ${m}. Check: ${k} × ${m} = ${total}.`});
    r.onDone=st=>{const d=st.querySelector('.dealt');if(d)d.innerHTML=groupsHTML(k,m,e)};return r;}
  const each=between(2,6),n=between(3,5),add=times(n,()=>each).join(' + ');
  return mkChoice('mt:grp',`Which is the same as ${add}?`,`<div class="eq sm">${add}</div>`,`${n} × ${each}`,[[`${n} + ${each}`,`That adds just two numbers. We have ${n} groups of ${each}.`],[`${each} × ${each}`,`Count the groups: there are ${n}, not ${each}.`],[`${n+1} × ${each}`,`Count the ${each}s again: there are ${n}.`]],
    {hint:`Count how many times ${each} is added. That is the number of groups.`,explain:`${each} is added ${n} times, so it is ${n} groups of ${each}: ${n} × ${each} = ${n*each}.`});
}
function genStoryRound(i){return{type:'story',key:'mt:story',idx:i==null?rnd(STORIES.length):i}}

/* ---------------- story picture ---------------- */
function storyPic(s){
  const p=s.pic;
  if(s.type==='groups')return p.n*p.each<=48?groupsHTML(p.n,p.each,p.e):barHTML(p.n*p.each,times(p.n,()=>({v:p.each})),'?');
  if(s.type==='share')return p.total<=30&&p.e?`<div class="emoline">${p.e.repeat(p.total)}</div><div class="shareto">➡️ ${times(p.n,()=>'<span class="box">?</span>').join('')}</div>`:barHTML(p.total,times(p.n,()=>({v:1,label:'?'})),p.total);
  if(s.type==='join')return barHTML(p.a+p.b,[{v:p.a},{v:p.b,cls:'p2'}],'?');
  if(s.type==='take')return barHTML(p.a,[{v:p.a-p.b,label:'?',cls:'px'},{v:p.b,cls:'gone'}],p.a);
  const mx=Math.max(p.a,p.b);
  return`<div class="cmpbars"><div><small>${p.na}</small><div class="barline" style="width:${p.a/mx*100}%"><span>${p.a}</span></div></div><div><small>${p.nb}</small><div class="barline b2" style="width:${p.b/mx*100}%"><span>${p.b}</span></div><div class="diff" style="width:${(p.a-p.b)/mx*100}%"><span>?</span></div></div></div>`;
}

/* ---------------- renderers ---------------- */
// Mystery bag: 1) add up each side, 2) take the same off both sides, 3) open the bag and check.
function rBalance(r,st){
  const B={L:r.L.slice(),R:r.R.slice()},xs=r.L.includes('x')?'L':'R',os=xs==='L'?'R':'L';
  const known=s=>B[s].filter(v=>v!=='x');
  const box=el('div','scalebox',scaleSVG());st.appendChild(box);const svg=box.firstChild;
  const log=el('div','eqlog');st.appendChild(log);
  const ctrl=el('div','btnrow scalectl');st.appendChild(ctrl);
  const eq=()=>`${sideStr(B.L)} = ${sideStr(B.R)}`;
  const addLog=(t,note)=>log.appendChild(el('div','eqline',`<span>${t}</span>${note?`<small>${note}</small>`:''}`));
  let onTap=null,tries=0;
  svg.addEventListener('click',e=>{const g=e.target.closest('.wt');if(g&&onTap)onTap(g.dataset.side,g.dataset.v)});
  const draw=o=>drawScale(svg,B.L,B.R,r.xv,o);
  draw();addLog(eq(),'What the scale shows');
  const say=t=>setPrompt(t,strip(t));
  function combine(){
    ctrl.innerHTML='';const sides=['L','R'].filter(s=>known(s).length>1);
    if(!sides.length)return remove();
    say('Step 1 of 3: Add up the weights you know on each side.');
    sides.forEach(s=>{const ks=known(s),b=el('button','big',`${ks.join(' + ')} = ?`);
      b.onclick=()=>{const t=sumOf(ks);B[s]=B[s].includes('x')?(B[s].indexOf('x')===0?['x',t]:[t,'x']):[t];SFX.tap();draw();addLog(eq(),`${ks.join(' + ')} = ${t}`);combine()};
      ctrl.appendChild(b)});
  }
  function remove(){
    ctrl.innerHTML='';const k=known(xs)[0],T=known(os)[0];
    say(`Step 2 of 3: Take ${k} off the side with the mystery bag. Tap the ${k} weight.`);
    draw({tap:{[xs]:true}});
    onTap=(side,v)=>{
      if(v==='x'){$('#hint').textContent='The mystery bag stays. Tap the weight next to it.';return}
      if(side!==xs){$('#hint').textContent='Start with the side that has the mystery bag.';return}
      B[xs]=['x'];SFX.tap();draw({tap:{[os]:true}});$('#hint').textContent='';
      say(`The scale tipped! To keep it balanced, take ${k} off the other side too. Tap the ${T} weight.`);
      onTap=(s2,v2)=>{
        if(s2!==os){$('#hint').textContent=`Now tap the ${T} weight on the other side.`;return}
        onTap=null;B[os]=[T-k];SFX.good();draw();$('#hint').textContent='';
        addLog(eq(),`Take ${k} off both sides: ${T} − ${k} = ${T-k}`);answer(T,k)};
    };
  }
  function answer(T,k){
    say('Step 3 of 3: What is in the mystery bag?');
    const opts=shuffle([...new Set([r.xv,T,k,T+k,r.xv+1])].slice(0,4));
    const row=el('div','choices');ctrl.appendChild(row);
    const check=()=>{const w=a=>a.map(v=>v==='x'?r.xv:v);return`Check: ${w(r.L).join(' + ')} = ${w(r.R).join(' + ')} → ${sumOf(w(r.L))} = ${sumOf(w(r.R))} ✓`};
    const done=(ok,fixed)=>{st.classList.add('locked');draw({reveal:r.xv});addLog(`x = ${r.xv}`,check());
      finish(ok,[`The bag holds ${r.xv}. ${check()}`],null,fixed)};
    opts.forEach(o=>{const b=el('button','choice',String(o));b.onclick=()=>{
      if(o===r.xv){b.classList.add('right');R.cur.err?addMistake(r.key):clearMistake(r.key);done(!R.cur.err,R.cur.err);return}
      R.cur.err=true;tries++;b.classList.add('wrong');b.disabled=true;SFX.bad();
      if(tries>=2){[...row.children].find(x=>x.textContent===String(r.xv)).classList.add('right');addMistake(r.key);done(false,false);return}
      $('#hint').textContent=`Look at the scale now: the bag balances the ${T-k} weight.`};row.appendChild(b)});
  }
  combine();
}
// Word problem detective: 1) circle the numbers, 2) what is happening, 3) number sentence, 4) answer.
function rStory(r,st){
  const s=STORIES[r.idx];let revealed=false;
  const txt=el('div','story');
  txt.innerHTML=s.t.split(/(\d+)/).map(p=>/^\d+$/.test(p)?`<button class="num">${p}</button>`:esc(p)).join('');
  st.appendChild(txt);
  const pic=el('div','storypic');st.appendChild(pic);
  const log=el('div','eqlog');st.appendChild(log);
  const area=el('div','storyarea');st.appendChild(area);
  const nums=[...txt.querySelectorAll('.num')];
  setPrompt('Step 1 of 4: Tap every number in the story.',s.t);
  nums.forEach(b=>b.onclick=()=>{if(b.classList.contains('circled'))return;b.classList.add('circled');SFX.tap();
    if(nums.every(x=>x.classList.contains('circled'))){log.appendChild(el('div','eqline',`<span>Numbers: ${nums.map(x=>x.textContent).join(', ')}</span><small>These are the numbers we use</small>`));stepType()}});
  function ask(prompt,say,opts,onRight,wide){
    setPrompt(prompt,say);area.innerHTML='';let tries=0;
    const row=el('div','choices'+(wide?' wide':''));area.appendChild(row);
    opts.forEach(o=>{const b=el('button','choice',o.t);b.onclick=()=>{
      if(o.ok){b.classList.add('right');SFX.tap();$('#hint').textContent='';setTimeout(()=>onRight(o),S.calm?0:350);return}
      R.cur.err=true;tries++;b.classList.add('wrong');b.disabled=true;SFX.bad();
      if(tries>=2){revealed=true;row.querySelectorAll('.choice').forEach((x,i)=>{if(opts[i].ok)x.classList.add('right')});$('#hint').textContent='';setTimeout(()=>onRight(opts.find(x=>x.ok)),S.calm?300:900);return}
      $('#hint').innerHTML='🤔 '+(o.why||'Not this one.')+' Try again!'};row.appendChild(b)});
  }
  function stepType(){
    const types=shuffle([s.type].concat(take(Object.keys(STORY_TYPES).filter(k=>k!==s.type),3)));
    ask('Step 2 of 4: What is happening in the story?','What is happening in the story?',
      types.map(k=>({t:`${stName(k)}<small>${STORY_TYPES[k][2]}</small>`,ok:k===s.type,why:`${STORY_TYPES[k][3]} Not in this story.`})),
      ()=>{pic.innerHTML=`<div class="eyebrow">The picture</div>${storyPic(s)}`;log.appendChild(el('div','eqline',`<span>${stName(s.type)}</span><small>${STORY_TYPES[s.type][2]}</small>`));stepEq()},true);
  }
  function stepEq(){
    ask('Step 3 of 4: Which number sentence matches the picture?','Which number sentence matches the picture?',
      shuffle([{t:s.eq+' = ?',ok:true}].concat(s.wrong.map(w=>({t:w+' = ?',why:`That does not match the picture. This story is "${STORY_TYPES[s.type][1]}".`})))),
      ()=>{log.appendChild(el('div','eqline',`<span>${s.eq} = ?</span>`));stepAns()});
  }
  function stepAns(){
    const wr=s.wrong.map(w=>{try{return Function('return '+w.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))()}catch(e){return null}}).filter(v=>Number.isInteger(v)&&v>=0&&v!==s.ans);
    const opts=shuffle([s.ans].concat([...new Set(wr)].slice(0,2),[s.ans+1]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4));
    ask('Step 4 of 4: What is the answer?','What is the answer?',opts.map(v=>({t:`${v} ${s.unit}`,ok:v===s.ans,why:'Work out the number sentence from step 3.'})),()=>{
      st.classList.add('locked');log.appendChild(el('div','eqline',`<span>${s.eq} = ${s.ans}</span><small>Answer: ${s.ans} ${s.unit}</small>`));
      R.cur.err?addMistake(r.key):clearMistake(r.key);
      finish(!R.cur.err,[`${stName(s.type)}: ${s.eq} = ${s.ans}. The answer is ${s.ans} ${s.unit}.`],null,R.cur.err&&!revealed)});
  }
}
