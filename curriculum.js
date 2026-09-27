/* Number Lab curriculum, K to Grade 4.
   Baseline: Singapore Math (concrete → pictorial → abstract, number bonds, making ten, bar models,
   part-whole and comparison models) and RSM (early algebra with unknowns and balance scales,
   expressions with brackets, comparing without calculating, patterns and logic puzzles).
   Levels: 0 = K, 1 = Grade 1, 2 = Grade 2, 3 = Grade 3, 4 = Grade 4.
   Which levels appear and how big the numbers are come from the child's profile (math level);
   the objects in pictures and stories come from the profile's interests.
   Loaded after math-lab.js and before app.js. */

/* ================= PROFILE ================= */
const GRADE_NAMES=['Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4'];
const INTERESTS={animals:['🐾','Animals'],space:['🚀','Space'],ocean:['🌊','Ocean'],dinos:['🦕','Dinosaurs'],rocks:['💎','Rocks & crystals'],bugs:['🐞','Plants & bugs'],weather:['⛅','Weather']};
const kidName=()=>(S.profile&&S.profile.name)||'Stella';
// Level for one mission: the profile's math level, nudged by how she did last time (±1 at most).
function lvFor(m){return Math.max(0,Math.min(4,(S.profile.math|0)+((S.adapt||{})[m.id]||0)))}

/* ================= THEMES (from interests) =================
   items: [emoji, plural, where they are, what "going away" looks like]
   parts: [emoji, plural, part, how many each one has]  (real counts)
   boxes: [emoji, plural container, singular container, things inside, emoji of thing] */
const THEMES={
 animals:{items:[['🐸','frogs','on the log','hopped away'],['🐦','birds','in the tree','flew away'],['🐧','penguins','on the ice','dove into the sea'],['🐜','ants','on the anthill','marched away'],['🦆','ducks','on the pond','flew away'],['🐿️','squirrels','in the park','ran up a tree']],
  parts:[['🕷️','spiders','legs',8],['🐦','birds','wings',2],['🐞','ladybugs','legs',6],['🦒','giraffes','legs',4],['🐕','dogs','legs',4]],
  boxes:[['🪺','nests','nest','eggs','🥚'],['🌳','trees','tree','birds','🐦'],['🕳️','burrows','burrow','rabbits','🐇']]},
 space:{items:[['🚀','rockets','on the launch pad','blasted off'],['☄️','comets','in the sky','zoomed away'],['🌟','stars','in the sky','hid behind clouds'],['👩‍🚀','astronauts','on the space station','flew home'],['🪨','moon rocks','in the lab','went to museums'],['🛰️','satellites','in orbit','were switched off']],
  parts:[['🚀','rockets','engines',3],['👩‍🚀','astronauts','boots',2],['⭐','star stickers','points',5]],
  boxes:[['🚀','rockets','rocket','astronauts','👩‍🚀'],['📦','boxes','box','moon rocks','🪨'],['🪐','planets','planet','moons','🌙']]},
 ocean:{items:[['🐚','shells','on the beach','washed away'],['🐟','fish','on the reef','swam away'],['🦀','crabs','on the rocks','scuttled away'],['🐬','dolphins','in the bay','swam away'],['🪼','jellyfish','in the water','drifted away']],
  parts:[['🐙','octopuses','arms',8],['⭐','sea stars','arms',5],['🦀','crabs','legs',10]],
  boxes:[['🪣','buckets','bucket','shells','🐚'],['🐠','tanks','tank','fish','🐟'],['🪸','tide pools','tide pool','sea stars','⭐']]},
 dinos:{items:[['🦕','dinosaurs','in the valley','stomped away'],['🦴','fossil bones','at the dig site','went to the museum'],['🥚','dinosaur eggs','in the nest','hatched'],['🦖','footprints','in the mud','washed away']],
  parts:[['🦕','dinosaurs','legs',4],['🦖','T. rexes','arms',2]],
  boxes:[['🪺','nests','nest','dinosaur eggs','🥚'],['📦','crates','crate','fossils','🦴']]},
 rocks:{items:[['💎','crystals','in the cave','were packed in boxes'],['🪨','rocks','in the collection','were given away'],['🐚','fossils','on the shelf','went to school']],
  parts:[['💎','quartz crystals','sides',6],['🎲','cubes','faces',6]],
  boxes:[['📦','boxes','box','crystals','💎'],['🧺','baskets','basket','rocks','🪨']]},
 bugs:{items:[['🐞','ladybugs','on the leaf','flew away'],['🐝','bees','on the flowers','buzzed away'],['🍂','leaves','on the branch','blew away'],['🐛','caterpillars','on the plant','crawled away'],['🌱','seeds','in the pot','were eaten by birds'],['🌻','sunflowers','in the garden','were picked']],
  parts:[['🐝','bees','wings',4],['🐞','ladybugs','legs',6],['🦋','butterflies','wings',4],['🌸','flowers','petals',5]],
  boxes:[['🪴','pots','pot','seeds','🌱'],['🌸','flowers','flower','bees','🐝'],['🍃','leaves','leaf','ladybugs','🐞']]},
 weather:{items:[['☁️','clouds','in the sky','floated away'],['❄️','snowflakes','on the window','melted'],['💧','raindrops','on the window','dried up']],
  parts:[['❄️','snowflakes','points',6],['⛄','snowmen','buttons',3]],
  boxes:[['☁️','clouds','cloud','raindrops','💧'],['🪣','buckets','bucket','snowballs','⚪']]}
};
function themeKeys(){const t=((S.profile&&S.profile.interests)||[]).filter(k=>THEMES[k]);return t.length?t:Object.keys(THEMES)}
const tItem=()=>pick(THEMES[pick(themeKeys())].items);
const tParts=()=>pick(THEMES[pick(themeKeys())].parts);
const tBox=()=>pick(THEMES[pick(themeKeys())].boxes);
function tEmojis(n){const all=[...new Set(themeKeys().flatMap(k=>THEMES[k].items.map(i=>i[0])))];return take(all.length>=n?all:all.concat(['🍎','🍌','🍇','🍓']),n)}
const FRIENDS=['Mia','Leo','Sam','Ava','Noah','Lily'];
const COLORS=['red','blue','green','yellow','orange','purple','spotted','striped'];

/* ================= number helpers ================= */
const PLACE=['ones','tens','hundreds','thousands'];
const digitsOf=n=>String(n).split('').map(Number);
function addPair(lv){
  if(lv<=0){const a=between(1,8);return[a,between(1,10-a)]}
  if(lv===1){const a=between(3,15);return[a,between(2,20-a)]}
  if(lv===2){const a=between(12,79);return[a,between(5,Math.min(60,99-a))]}
  if(lv===3){const a=between(120,799);return[a,between(50,Math.min(600,999-a))]}
  const a=between(1200,7999);return[a,between(300,Math.min(5000,9999-a))];
}
function subPair(lv){
  if(lv<=0){const a=between(3,10);return[a,between(1,a-1)]}
  if(lv===1){const a=between(11,20);return[a,between(2,Math.min(9,a-2))]}
  if(lv===2){const a=between(25,99);return[a,between(5,a-5)]}
  if(lv===3){const a=between(200,999);return[a,between(50,a-20)]}
  const a=between(2000,9999);return[a,between(300,a-100)];
}
function partialSums(a,b){const L=Math.max(String(a).length,String(b).length),rows=[];
  for(let p=L-1;p>=0;p--){const u=10**p,x=Math.floor(a/u)%10*u,y=Math.floor(b/u)%10*u;if(x||y)rows.push([x,y,x+y,PLACE[p]])}return rows}
function noCarry(a,b){const L=Math.max(String(a).length,String(b).length);let r=0;for(let p=0;p<L;p++){const u=10**p;r+=((Math.floor(a/u)%10+Math.floor(b/u)%10)%10)*u}return r}
function flipSub(a,b){const L=String(a).length;let r=0;for(let p=0;p<L;p++){const u=10**p;r+=Math.abs(Math.floor(a/u)%10-Math.floor(b/u)%10)*u}return r}
function addHint(a,b,lv){
  if(lv<=0)return`Start at ${a}. Count on ${b} more: ${times(b,i=>a+i+1).join(', ')}.`;
  if(a<10&&a+b>10){const need=10-a;return`Make a ten (Singapore method):<br>1. ${a} + ${need} = 10<br>2. ${b} − ${need} = ${b-need} is left<br>3. 10 + ${b-need} = ?`}
  const rows=partialSums(a,b);
  return rows.map((r,i)=>`${i+1}. Add the ${r[3]}: ${r[0]} + ${r[1]} = ${r[2]}`).join('<br>')+`<br>${rows.length+1}. Put them together: ${rows.map(r=>r[2]).join(' + ')} = ?`;
}
function subHint(a,b,lv){
  if(lv<=0)return`Start at ${a}. Count back ${b}: ${times(b,i=>a-i-1).join(', ')}.`;
  if(a>10&&a<20&&b<10&&a-b<10){const o=a-10;return`Take back to ten:<br>1. ${a} − ${o} = 10<br>2. ${b} − ${o} = ${b-o} more to take away<br>3. 10 − ${b-o} = ?`}
  let cur=a;const steps=[];digitsOf(b).forEach((d,i,arr)=>{const p=arr.length-1-i,v=d*10**p;if(v){steps.push(`${steps.length+1}. Take away the ${PLACE[p]}: ${cur} − ${v} = ${cur-v}`);cur-=v}});
  return steps.join('<br>');
}

/* ================= picture helpers ================= */
function tenFrame(n,col){return`<div class="tf10">${times(10,i=>`<i class="${i<n?'on '+(col||''):''}"></i>`).join('')}</div>`}
function bondSVG(W,a,b){
  const c=(x,y,v)=>{const q=v==='?';return`<circle cx="${x}" cy="${y}" r="40" fill="${q?'none':'#1b4254'}" stroke="${q?'#ffe39a':'#6cc6ff'}" stroke-width="4" ${q?'stroke-dasharray="7 5"':''}/><text x="${x}" y="${y+9}" text-anchor="middle" font-size="${String(v).length>3?20:26}" font-weight="700" fill="${q?'#ffe39a':'#fff8ea'}" font-family="Andika,sans-serif">${v}</text>`};
  return`<svg class="bond" viewBox="0 0 300 220" role="img" aria-label="number bond"><line x1="150" y1="60" x2="75" y2="160" stroke="#b5d3dc" stroke-width="4"/><line x1="150" y1="60" x2="225" y2="160" stroke="#b5d3dc" stroke-width="4"/>${c(150,52,W)}${c(75,166,a)}${c(225,166,b)}</svg>`;
}
function fracBar(n,k,col='#ffc94d'){return`<svg class="fbar" viewBox="0 0 404 64" role="img" aria-label="fraction bar">${times(n,i=>`<rect x="${2+i*400/n}" y="2" width="${400/n}" height="60" fill="${i<k?col:'#1b4254'}" stroke="#fff8ea" stroke-width="3"/>`).join('')}</svg>`}
function cmpBars(rows){const mx=Math.max(...rows.map(r=>r.v+(r.dv||0)));
  return`<div class="cmpbars">${rows.map((r,i)=>`<div><small>${esc(r.name)}</small><div class="barline ${i?'b2':''}" style="width:${r.v/mx*100}%"><span>${r.label??r.v}</span></div>${r.dv?`<div class="diff" style="width:${r.dv/mx*100}%"><span>${r.dl??r.dv}</span></div>`:''}</div>`).join('')}</div>`}
function blocksHTML(t,o){return`<div class="blocks">${times(t,()=>`<div class="ten">${'<i></i>'.repeat(10)}</div>`).join('')}<div class="ones">${times(o,()=>'<div class="one"></div>').join('')}</div></div>`}
function clockSVG(h,m){
  const hand=(deg,len,w,c)=>{const a=(deg-90)*Math.PI/180;return`<line x1="100" y1="100" x2="${(100+len*Math.cos(a)).toFixed(1)}" y2="${(100+len*Math.sin(a)).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`};
  let s=`<svg viewBox="0 0 200 200" class="clock" role="img" aria-label="clock"><circle cx="100" cy="100" r="92" fill="#fff8ea" stroke="#ffc94d" stroke-width="8"/>`;
  for(let i=0;i<60;i++){const a=(i*6-90)*Math.PI/180,r1=i%5?83:78;s+=`<line x1="${(100+r1*Math.cos(a)).toFixed(1)}" y1="${(100+r1*Math.sin(a)).toFixed(1)}" x2="${(100+87*Math.cos(a)).toFixed(1)}" y2="${(100+87*Math.sin(a)).toFixed(1)}" stroke="#10222c" stroke-width="${i%5?1:3}"/>`}
  for(let i=1;i<=12;i++){const a=(i*30-90)*Math.PI/180;s+=`<text x="${(100+63*Math.cos(a)).toFixed(1)}" y="${(100+63*Math.sin(a)+7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="700" fill="#10222c" font-family="Andika,sans-serif">${i}</text>`}
  return s+hand(((h%12)+m/60)*30,42,9,'#10222c')+hand(m*6,70,5,'#e0602a')+'<circle cx="100" cy="100" r="7" fill="#10222c"/></svg>';
}

/* ================= GENERATORS (all take the level) ================= */
// Singapore: part-part-whole number bonds.
function genBond(lv){
  let W,a;
  if(lv<=0){W=between(4,10);a=between(1,W-1)}else if(lv===1){W=between(11,20);a=between(2,W-2)}
  else if(lv===2){if(rnd(2)){W=100;a=10*between(1,9)}else{W=between(30,99);a=between(10,W-10)}}
  else{if(rnd(2)){W=1000;a=50*between(2,18)}else{W=between(200,999);a=between(50,W-50)}}
  const b=W-a,miss=rnd(3);
  const vis=bondSVG(miss===0?'?':W,miss===1?'?':a,miss===2?'?':b),ans=[W,a,b][miss];
  const hint=miss===0?`Part + part = whole.<br>${a} + ${b} = ?`:`Whole − the part you know = the missing part.<br>${W} − ${miss===1?b:a} = ?<br>Or count up from ${miss===1?b:a} to ${W}.`;
  return mkChoice('mt:bond',miss===0?'What is the whole?':'What is the missing part?',vis,ans,
    miss===0?[[Math.abs(a-b),'The whole is both parts put together, so it is bigger than each part.'],ans+1,ans-1,ans+10]:[[W+(miss===1?b:a),'A part is smaller than the whole. Take away, don\'t add.'],ans+1,ans-1,ans+10],
    {hint,explain:`${a} and ${b} make ${W}. ${a} + ${b} = ${W}.`});
}
// Singapore mental math: make a ten, or bridge to the next ten.
function genMakeTen(lv){
  if(lv<=1){const a=between(6,9),b=between(10-a+1,9),need=10-a,ans=a+b;
    return mkChoice('mt:ten',`${a} + ${b} = ?`,`<div class="tfs">${tenFrame(a)}${tenFrame(b,'b')}</div>`,ans,[ans-1,ans+1,[10+b,'Only part of the second number moves over to fill the ten.'],ans+10],
      {hint:`Make a ten:<br>1. Move ${need} over to fill the first ten frame: ${a} + ${need} = 10.<br>2. ${b} − ${need} = ${b-need} is left.<br>3. 10 + ${b-need} = ?`,explain:`${a} + ${need} = 10, and 10 + ${b-need} = ${ans}.`});}
  const t=between(1,8)*10,o=between(5,9),a=t+o,b=between(10-o+1,9),need=10-o,ans=a+b;
  return mkChoice('mt:ten',`${a} + ${b} = ?`,`<div class="eq sm">${a} + ${b} = <span class="blank">?</span></div><div class="jump">${a} <b>+${need}→</b> ${t+10} <b>+${b-need}→</b> ?</div>`,ans,[ans-10,ans+1,ans-1,t+10+b],
    {hint:`Jump to the next ten:<br>1. ${a} + ${need} = ${t+10}<br>2. ${b} − ${need} = ${b-need} is left<br>3. ${t+10} + ${b-need} = ?`,explain:`${a} + ${need} = ${t+10}, then ${t+10} + ${b-need} = ${ans}.`});
}
function genPV(lv){
  if(lv<=1||(lv===2&&rnd(3)===0)){
    const t=lv<=0?between(1,2):between(1,9),o=between(0,9),n=t*10+o;
    return mkChoice('mt:pv','Each rod has 10. Each cube is 1. How many in all?',blocksHTML(t,o),n,[[o*10+t,'The rods are the tens. Count them first.'],t+o,n+10,n-1],
      {hint:`Count the rods by 10s: ${times(t,i=>(i+1)*10).join(', ')}.<br>Then count on the cubes: ${o} more.`,explain:`${t} tens = ${t*10}. ${o} ones = ${o}. ${t*10} + ${o} = ${n}.`});
  }
  const L=lv===2?3:4,lo=10**(L-1),hi=10**L-1;let n,ds;do{n=between(lo+1,hi);ds=digitsOf(n)}while(new Set(ds).size<L||ds.includes(0));
  const pos=rnd(L),vals=ds.map((d,i)=>d*10**(L-1-i)),ans=vals[pos],name=PLACE[L-1-pos];
  if(rnd(2)){const shown=vals.map((v,i)=>i===pos?'<span class="blank">?</span>':v).join(' + ');
    return mkChoice('mt:pv',`Fill in the blank: ${n} = ${vals.map((v,i)=>i===pos?'__':v).join(' + ')}`,`<div class="bignum">${ds.map((x,i)=>i===pos?`<u>${x}</u>`:x).join('')}</div><div class="eq sm">${n} = ${shown}</div>`,ans,
      [ds[pos]===ans?ds[pos]*10:ds[pos],ans*10,ans+10**(L-1-pos)],{hint:`The missing part is the <b>${name}</b>. The digit ${ds[pos]} there means ${ans}.`,explain:`${n} = ${vals.join(' + ')}.`});}
  return mkChoice('mt:pv',`What is the value of the <u>${ds[pos]}</u> in ${n}?`,`<div class="bignum">${ds.map((x,i)=>i===pos?`<u>${x}</u>`:x).join('')}</div>`,ans,[ds[pos],ds[pos]*10,ds[pos]*100,ds[pos]*1000,n].filter(v=>v!==ans),
    {hint:`The ${ds[pos]} is in the <b>${name}</b> place. ${ds[pos]} ${name} = ${ans}.`,explain:`The ${ds[pos]} is in the ${name} place, so it means ${ans}.`});
}
// Compare numbers; from Grade 2, RSM-style "compare without calculating".
function genCmp(lv){
  const signOf=(a,b)=>a<b?'<':a>b?'>':'=';
  const mk=(vis,sign,explain,hint)=>{const r=mkChoice('mt:cmp','Which sign goes in the middle?',vis,sign,[],{fixed:true,explain,hint});
    r.opts=['<','=','>'].map(x=>({t:x,ok:x===sign,label:{'<':'less than','=':'equal to','>':'greater than'}[x]}));return r};
  if(lv>=2&&rnd(3)===0){const [a,b]=addPair(lv-1),d=between(1,9);const v=rnd(3);let L,R,sign,ex;
    if(v===0){L=`${a} + ${b}`;R=`${a+d} + ${b}`;sign='<';ex=`Both add ${b}. ${a} is less than ${a+d}, so the left side is less. No need to calculate!`}
    else if(v===1){L=`${a} + ${b}`;R=`${b} + ${a}`;sign='=';ex='Same numbers, just swapped. Adding in any order gives the same total.'}
    else{const big=a+b+d;L=`${big} − ${b}`;R=`${big} − ${b+d}`;sign='>';ex=`Both start at ${big}. Taking away more (${b+d}) leaves less, so the left side is greater.`}
    return mk(`<div class="cmp"><div><b class="ex">${L}</b></div><span class="blank">?</span><div><b class="ex">${R}</b></div></div>`,sign,ex,'Try to decide <b>without calculating</b>: what is the same on both sides? What is different?');}
  const max=[10,20,99,999,9999][lv],min=lv<=1?0:10**(Math.min(lv,3)-1);
  const a=between(min,max),b=rnd(5)?(()=>{let x;do{x=between(min,max)}while(x===a);return x})():a;
  const [ea,na]=tItem();let eb,nb;do{[eb,nb]=tItem()}while(nb===na&&themeKeys().length>1&&rnd(4));
  const sign=signOf(a,b);
  return mk(`<div class="cmp"><div><span>${ea}</span><b>${a}</b><small>${na}</small></div><span class="blank">?</span><div><span>${eb}</span><b>${b}</b><small>${nb}</small></div></div>`,sign,
    `${a} ${sign} ${b}.`,'1. More digits means bigger.<br>2. Same number of digits: compare the biggest place first, then the next.<br>3. The open side of &lt; or &gt; faces the <b>bigger</b> number.');
}
function genAdd(lv){
  const [a,b]=addPair(lv),ans=a+b,[e,n,p]=tItem(),nc=noCarry(a,b);
  return mkChoice('mt:add',`There are ${a} ${n} ${p}. ${b} more come. How many ${n} now?`,`<div class="eq"><span>${e}</span> ${a} + ${b} = <span class="blank">?</span></div>`,ans,
    [nc!==ans?[nc,'Did you forget to carry the extra ten (or hundred)?']:ans+10,ans+1,ans-1,ans+10],{hint:addHint(a,b,lv),explain:`${a} + ${b} = ${ans}.`});
}
function genSub(lv){
  const [a,b]=subPair(lv),ans=a-b,[e,n,p,v]=tItem(),fl=flipSub(a,b);
  return mkChoice('mt:sub',`There were ${a} ${n} ${p}. ${b} ${v}. How many are left?`,`<div class="eq"><span>${e}</span> ${a} − ${b} = <span class="blank">?</span></div>`,ans,
    [fl!==ans?[fl,'Careful: always take the second number away from the first. You may need to break a ten.']:ans+10,ans+10,ans+1,ans-1],{hint:subHint(a,b,lv),explain:`${a} − ${b} = ${ans}.`});
}
function genSkip(lv){
  const steps=[[1,2,5],[2,5,10],[2,3,4,5,10],[3,4,6,7,8,9,25],[6,7,8,9,12,25,50]][lv];
  if(rnd(2)&&lv>=1){const[e,name,part,each]=tParts();const k=between(2,lv>=3?9:6),ans=each*k,seq=times(k,i=>each*(i+1));
    return mkChoice('mt:skip',`${k} ${name}. Each one has ${each} ${part}. How many ${part} in all?`,`<div class="groups">${times(k,()=>`<div class="grp"><span>${e}</span><b>${each}</b></div>`).join('')}</div>`,ans,[ans+each,ans-each,k+each,ans+1],
      {hint:`Count by ${each}s, one number for each:<br><b>${seq.join(', ')}</b>`,explain:`Count by ${each}s: ${seq.join(', ')}. That is ${ans}.`});}
  const s=pick(steps),start=s*between(lv<=0?0:1,6),seq=times(5,i=>start+s*i),miss=between(1,4),ans=seq[miss];
  return mkChoice('mt:skip',`Count by ${s}s. What number is missing?`,`<div class="seq">${seq.map((n,i)=>i===miss?'<span class="blank">?</span>':`<b>${n}</b>`).join('<i>→</i>')}</div>`,ans,[ans+1,ans-1,ans+s,ans-s],
    {hint:`Each jump adds <b>${s}</b>. Start at ${seq[miss-1]} and add ${s}.`,explain:`${seq[miss-1]} + ${s} = ${ans}.`});
}
function genTime(lv){
  const h=between(1,12),m=lv<=1?pick([0,30]):lv===2?5*between(0,11):between(0,59),ans=`${h}:${pad2(m)}`;
  if(lv>=3&&rnd(2)){const add=pick([15,20,30,45,50]),t=h*60+m+add,h2=(Math.floor(t/60)-1)%12+1,m2=t%60,a2=`${h2}:${pad2(m2)}`;
    return mkChoice('mt:time',`The clock shows ${ans}. What time will it be in ${add} minutes?`,clockSVG(h,m),a2,[`${h}:${pad2((m+add)%60)}`,`${h2}:${pad2((m2+10)%60)}`,`${h%12+1}:${pad2(m)}`].filter(x=>x!==a2),
      {hint:`1. Count on from ${ans} to the next hour: ${60-m} minutes.<br>2. Then count the rest.`,explain:`${ans} + ${add} minutes = ${a2}.`});}
  return mkChoice('mt:time',pick(['What time is it?','The bats wake up at this time. What time is it?','The telescope opens at this time. What time is it?']),clockSVG(h,m),ans,
    [m%5===0&&m?[`${h}:${pad2(m/5)}`,'The long hand points at a number, but you count by 5s for minutes.']:null,[`${h%12+1}:${pad2(m)}`,'Look at the short hand: it has not reached the next number yet.'],m%5===0&&m?[`${m/5}:${pad2((h*5)%60)}`,'The short hand is the hour. The long hand is the minutes.']:null,`${h}:${pad2((m+30)%60)}`].filter(Boolean),
    {hint:`1. <b>Short</b> black hand = hour. It points at or just past <b>${h}</b>.<br>2. <b>Long</b> orange hand = minutes. Count by 5s from 12${m%5?', then count the small marks':''}.`,explain:`The hour is ${h}. The minutes are ${m}. It is ${ans}.`});
}
const LEN_T=[['caterpillar','#7ed957'],['worm','#f4a0a0'],['twig','#b07a4a'],['crayon','#6cc6ff'],['snake','#c6e36b']];
function genLen(lv){
  const start=lv<=1||rnd(3)?0:between(1,3),L=between(lv<=0?2:3,11),end=start+L,[obj,col]=pick(LEN_T),u=36,x0=22;
  let s=`<svg viewBox="0 0 590 140" class="ruler" role="img" aria-label="ruler"><rect x="${x0+start*u}" y="22" width="${L*u}" height="28" rx="14" fill="${col}" stroke="#10222c" stroke-width="2"/>`;
  if(obj!=='twig'&&obj!=='crayon')s+=`<circle cx="${x0+end*u-12}" cy="32" r="3" fill="#10222c"/>`;
  s+=`<line x1="${x0+start*u}" y1="50" x2="${x0+start*u}" y2="72" stroke="#ffe39a" stroke-width="2" stroke-dasharray="4 3"/><line x1="${x0+end*u}" y1="50" x2="${x0+end*u}" y2="72" stroke="#ffe39a" stroke-width="2" stroke-dasharray="4 3"/><rect x="8" y="72" width="574" height="60" rx="6" fill="#ffe39a"/>`;
  for(let i=0;i<=15;i++){const x=x0+i*u;s+=`<line x1="${x}" y1="72" x2="${x}" y2="${i%5?92:98}" stroke="#10222c" stroke-width="2"/><text x="${x}" y="120" text-anchor="middle" font-size="17" font-weight="700" fill="#10222c" font-family="Andika,sans-serif">${i}</text>`;if(i<15)s+=`<line x1="${x+u/2}" y1="72" x2="${x+u/2}" y2="82" stroke="#10222c" stroke-width="1.5"/>`}
  return mkChoice('mt:len',`How long is the ${obj}?`,s+'</svg>',`${L} cm`,[start?[`${end} cm`,`The ${obj} does not start at 0. Count the spaces from ${start} to ${end}.`]:null,`${L+1} cm`,`${L-1} cm`,`${L+2} cm`].filter(Boolean),
    {hint:start?`It starts at <b>${start}</b>, not 0.<br>Count the jumps from ${start} to ${end}, or do ${end} − ${start}.`:`It starts at <b>0</b>. Read the number where it ends.`,explain:start?`${end} − ${start} = ${L}. It is ${L} cm long.`:`It starts at 0 and ends at ${end}. It is ${L} cm long.`});
}
function genEO(lv){
  const n=lv<=1?between(3,20):between(11,99),[e,name]=tItem(),even=n%2===0,Y='Yes. It is even.',N='No, 1 is left over. It is odd.';
  return mkChoice('mt:eo',`There are ${n} ${name}. Can every one have a partner?`,n<=20?`<div class="emoline">${e.repeat(n)}</div>`:`<div class="bignum">${String(n).slice(0,-1)}<u>${n%10}</u></div>`,even?Y:N,[even?N:Y],
    {hint:n<=20?'Make pairs: count by 2s. If one is left with no partner, the number is <b>odd</b>.':'Look only at the <b>ones</b> digit. 0, 2, 4, 6, 8 = even. 1, 3, 5, 7, 9 = odd.',explain:`${n} is ${even?'even: everyone has a partner':'odd: one is left over'}. Even numbers end in 0, 2, 4, 6 or 8.`,fixed:true});
}
// RSM: what "=" means.
function genTF(lv){
  const [p,q]=addPair(Math.min(lv,3)),v=rnd(5);let L,R,note='';
  if(v===0){const c=p+q,f=rnd(2)?c:c+pick([1,2,-1,10]);L=[p,q];R=[f]}
  else if(v===1){const c=p+q,f=rnd(2)?c:c+pick([1,-1,2]);L=[f];R=[p,q];note='The answer can be on the left side, too.'}
  else if(v===2){const s=p+q,c=between(1,s-1),d=rnd(2)?s-c:s-c+pick([1,-1,2]);L=[p,q];R=[c,Math.max(1,d)]}
  else if(v===3){const d=between(2,9);L=[p,q];R=[p+q,d];note='The = sign does not mean "the answer comes next". It means both sides are the same.'}
  else{L=[p];R=[p];note='A number is always the same as itself.'}
  const lv2=sumOf(L),rv=sumOf(R),ok=lv2===rv;
  const r=mkChoice('mt:tf','Is this true? Do both sides weigh the same?',`<div class="tfbox">${L.join(' + ')} <b>=</b> ${R.join(' + ')}</div>${scaleSVG()}`,ok?'✓ True: it balances':'✗ False: it tips',[ok?'✗ False: it tips':'✓ True: it balances'],
    {fixed:true,explain:`Left side: ${L.join(' + ')}${L.length>1?' = '+lv2:''}. Right side: ${R.join(' + ')}${R.length>1?' = '+rv:''}. ${ok?'The same, so it balances.':'Not the same, so it tips.'} ${note}`,
     hint:'1. Work out the left side.<br>2. Work out the right side.<br>3. Are they the same number? Then it balances.'});
  r.opts=[{t:'✓ True: it balances',ok},{t:'✗ False: it tips',ok:!ok}];
  r.onShow=st=>drawScale(st.querySelector('.scale'),L,R,0,{level:true});r.onDone=st=>drawScale(st.querySelector('.scale'),L,R,0);
  return r;
}
function genMissing(lv){
  const [a,b]=addPair(Math.min(lv,3)),c=between(1,a+b-1),ans=a+b-c,blankLeft=rnd(4)===0;
  const L=blankLeft?['?',c]:[a,b],R=blankLeft?[a,b]:(rnd(2)?['?',c]:[c,'?']);
  const r=mkChoice('mt:miss','What number makes the scale balance?',`<div class="tfbox">${sideStr(L)} <b>=</b> ${sideStr(R)}</div>${scaleSVG()}`,ans,
    [[a+b,`${a+b} is the total of ${a} + ${b}. But the other side already has ${c}, so the blank must be smaller.`],[a+b+c,'Adding every number makes that side too heavy.'],ans+1],
    {hint:`1. The full side weighs ${a} + ${b} = ${a+b}.<br>2. The other side already has ${c}.<br>3. What goes with ${c} to make ${a+b}? Count up from ${c}.`,explain:`${a} + ${b} = ${a+b}, and ${ans} + ${c} = ${a+b}. Both sides weigh ${a+b}.`});
  r.onShow=st=>drawScale(st.querySelector('.scale'),L,R,0,{level:true});r.onDone=st=>drawScale(st.querySelector('.scale'),L,R,0,{fillv:ans,fill:ans});
  return r;
}
// RSM: unknowns on a balance scale (interactive).
function genBalance(lv){
  const cfg=[{x:[1,6],k:[1,5],n:[1,1],o:[1,1],max:10},{x:[2,12],k:[2,9],n:[1,2],o:[1,2],max:20},{x:[5,40],k:[5,45],n:[1,2],o:[1,2],max:99},{x:[20,200],k:[30,300],n:[1,2],o:[1,2],max:999},{x:[100,900],k:[200,2500],n:[2,2],o:[1,2],max:9999}][lv];
  for(;;){
    const xv=between(...cfg.x),xk=times(between(...cfg.n),()=>between(...cfg.k)),T=xv+sumOf(xk);if(T>cfg.max)continue;
    let os=[T];if(between(...cfg.o)===2&&T>4){const a=between(Math.max(2,Math.round(T*.5)),T-2);os=[a,T-a]}
    const xs=xk.length===2?[xk[0],'x',xk[1]]:(rnd(2)?[xk[0],'x']:['x',xk[0]]),xLeft=rnd(3)===0;
    return{type:'balance',key:'mt:bal',L:xLeft?xs:os,R:xLeft?os:xs,xv};
  }
}
// Singapore: part-whole bar model.
function genBarM(lv,W,known){
  if(!W){for(;;){const mx=[10,20,99,999,9999][lv],one=[[1,4],[2,9],[10,50],[100,400],[1000,4000]][lv];
    known=lv<=1||rnd(2)?[between(...one)]:[between(...one),between(...one)];W=sumOf(known)+between(one[0],one[1]);if(W<=mx)break}}
  const x=W-sumOf(known),k2=known.length===2,parts=k2?[{v:known[0]},{v:x,label:'x',cls:'px'},{v:known[1]}]:[{v:known[0]},{v:x,label:'x',cls:'px'}];
  const [,items,place]=tItem(),[c1,c2,c3]=take(COLORS,3);
  const txt=`There are ${W} ${items} ${place}. ${known[0]} are ${c1}${k2?` and ${known[1]} are ${c2}`:''}. The rest are ${c3}. How many ${items} are ${c3}?`;
  return mkChoice('mt:bar',txt,barHTML(W,parts),x,[[W,`${W} is the whole bar. The ${c3} ones are only one part of it.`],k2?[sumOf(known),`${sumOf(known)} is the parts you know added together. x is what is left.`]:null,[W+sumOf(known),'x is a part, so it must be smaller than the whole.'],x+(lv>=2?10:1)].filter(Boolean),
    {hint:k2?`1. Add the parts you know: ${known[0]} + ${known[1]} = ${sumOf(known)}.<br>2. Whole − that: ${W} − ${sumOf(known)} = x.<br>Or count up from ${sumOf(known)} to ${W}.`:`Whole − the part you know: ${W} − ${known[0]} = x.<br>Or count up from ${known[0]} to ${W}.`,
     explain:`${W} = ${k2?`${known[0]} + x + ${known[1]}`:`${known[0]} + x`}. ${W} − ${sumOf(known)} = ${x}, so x = ${x}.`});
}
// Singapore comparison model, including the classic "more than" trap where you must subtract.
function genCmpBar(lv){
  // a = smaller amount, d = difference, a + d = larger amount
  const [a0,d]=addPair(Math.max(1,Math.min(lv,3))),big=a0+d,N=kidName(),F=pick(FRIENDS),[,items]=tItem(),v=rnd(3);
  if(v===0){const a=a0,ans=a+d;
    return mkChoice('mt:cbar',`${F} has ${a} ${items}. ${N} has ${d} more than ${F}. How many ${items} does ${N} have?`,cmpBars([{name:F,v:a},{name:N,v:a,label:a,dv:d,dl:`${d} more`}]),ans,[[a-d,`${N} has MORE, so ${N}'s bar is longer. Add.`],d,ans+1],
      {hint:`Draw the bars: ${N}'s bar is ${F}'s bar plus ${d} more.<br>${a} + ${d} = ?`,explain:`${a} + ${d} = ${ans}. ${N} has ${ans} ${items}.`});}
  if(v===1){const a=big,ans=a-d;
    return mkChoice('mt:cbar',`${N} has ${a} ${items}. ${F} has ${d} fewer than ${N}. How many ${items} does ${F} have?`,cmpBars([{name:N,v:a},{name:F,v:ans,label:'?',dv:d,dl:`${d} fewer`}]),ans,[[a+d,`${F} has FEWER, so ${F}'s bar is shorter. Subtract.`],d,ans+1],
      {hint:`${F}'s bar is ${d} shorter than ${N}'s.<br>${a} − ${d} = ?`,explain:`${a} − ${d} = ${ans}. ${F} has ${ans} ${items}.`});}
  const a=big,ans=a-d;
  return mkChoice('mt:cbar',`${N} has ${a} ${items}. That is ${d} more than ${F}. How many ${items} does ${F} have?`,cmpBars([{name:N,v:a},{name:F,v:ans,label:'?',dv:d,dl:`${d}`}]),ans,[[a+d,`Careful! The word "more" is there, but it is ${N} who has more. ${F} has fewer, so subtract.`],d,ans+10],
    {hint:`Who has more? ${N}. So ${F}'s bar is shorter.<br>Draw both bars first, then: ${a} − ${d} = ?`,explain:`${N} has ${d} more, so ${F} has ${d} fewer: ${a} − ${d} = ${ans}. Watch out: "more" does not always mean add!`});
}
// RSM: brackets and equivalent expressions, like her "connect expressions with the same value" page.
function genBrackets(lv){
  const small=lv<=1,v=lv>=3?rnd(4):rnd(3);
  const b=small?between(4,9):lv===2?between(12,40):between(20,150),c=small?between(1,b-1):between(2,Math.min(b-1,20)),a=small?between(b+c+1,20):lv===2?between(b+c+10,99):between(b+c+50,999);
  if(v===0){const f=pick([[`${a} − (${b} − ${c})`,a-(b-c),`${b} − ${c} = ${b-c}`,`${a} − ${b-c}`],[`${a} − (${b} + ${c})`,a-(b+c),`${b} + ${c} = ${b+c}`,`${a} − ${b+c}`],[`(${a} + ${b}) − ${c}`,a+b-c,`${a} + ${b} = ${a+b}`,`${a+b} − ${c}`]]);
    const r=mkChoice('mt:brk',`Work it out: ${f[0]}`,`<div class="tfbox brk">${f[0].replace(/\(([^)]*)\)/,'<span class="bagbox">($1)</span>')}</div>`,f[1],[f[1]+2*c,f[1]-2*c,f[1]+10].filter(x=>x!==f[1]),
      {hint:`Brackets are a bag: open it first.<br>1. ${f[2]}<br>2. ${f[3]} = ?`,explain:`${f[2]}, then ${f[3]} = ${f[1]}.`});return r;}
  if(v===1){const f=pick([[`${a} − (${b} − ${c})`,`${a} − ${b} + ${c}`,[`${a} − ${b} − ${c}`,`${a} + ${b} − ${c}`,`${a} + ${b} + ${c}`],`You take away a bag of ${b} that is missing ${c}. So take away ${b}, then give back ${c}.`],
      [`${a} − (${b} + ${c})`,`${a} − ${b} − ${c}`,[`${a} − ${b} + ${c}`,`${a} + ${b} − ${c}`,`${a} + ${b} + ${c}`],`You take away a bag with ${b} and ${c} inside. So take away both.`],
      [`${a} + (${b} − ${c})`,`${a} + ${b} − ${c}`,[`${a} − ${b} + ${c}`,`${a} + ${b} + ${c}`,`${a} − ${b} − ${c}`],`You add a bag of ${b} that is missing ${c}. So add ${b}, then take away ${c}.`]]);
    return mkChoice('mt:brk',`Which has the same value as ${f[0]}?`,`<div class="tfbox brk">${f[0].replace(/\(([^)]*)\)/,'<span class="bagbox">($1)</span>')}</div>`,f[1],f[2].map(w=>[w,'Work out both and compare. A minus sign in front of a bag changes what happens inside it.']),
      {hint:`Think of the brackets as a bag.<br>${f[3]}`,explain:f[3]});}
  if(v===2){const x=between(10,small?20:90),y=between(5,small?9:40),d=between(1,small?3:9),k=rnd(3);
    const [L,R,s,ex]=k===0?[`${x} + ${y}`,`${x} + ${y+d}`,'<',`Both start with ${x}. Adding more (${y+d}) makes the right side bigger.`]:k===1?[`${x+y} − ${y}`,`${x+y} − ${y+d}`,'>',`Both start at ${x+y}. Taking away more leaves less, so the left side is bigger.`]:[`${x} + ${y}`,`${y} + ${x}`,'=',`Same numbers in a different order: the same total.`];
    const r=mkChoice('mt:brk','Compare without calculating. Which sign goes in the middle?',`<div class="cmp"><div><b class="ex">${L}</b></div><span class="blank">?</span><div><b class="ex">${R}</b></div></div>`,s,[],{fixed:true,hint:'Look for what is the <b>same</b> on both sides, and what is <b>different</b>.',explain:ex});
    r.opts=['<','=','>'].map(t=>({t,ok:t===s}));return r;}
  const p=between(2,9),q=between(2,6),w=between(2,9),ans=p+q*w;
  return mkChoice('mt:brk',`Work it out: ${p} + ${q} × ${w}`,`<div class="tfbox">${p} + <span class="bagbox">${q} × ${w}</span></div>`,ans,[[(p+q)*w,'Multiply before you add, unless there are brackets.'],ans+1,q*w],
    {hint:`Multiply first: ${q} × ${w} = ${q*w}.<br>Then add: ${p} + ${q*w} = ?`,explain:`${q} × ${w} = ${q*w}, then ${p} + ${q*w} = ${ans}.`});
}
function genGroups(lv){
  const eachSet=lv<=1?[2,3,4,5]:lv===2?[2,3,4,5,10]:[2,3,4,5,6,7,8,9,10],nMax=lv<=1?4:lv===2?6:9,v=lv<=1?rnd(2):rnd(4);
  if(v===0){const[e,name,part,each]=tParts(),n=between(2,Math.min(nMax,each>6?5:nMax)),ans=n*each,add=times(n,()=>each).join(' + ');
    return mkChoice('mt:grp',`${n} ${name}. Each one has ${each} ${part}. How many ${part}?`,`<div class="groups">${times(n,()=>`<div class="grp"><span>${e}</span><b>${each}</b></div>`).join('')}</div><div class="eq sm">${add}${lv>=2?` = ${n} × ${each}`:''} = <span class="blank">?</span></div>`,ans,[n+each,ans+each,ans-each,ans+1],
      {hint:`Count by ${each}s: ${times(n,i=>each*(i+1)).join(', ')}.${lv>=2?`<br>${n} × ${each} means ${n} groups of ${each}. (Your book may write it as ${n} · ${each}.)`:''}`,explain:`${add} = ${ans}.`});}
  if(v===1){const r=between(2,lv<=1?3:5),c=between(2,lv<=1?5:6),ans=r*c,[e]=tItem();
    return mkChoice('mt:grp',`How many are there? ${r} rows, ${c} in each row.`,`<div class="arr" style="grid-template-columns:repeat(${c},auto)">${`<span>${e}</span>`.repeat(ans)}</div>${lv>=2?`<div class="eq sm">${r} × ${c} = <span class="blank">?</span></div>`:''}`,ans,[r+c,ans+c,ans-1,ans+r],
      {hint:`Count by ${c}s, one row at a time: ${times(r,i=>c*(i+1)).join(', ')}.`,explain:`${r} rows of ${c}: ${times(r,()=>c).join(' + ')} = ${ans}.`});}
  if(v===2){const k=between(2,lv===2?5:9),m=pick(eachSet),total=k*m,[,plural,single,things,e]=tBox();
    const r=mkChoice('mt:grp',`${total} ${things} are shared equally among ${k} ${plural}. How many ${things} does each ${single} get?`,`${total<=40?`<div class="emoline">${e.repeat(total)}</div>`:''}<div class="eq sm">${total} ÷ ${k} = <span class="blank">?</span></div><div class="dealt"></div>`,m,[total-k,total+k,k,m+1].filter(x=>x!==m),
      {hint:`Deal them out one at a time, like cards, into ${k} ${plural}. Or ask: ${k} × what = ${total}?`,explain:`${total} ÷ ${k} = ${m}. Check: ${k} × ${m} = ${total}.`});
    r.onDone=st=>{const d=st.querySelector('.dealt');if(d&&total<=40)d.innerHTML=groupsHTML(k,m,e)};return r;}
  const each=pick(eachSet),n=between(3,5),add=times(n,()=>each).join(' + ');
  return mkChoice('mt:grp',`Which is the same as ${add}?`,`<div class="eq sm">${add}</div>`,`${n} × ${each}`,[[`${n} + ${each}`,`That adds just two numbers. We have ${n} groups of ${each}.`],[`${each} × ${each}`,`Count the groups: there are ${n}, not ${each}.`],[`${n+1} × ${each}`,`Count the ${each}s again: there are ${n}.`]].filter(w=>w[0]!==`${n} × ${each}`),
    {hint:`Count how many times ${each} is added. That is the number of groups.`,explain:`${each} is added ${n} times: ${n} × ${each} = ${n*each}.`});
}
// Times tables with strategies (Grade 3+).
function genFacts(lv){
  const a=between(2,lv>=4?12:10),b=between(2,lv>=4?12:10),p=a*b,v=rnd(3);
  const strat=b===9?`×9: do ×10, then take away one group. ${a} × 10 = ${a*10}, ${a*10} − ${a} = ${p}.`:b===4?`×4: double, then double again. ${a} × 2 = ${a*2}, ${a*2} × 2 = ${p}.`:b===5?`×5: half of ×10. ${a} × 10 = ${a*10}, half is ${p}.`:`Break it up: ${a} × ${b} = ${a} × ${b-1} + ${a} = ${a*(b-1)} + ${a}.`;
  const vis=a*b<=36?`<div class="arr" style="grid-template-columns:repeat(${b},auto)">${'<span>🟡</span>'.repeat(p)}</div>`:'';
  if(v===0)return mkChoice('mt:fact',`${a} × ${b} = ?`,vis+`<div class="eq sm">${a} × ${b} = <span class="blank">?</span></div>`,p,[p+a,p-b,a+b,p+1].filter(x=>x!==p),{hint:strat,explain:`${a} × ${b} = ${p}.`});
  if(v===1)return mkChoice('mt:fact',`${a} × __ = ${p}`,vis+`<div class="eq sm">${a} × <span class="blank">?</span> = ${p}</div>`,b,[b+1,b-1,p-a].filter(x=>x!==b&&x>0),{hint:`Count by ${a}s until you reach ${p}. How many jumps?`,explain:`${a} × ${b} = ${p}.`});
  return mkChoice('mt:fact',`${p} ÷ ${a} = ?`,vis+`<div class="eq sm">${p} ÷ ${a} = <span class="blank">?</span></div>`,b,[b+1,b-1,p-a].filter(x=>x!==b&&x>0),{hint:`Division is multiplication backwards: ${a} × what = ${p}?`,explain:`${a} × ${b} = ${p}, so ${p} ÷ ${a} = ${b}.`});
}
// Singapore fractions with bars (Grade 3+).
function genFrac(lv){
  const v=rnd(3);
  if(v===0){const n=pick([2,3,4,5,6,8]),k=between(1,n-1);
    return mkChoice('mt:frac','What fraction of the bar is shaded?',fracBar(n,k),`${k}/${n}`,[[`${k}/${n-k}`,'The bottom number counts ALL the equal parts, not just the unshaded ones.'],[`${n}/${k}`,'The top number is the shaded parts. The bottom number is all the parts.'],`${n-k}/${n}`].filter(w=>(Array.isArray(w)?w[0]:w)!==`${k}/${n}`),
      {hint:`1. Count all the equal parts: ${n}. That goes on the bottom.<br>2. Count the shaded parts: ${k}. That goes on top.`,explain:`${k} of ${n} equal parts are shaded: ${k}/${n}.`});}
  if(v===1){const n=pick([2,3,4,5]),m=between(2,lv>=4?6:4),total=n*m,k=lv>=4?between(1,n-1):1,ans=k*m,[e,name]=tItem();
    const r=mkChoice('mt:frac',`What is ${k}/${n} of ${total} ${name}?`,`<div class="emoline">${e.repeat(total)}</div><div class="dealt"></div>`,ans,[[total/k|0,'First split into equal groups.'],m+1,total-ans].filter(w=>(Array.isArray(w)?w[0]:w)!==ans),
      {hint:`1. Split ${total} into ${n} equal groups: ${total} ÷ ${n} = ${m} in each.<br>2. Take ${k} group${k>1?'s':''}: ${k} × ${m} = ?`,explain:`${total} ÷ ${n} = ${m}, and ${k} × ${m} = ${ans}.`});
    r.onDone=st=>{const d=st.querySelector('.dealt');if(d)d.innerHTML=groupsHTML(n,m,e)};return r;}
  const a=pick([2,3,4,5,6,8]);let b;do{b=pick([2,3,4,5,6,8])}while(b===a);const s=a<b?'>':'<';
  const r=mkChoice('mt:frac',`Which is bigger: 1/${a} or 1/${b}?`,`<div class="fcmp"><div><small>1/${a}</small>${fracBar(a,1)}</div><div><small>1/${b}</small>${fracBar(b,1,'#6cc6ff')}</div></div><div class="cmp"><b class="ex">1/${a}</b><span class="blank">?</span><b class="ex">1/${b}</b></div>`,s,[],
    {fixed:true,hint:'Look at the bars. More parts means each part is <b>smaller</b>.',explain:`1/${a} ${s} 1/${b}. Cutting into ${Math.max(a,b)} parts makes smaller pieces than cutting into ${Math.min(a,b)}.`});
  r.opts=['<','=','>'].map(t=>({t,ok:t===s}));return r;
}
// RSM: patterns and sequences.
function genPattern(lv){
  if(lv<=0||(lv===1&&rnd(2))){const[e1,e2,e3]=tEmojis(3),pats=[[e1,e2],[e1,e1,e2],[e1,e2,e3],[e1,e2,e2]],p=pick(pats),seq=times(7,i=>p[i%p.length]),ans=p[7%p.length];
    return mkChoice('mt:pat','What comes next?',`<div class="seq emo">${seq.map(x=>`<b>${x}</b>`).join('')}<span class="blank">?</span></div>`,ans,[...new Set([e1,e2,e3])].filter(x=>x!==ans),
      {hint:`Find the part that repeats: ${p.join(' ')}. Then keep going.`,explain:`The pattern repeats ${p.join(' ')}, so next is ${ans}.`});}
  const rules=[[{f:x=>x+2,d:'+2'},{f:x=>x+5,d:'+5'},{f:x=>x+10,d:'+10'},{f:x=>x-1,d:'−1',s:15}],
    [{f:x=>x+3,d:'+3'},{f:x=>x+4,d:'+4'},{f:x=>x-5,d:'−5',s:60},{f:x=>x+100,d:'+100'},{grow:1}],
    [{f:x=>x*2,d:'×2',s:3},{f:x=>x+25,d:'+25'},{f:x=>x-9,d:'−9',s:90},{grow:1},{alt:[3,-1]}],
    [{f:x=>x*3,d:'×3',s:2},{f:x=>x+11,d:'+11'},{f:x=>x-25,d:'−25',s:200},{grow:1},{alt:[5,-2]}]][Math.min(lv,4)-1];
  const r=pick(rules);let seq,why;
  if(r.grow){const s=between(1,10);seq=[s];for(let i=1;i<6;i++)seq.push(seq[i-1]+i);why='The jumps grow by 1 each time: +1, +2, +3, +4...'}
  else if(r.alt){let x=between(5,20);seq=[x];for(let i=1;i<6;i++){x+=r.alt[(i-1)%2];seq.push(x)}why=`The jumps take turns: +${r.alt[0]}, then ${r.alt[1]}.`}
  else{let x=r.s??between(1,20);seq=[x];for(let i=1;i<6;i++){x=r.f(x);seq.push(x)}why=`Each jump is ${r.d}.`}
  const miss=rnd(2)?5:between(2,4),ans=seq[miss];
  return mkChoice('mt:pat',miss===5?'What comes next?':'What number is missing?',`<div class="seq">${seq.map((n,i)=>i===miss?'<span class="blank">?</span>':`<b>${n}</b>`).join('<i>,</i>')}</div>`,ans,[ans+1,ans-1,ans+2,seq[miss-1]].filter(x=>x!==ans),
    {hint:`Write the jump between each pair of numbers. Look for the rule. ${lv>=2?'Is it the same jump every time, or does it change?':''}`,explain:`${why} So the answer is ${ans}.`});
}
// RSM: logic puzzles with symbols and "I am a number" riddles.
function genLogic(lv){
  const[e1,e2,e3]=tEmojis(3),v=rnd(2);
  if(v===0){
    if(lv>=3&&rnd(2)){const k=between(3,9),x=between(3,12);return mkChoice('mt:logic',`I am a number. If you multiply me by ${k}, you get ${k*x}. What number am I?`,`<div class="eq sm"><b class="xv">?</b> × ${k} = ${k*x}</div>`,x,[k*x-k,x+1,k*x+k].filter(y=>y!==x),{hint:`Undo the multiplying: ${k*x} ÷ ${k} = ?`,explain:`${x} × ${k} = ${k*x}.`})}
    const [x,a]=addPair(lv),b=x+a;
    return mkChoice('mt:logic',`I am a number. If you add ${a} to me, you get ${b}. What number am I?`,`<div class="eq sm"><b class="xv">?</b> + ${a} = ${b}</div>`,x,[[b+a,'If you add, you get a bigger number than the answer. Undo the adding: take away.'],x+1,x-1].filter(w=>(Array.isArray(w)?w[0]:w)!==x),
      {hint:`It is like the mystery bag: ? + ${a} = ${b}.<br>Take ${a} away from ${b}.`,explain:`${b} − ${a} = ${x}. Check: ${x} + ${a} = ${b}.`});
  }
  const m=[5,10,30,60,200][lv];
  if(lv<=1){const p=between(1,m/2|0||2);return mkChoice('mt:logic',`${e1} + ${e1} = ${2*p}. What is ${e1}?`,`<div class="logic"><div>${e1} + ${e1} = ${2*p}</div></div>`,p,[2*p,p+1,p+2].filter(x=>x!==p),{hint:`Two ${e1} make ${2*p}. Split ${2*p} into 2 equal parts.`,explain:`${p} + ${p} = ${2*p}, so ${e1} = ${p}.`})}
  if(lv===2){const p=between(2,m/2|0),q=between(1,m/2|0);
    return mkChoice('mt:logic',`What is ${e2}?`,`<div class="logic"><div>${e1} + ${e1} = ${2*p}</div><div>${e1} + ${e2} = ${p+q}</div><div>${e2} = <span class="blank">?</span></div></div>`,q,[p+q,p,2*p].filter(x=>x!==q),
      {hint:`1. From the first line: ${e1} = ${2*p} ÷ 2 = ${p}.<br>2. Put ${p} in the second line: ${p} + ${e2} = ${p+q}.<br>3. ${e2} = ${p+q} − ${p}.`,explain:`${e1} = ${p}, so ${e2} = ${p+q} − ${p} = ${q}.`});}
  const a=between(2,m/3|0),b=between(2,m/3|0),c=between(2,m/3|0),askA=rnd(2);
  return mkChoice('mt:logic',`What is ${askA?e1:e3}?`,`<div class="logic"><div>${e1} + ${e2} = ${a+b}</div><div>${e2} + ${e3} = ${b+c}</div><div>${e1} + ${e2} + ${e3} = ${a+b+c}</div></div>`,askA?a:c,[b,a+b,b+c,askA?c:a].filter(x=>x!==(askA?a:c)),
    {hint:askA?`Look at lines 2 and 3. Line 3 has everything in line 2, plus ${e1}.<br>${e1} = ${a+b+c} − ${b+c}.`:`Look at lines 1 and 3. Line 3 has everything in line 1, plus ${e3}.<br>${e3} = ${a+b+c} − ${a+b}.`,
     explain:`${e1} = ${a}, ${e2} = ${b}, ${e3} = ${c}.`});
}
// Word problems: fixed Grade 2 stories from her homework, plus stories built from her interests.
const STORY_WRONG={join:(a,b)=>[`${a} − ${b}`,`${a} + ${a}`,`${b} + ${b}`],take:(a,b)=>[`${a} + ${b}`,`${b} − ${a}`,`${a} + ${a}`],compare:(a,b)=>[`${a} + ${b}`,`${b} − ${a}`,`${a} + ${a}`],
  groups:(n,k)=>[`${n} + ${k}`,n>k?`${n} − ${k}`:`${k} − ${n}`,`${k} + ${k}`],share:(t,n)=>[`${t} × ${n}`,`${t} − ${n}`,`${t} + ${n}`]};
function genStory(lv){
  if((lv===2||lv===3)&&rnd(3)===0)return genStoryRound();
  const types=lv<=1?['join','take','compare']:['join','take','compare','groups','share'],type=pick(types),N=kidName(),F=pick(FRIENDS);let s;
  if(type==='join'){const[a,b]=addPair(lv),[e,it,pl]=tItem();s={t:`There are ${a} ${it} ${pl}. ${b} more ${it} come. How many ${it} are there now?`,eq:`${a} + ${b}`,ans:a+b,unit:it,pic:{a,b},wrong:STORY_WRONG.join(a,b)}}
  else if(type==='take'){const[a,b]=subPair(lv),[e,it,pl,aw]=tItem();s={t:`There were ${a} ${it} ${pl}. ${b} of them ${aw}. How many ${it} are left?`,eq:`${a} − ${b}`,ans:a-b,unit:it,pic:{a,b},wrong:STORY_WRONG.take(a,b)}}
  else if(type==='compare'){let[a,b]=subPair(lv);b=a-b;const[,it]=tItem();s={t:`${N} has ${a} ${it}. ${F} has ${b} ${it}. How many more ${it} does ${N} have than ${F}?`,eq:`${a} − ${b}`,ans:a-b,unit:it,pic:{a,b,na:N,nb:F},wrong:STORY_WRONG.compare(a,b)}}
  else if(type==='groups'){const n=between(2,lv===2?6:9),k=pick(lv===2?[2,3,4,5,10]:[3,4,6,7,8,9]),[,pl,sg,things,e]=tBox();s={t:`There are ${n} ${pl}. Each ${sg} has ${k} ${things}. How many ${things} are there in all?`,eq:`${n} × ${k}`,ans:n*k,unit:things,pic:{n,each:k,e},wrong:STORY_WRONG.groups(n,k)}}
  else{const n=between(2,lv===2?5:9),k=pick(lv===2?[2,3,4,5,10]:[3,4,6,7,8,9]),t=n*k,[,pl,sg,things,e]=tBox();s={t:`${t} ${things} are shared equally among ${n} ${pl}. How many ${things} does each ${sg} get?`,eq:`${t} ÷ ${n}`,ans:k,unit:things,pic:{total:t,n,e},wrong:STORY_WRONG.share(t,n)}}
  s.type=type;return{type:'story',key:'mt:story',s};
}

/* ================= CURRICULUM =================
   grades: which math levels show this mission (0 = K ... 4 = Grade 4). order: position in the year.
   src: which program the method comes from. Ids m1–m13 keep saved progress from earlier versions. */
const GEN={bond:genBond,ten:genMakeTen,pv:genPV,cmp:genCmp,add:genAdd,sub:genSub,skip:genSkip,time:genTime,len:genLen,eo:genEO,tf:genTF,miss:genMissing,
  bal:lv=>genBalance(lv),bar:lv=>genBarM(lv),cbar:genCmpBar,brk:genBrackets,grp:genGroups,fact:genFacts,frac:genFrac,pat:genPattern,logic:genLogic,story:genStory};
const MATH_CURRICULUM=[
 {id:'m14',order:10,grades:[0,1,2,3],src:'Singapore',gen:['bond'],name:'Number Bond Nests',icon:'🪺',short:'Number Bonds',learn:'Two parts make a whole.',tip:'<b>Part + part = whole.</b> Missing part = whole − the part you know.',
  build:lv=>times(6,()=>genBond(lv)),spec:['🪺','Bird nest','Some birds build nests from over 1,000 twigs.'],bonus:'Split 10 small toys into two piles in as many ways as you can. Say each number bond.',
  what:'Number bonds (part-part-whole)',why:'Singapore foundation for addition, subtraction and later bar models. Circles make the parts and whole visible'},
 {id:'m15',order:12,grades:[1,2],src:'Singapore',gen:['ten'],name:'Make Ten Meadow',icon:'🔟',short:'Make Ten',learn:'Fill a ten to add fast.',tip:'Fill the ten first: 8 + 5 → 8 + <b>2</b> = 10, then 10 + <b>3</b> = 13.',
  build:lv=>times(6,()=>genMakeTen(lv)),spec:['🐝','Bee','A bee visits up to 5,000 flowers in one day.'],bonus:null,
  what:'Making ten and bridging to the next ten',why:'Core Singapore mental-math strategy, shown with ten frames and jumps'},
 {id:'m2',order:14,grades:[1,2,3,4],src:'Both',gen:['pv'],name:'Pebble Beach',icon:'🪨',short:'Place Value',learn:'Thousands, hundreds, tens and ones.',tip:'A rod is <b>10</b>, a cube is <b>1</b>. In 675, the 7 means 70.',
  build:lv=>times(6,()=>genPV(lv)),spec:['💎','Quartz','Quartz crystals grow with 6 sides.'],bonus:'Make groups of 10 with small things. How many tens? How many ones?',
  what:'Place value and expanded form',why:'Rods and cubes first, then digit values and expanded form (675 = 600 + 70 + 5), as in her homework'},
 {id:'m3',order:16,grades:[0,1,2,3],src:'Both',gen:['cmp'],name:'Animal Olympics',icon:'🏅',short:'Compare',learn:'Which is bigger? Use < > =.',tip:'Compare the biggest place first. From Grade 2: try to decide <b>without calculating</b>.',
  build:lv=>times(6,()=>genCmp(lv)),spec:['🐆','Cheetah','A cheetah can run about 100 km per hour.'],bonus:null,
  what:'Comparing numbers and expressions',why:'One fixed rule, plus RSM-style comparing without calculating (47 + 38 vs 48 + 38)'},
 {id:'m9',order:20,grades:[1,2,3,4],src:'RSM',gen:['tf','miss'],name:'Balance Check',icon:'⚖️',short:'Balance?',learn:'The = sign means both sides weigh the same.',tip:'Read <b>=</b> as <b>"is the same as"</b>. Work out each side. Same number? It balances.',
  build:lv=>[genTF(lv),genTF(lv),genTF(lv),genMissing(lv),genTF(lv),genMissing(lv)],spec:['⚖️','Balance scale','People have used balance scales for more than 4,000 years.'],bonus:'Hang two cups from a coat hanger. Put 3 coins in one cup. How many in the other to balance?',
  what:'What "=" means','why':'True/false equations and "7 + 5 = __ + 4" fix the idea that "=" means "the answer comes next"'},
 {id:'m10',order:22,grades:[1,2,3,4],src:'RSM',gen:['bal'],name:'Mystery Bag Lab',icon:'🎒',short:'Find x',learn:'Solve equations with a balance scale.',tip:'<b>1.</b> Add up each side. <b>2.</b> Take the same off both sides. <b>3.</b> Open the bag and check.',
  build:lv=>times(5,i=>genBalance(Math.max(0,lv-(i<2?1:0)))),spec:['🥚','Ostrich egg','One ostrich egg weighs about as much as 24 chicken eggs.'],bonus:'Hide blocks in a paper bag on one side of a scale. Can a grown-up work out how many are inside?',
  what:'Equations with an unknown (x)',why:'RSM early algebra. Interactive balance that mirrors her "Write and solve an equation" page'},
 {id:'m4',order:24,grades:[0,1,2,3,4],src:'Singapore',gen:['add'],name:'Ant Hill',icon:'🐜',short:'Add',learn:'Add with a strategy.',tip:'Count on (K), make a ten (Grade 1), or add each place and put them together (Grade 2+).',
  build:lv=>times(6,()=>genAdd(lv)),spec:['🌻','Sunflower','Sunflower seeds grow in spiral patterns.'],bonus:null,
  what:'Addition strategies',why:'Strategy grows with level: counting on, making ten, then adding by place; wrong choices target forgetting to carry'},
 {id:'m5',order:26,grades:[0,1,2,3,4],src:'Singapore',gen:['sub'],name:'Tide Pool Take-Away',icon:'🌊',short:'Subtract',learn:'Take away with a strategy.',tip:'Count back (K), go back to ten (Grade 1), or take away one place at a time (Grade 2+).',
  build:lv=>times(6,()=>genSub(lv)),spec:['🌙','The Moon','The Moon pulls on the oceans. That makes the tides.'],bonus:'Put 20 small things in a bowl. Take some away. How many are left?',
  what:'Subtraction strategies',why:'Wrong choices target the "smaller from bigger" mistake'},
 {id:'m11',order:30,grades:[1,2,3,4],src:'Singapore',gen:['bar'],name:'Bar Model Builder',icon:'🧱',short:'Bar Models',learn:'Use a bar to find the missing part.',tip:'The long bar is the <b>whole</b>. The boxes are the <b>parts</b>. Missing part = whole − the parts you know.',
  build:lv=>(lv===2?[genBarM(2,93,[55,28])]:[]).concat(times(lv===2?5:6,()=>genBarM(lv))),spec:['🦕','Argentinosaurus','This dinosaur was heavier than 10 elephants.'],bonus:null,
  what:'Part-whole bar models',why:'The key Singapore tool for turning words into a picture. Starts with 93 = 55 + x + 28 from her homework (Grade 2)'},
 {id:'m16',order:32,grades:[2,3,4],src:'Singapore',gen:['cbar'],name:'Taller or Shorter',icon:'📊',short:'Comparison Bars',learn:'More than, fewer than: draw two bars.',tip:'Draw both bars. Who has more? "More" does <b>not</b> always mean add!',
  build:lv=>times(6,()=>genCmpBar(lv)),spec:['🦒','Giraffe','A giraffe can be taller than 5 meters.'],bonus:null,
  what:'Comparison bar models ("more than", "fewer than")',why:'Singapore comparison model, including the classic trap "That is 18 more than Mia" where you must subtract'},
 {id:'m17',order:34,grades:[2,3,4],src:'RSM',gen:['brk'],name:'Bracket Bags',icon:'🛍️',short:'Brackets',learn:'Brackets, same-value expressions, comparing without calculating.',tip:'Brackets are a <b>bag</b>: open it first. A minus in front of a bag changes what happens inside.',
  build:lv=>times(6,()=>genBrackets(lv)),spec:['🦘','Kangaroo','A baby kangaroo lives in a pouch, like a bag, for about 6 months.'],bonus:null,
  what:'Expressions and brackets',why:'RSM topic from her "connect expressions with the same value" page: 83 − (21 − 9) = 83 − 21 + 9, shown as a bag'},
 {id:'m1',order:40,grades:[0,1,2],src:'Singapore',gen:['skip'],name:'Sea Star Count',icon:'⭐',short:'Skip Count',learn:'Count by 2s, 5s, 10s and more.',tip:'Skip counting is fast counting. Count by 5s: <b>5, 10, 15, 20</b>.',
  build:lv=>times(6,()=>genSkip(lv)),spec:['🌟','Sea star','Most sea stars have 5 arms. Some kinds have up to 40!'],bonus:'Count your fingers and toes by 5s: 5, 10, 15, 20!',
  what:'Skip counting',why:'Foundation for multiplication, with pictured groups of real animal parts'},
 {id:'m12',order:42,grades:[1,2,3],src:'Singapore',gen:['grp'],name:'Giraffe Boots',icon:'🦒',short:'Equal Groups',learn:'Equal groups, arrays and sharing.',tip:'<b>3 × 4</b> means 3 groups of 4: 4 + 4 + 4. Your book may write it as <b>3 · 4</b>.',
  build:lv=>times(6,()=>genGroups(lv)),spec:['🦒','Giraffe','Each giraffe leg is taller than most grown-ups.'],bonus:'Make 3 groups of 4 with toys. Count by 4s. Then share 12 toys between 3 people.',
  what:'Equal groups (× ÷)',why:'Repeated addition, arrays and fair sharing with pictures before symbols'},
 {id:'m20',order:44,grades:[3,4],src:'Both',gen:['fact'],name:'Times Table Garden',icon:'🌷',short:'Times Tables',learn:'Multiplication and division facts with strategies.',tip:'Use a strategy: ×4 = double, double. ×5 = half of ×10. ×9 = ×10 minus one group.',
  build:lv=>times(7,()=>genFacts(lv)),spec:['🌷','Tulip','A tulip bulb can grow into a flower in about 3 months.'],bonus:null,
  what:'Multiplication facts',why:'Facts learned through strategies and arrays rather than rote lists'},
 {id:'m21',order:46,grades:[3,4],src:'Singapore',gen:['frac'],name:'Pizza Planet',icon:'🍕',short:'Fractions',learn:'Fractions with bars and groups.',tip:'Bottom number = how many equal parts. Top number = how many you take.',
  build:lv=>times(6,()=>genFrac(lv)),spec:['🪐','Jupiter','Jupiter is so big that more than 1,000 Earths could fit inside.'],bonus:null,
  what:'Fractions',why:'Singapore fraction bars; tackles "1/8 is bigger than 1/4 because 8 is bigger"'},
 {id:'m13',order:50,grades:[1,2,3,4],src:'Singapore',gen:['story'],name:'Story Detective',icon:'🔎',short:'Word Problems',learn:'Turn a story into a number sentence.',tip:'<b>1.</b> Circle the numbers. <b>2.</b> What is happening? <b>3.</b> Pick the number sentence. <b>4.</b> Solve.',
  build:lv=>times(5,()=>genStory(lv)),spec:['🦉','Barn owl','A barn owl can find a mouse in the dark just by listening.'],bonus:'Make up a story problem about animals for a grown-up to solve. Then switch!',
  what:'Word problems',why:'Four fixed steps with a picture of what is happening; avoids keyword tricks. Stories use her interests'},
 {id:'m19',order:52,grades:[1,2,3,4],src:'RSM',gen:['logic'],name:'Logic Lab',icon:'🧩',short:'Logic Puzzles',learn:'Number riddles and picture equations.',tip:'Each picture stands for a number. Start with the line you can solve first.',
  build:lv=>times(6,()=>genLogic(lv)),spec:['🐙','Octopus','Octopuses can solve puzzles and open jars.'],bonus:'Make a picture-equation puzzle for a grown-up: 🍎 + 🍎 = 8. What is 🍎?',
  what:'Logic puzzles and riddles',why:'RSM-style reasoning: "I am a number..." riddles and symbol equations (🐸 + 🐸 = 10)'},
 {id:'m18',order:54,grades:[0,1,2,3,4],src:'RSM',gen:['pat'],name:'Pattern Trail',icon:'🐾',short:'Patterns',learn:'Find the rule and keep it going.',tip:'Write the jump between each pair of numbers. Is it the same every time?',
  build:lv=>times(6,()=>genPattern(lv)),spec:['🐚','Nautilus','A nautilus shell grows in a spiral pattern.'],bonus:null,
  what:'Patterns and sequences',why:'Picture patterns in K, then number rules; growing and alternating jumps from Grade 2'},
 {id:'m6',order:60,grades:[1,2,3],src:'Both',gen:['time'],name:'Night Watch',icon:'🕰️',short:'Clock',learn:'Tell time.',tip:'Short hand = <b>hour</b>. Long orange hand = <b>minutes</b>.',
  build:lv=>times(6,()=>genTime(lv)),spec:['🌍','Earth','Earth spins once every 24 hours. That is one day.'],bonus:'Look at a real clock 3 times today. Tell a grown-up the time.',
  what:'Telling time',why:'Hour and half hour (Grade 1), 5 minutes (Grade 2), any minute and elapsed time (Grade 3)'},
 {id:'m7',order:62,grades:[1,2,3],src:'Both',gen:['len'],name:'Measuring Lab',icon:'📏',short:'Measure',learn:'Measure with a ruler in centimeters.',tip:'Start at <b>0</b>. If it does not start at 0, count the spaces.',
  build:lv=>times(6,()=>genLen(lv)),spec:['🐍','Python','The longest snake ever measured was about 10 meters long.'],bonus:'Measure 3 things with a real ruler: a pencil, a leaf, your hand.',
  what:'Measuring length',why:'Includes objects that do not start at 0'},
 {id:'m8',order:99,grades:[0,1,2,3,4],src:'Both',gen:[],name:'Math Mix',icon:'🧮',short:'Math Mix',learn:'A mix of everything at your level.',tip:'Take your time. Use "Show me how" whenever you want.',
  build:lv=>buildMathMix(lv),spec:['🍯','Honeycomb','Bees build honeycomb from 6-sided shapes.'],bonus:null,
  what:'Mixed review',why:'Question types she missed come first, then a mix of everything at her level'}
];
function mathMissionsFor(level){return MATH_CURRICULUM.filter(m=>m.grades.includes(level)).sort((a,b)=>a.order-b.order)}
function buildMathMix(lv){
  const avail=[...new Set(mathMissionsFor(S.profile.math).flatMap(m=>m.gen))];
  const missed=Object.entries(S.mistakes).filter(e=>e[0].startsWith('mt:')&&avail.includes(e[0].slice(3))).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0].slice(3));
  const rest=take(avail.filter(k=>!missed.includes(k)),7-missed.length);
  return shuffle(missed.concat(rest).map(k=>GEN[k](lv)));
}
