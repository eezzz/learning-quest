/* Number Lab, more topics (K to Grade 5): shapes, money, graphs, rounding, area and perimeter,
   multi-digit multiplication and division, "times as many", angles, decimals, fraction operations,
   volume, coordinates and expressions.
   Same style as curriculum.js: picture first, a step-by-step hint, and wrong choices that each match a
   real misconception with a short "why". Levels: 0 = K, 1..5 = Grades 1..5. Every generator clamps
   the level to the grades it is written for, so it is safe to call it with any level.
   Loaded after curriculum.js and before app.js. Uses helpers from those files only at run time. */

/* ================= shared helpers ================= */
const MM_C={ink:'#fff8ea',gold:'#ffc94d',blue:'#6cc6ff',pink:'#f59ae0',green:'#5ee3b1',panel:'#1b4254',grid:'#3a7389',dark:'#10222c',muted:'#b5d3dc'};
const mmLv=(lv,lo,hi)=>Math.max(lo,Math.min(hi,lv|0));
const mmR=v=>Math.round(v*10)/10;
const mmCap=s=>s[0].toUpperCase()+s.slice(1);
function mmSvg(w,h,label,maxw,body){return`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" style="width:100%;max-width:${maxw}px;height:auto" font-family="Andika,sans-serif">${body}</svg>`}
function mmT(x,y,t,o={}){return`<text x="${mmR(x)}" y="${mmR(y)}" text-anchor="${o.a||'middle'}" font-size="${o.s||18}" font-weight="${o.w||700}" fill="${o.c||MM_C.ink}"${o.extra||''}>${t}</text>`}
function mmLine(x1,y1,x2,y2,c,w,extra=''){return`<line x1="${mmR(x1)}" y1="${mmR(y1)}" x2="${mmR(x2)}" y2="${mmR(y2)}" stroke="${c}" stroke-width="${w}"${extra}/>`}
const mmPts=a=>a.map(p=>mmR(p[0])+','+mmR(p[1])).join(' ');
// Hundredths (an integer) as a clean decimal string: 345 → "3.45", 340 → "3.4", 300 → "3".
function mmHund(h){const w=Math.floor(h/100),f=h%100;return f?(f%10?`${w}.${pad2(f)}`:`${w}.${f/10}`):String(w)}
const mmFix=(h,places)=>(h/100).toFixed(places);
// Different themed items (distinct names and emoji) from the child's interests.
function mmItems(n){const seenN=new Set(),seenE=new Set(),out=[];
  const add=list=>shuffle(list).forEach(it=>{if(out.length<n&&!seenN.has(it[1])&&!seenE.has(it[0])){seenN.add(it[1]);seenE.add(it[0]);out.push(it)}});
  add(themeKeys().flatMap(k=>THEMES[k].items));if(out.length<n)add(Object.values(THEMES).flatMap(t=>t.items));return out}
function mmOthers(a,b){const o=FRIENDS.slice();const A=pick([kidName()].concat(o));let B;do{B=pick(o)}while(B===A);return[A,B]}
// A number line from lo to hi with `steps` equal jumps and a dot at v.
function mmNumLine(lo,hi,steps,v,fmt,o={}){
  const x0=40,x1=500,X=t=>x0+(t-lo)/(hi-lo)*(x1-x0);let s=mmLine(x0-14,70,x1+14,70,MM_C.ink,3);
  for(let i=0;i<=steps;i++){const t=lo+(hi-lo)*i/steps,big=i===0||i===steps||(o.mid&&i*2===steps);s+=mmLine(X(t),big?54:62,X(t),big?86:78,big?MM_C.gold:MM_C.muted,big?3:2)}
  s+=mmT(X(lo),112,fmt(lo),{c:MM_C.gold,s:20})+mmT(X(hi),112,fmt(hi),{c:MM_C.gold,s:20});
  if(o.mid)s+=mmT(X((lo+hi)/2),108,fmt((lo+hi)/2),{c:MM_C.muted,s:15,w:400})+mmT(X((lo+hi)/2),126,'halfway',{c:MM_C.muted,s:13,w:400});
  s+=`<circle cx="${mmR(X(v))}" cy="70" r="9" fill="${MM_C.pink}" stroke="${MM_C.dark}" stroke-width="2"/>`+mmT(X(v),40,o.pointLabel??fmt(v),{c:MM_C.pink,s:20});
  return mmSvg(540,132,o.label||'number line',560,s);
}
// Fraction bars. rows: [{n, fill:[color per part or null], label}]
function mmBars(rows,label,o={}){
  const W=o.w||400,x0=o.x0??80,rh=44,gap=16;let s='';
  rows.forEach((r,i)=>{const y=10+i*(rh+gap),pw=W/r.n;
    if(r.label)s+=mmT(x0-10,y+rh/2+7,r.label,{a:'end',s:18,c:MM_C.gold});
    for(let k=0;k<r.n;k++)s+=`<rect x="${mmR(x0+k*pw)}" y="${y}" width="${mmR(pw)}" height="${rh}" fill="${r.fill[k]||MM_C.panel}" stroke="${MM_C.ink}" stroke-width="2.5"/>`;
    if(r.mark!=null)s+=mmLine(x0+r.mark*W,y-6,x0+r.mark*W,y+rh+6,MM_C.pink,3,' stroke-dasharray="6 4"');
  });
  return mmSvg(x0+W+10,20+rows.length*(rh+gap)-gap,label,o.maxw||500,s);
}
const mmFill=(n,segs)=>{const f=[];segs.forEach(([k,c])=>{for(let i=0;i<k;i++)f.push(c)});while(f.length<n)f.push(null);return f};
const MM_DEN={2:'halves',3:'thirds',4:'fourths',5:'fifths',6:'sixths',8:'eighths',10:'tenths',12:'twelfths'},mmDen=n=>MM_DEN[n]||`${n}ths`;
const mmGcd=(a,b)=>b?mmGcd(b,a%b):a;
// Value of "3/4", "2 1/3" or "5" (for checking that no wrong choice equals the right one).
function mmFracVal(t){t=String(t).trim();let m=t.match(/^(\d+) (\d+)\/(\d+)$/);if(m)return +m[1]+m[2]/m[3];m=t.match(/^(\d+)\/(\d+)$/);if(m)return m[1]/m[2];return +t}
const mmNotSame=(right,wrongs)=>wrongs.filter(w=>w&&Math.abs(mmFracVal(Array.isArray(w)?w[0]:w)-mmFracVal(right))>1e-9);

/* ================= 1. SHAPES (K–2) ================= */
const MM_SIDES={circle:0,triangle:3,square:4,rectangle:4,pentagon:5,hexagon:6};
const MM_SHAPE_DESC={circle:'A circle is round. It has no straight sides and no corners.',triangle:'A triangle has 3 straight sides and 3 corners.',square:'A square has 4 equal sides and 4 square corners.',
  rectangle:'A rectangle has 4 sides and 4 square corners. Opposite sides are the same length.',pentagon:'A pentagon has 5 sides and 5 corners.',hexagon:'A hexagon has 6 sides and 6 corners.'};
function mmShapeBody(kind,cx,cy,r,col){
  const st=`fill="${col}" fill-opacity=".85" stroke="${MM_C.ink}" stroke-width="4" stroke-linejoin="round"`;
  if(kind==='circle')return`<circle cx="${cx}" cy="${cy}" r="${mmR(r*.9)}" ${st}/>`;
  let pts,rot=0;
  if(kind==='square'||kind==='rectangle'){const w=kind==='square'?r*1.45:r*1.9,h=kind==='square'?w:r*1.05;pts=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];rot=pick([0,0,0,12,-12])}
  else if(kind==='triangle'&&rnd(2)){pts=pick([[[-r,r*.7],[r,r*.7],[-r*.5,-r*.8]],[[-r,r*.6],[r*.9,r*.6],[r*.2,-r*.9]],[[-r*.9,r*.8],[r*.9,r*.8],[-r*.9,-r*.8]]]);rot=pick([0,0,20,-20])}
  else{const k=MM_SIDES[kind];pts=times(k,i=>{const a=-Math.PI/2+i*2*Math.PI/k;return[r*Math.cos(a),r*Math.sin(a)]});rot=rnd(360/k)}
  const a=rot*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return`<polygon points="${mmPts(pts.map(([x,y])=>[cx+x*c-y*s,cy+x*s+y*c]))}" ${st}/>`;
}
function genShapes(lv){
  const L=mmLv(lv,0,2),pool=L<2?['circle','square','triangle','rectangle','hexagon']:['circle','square','triangle','rectangle','pentagon','hexagon'];
  const cols=[MM_C.blue,MM_C.pink,MM_C.green,MM_C.gold],v=L===0?rnd(2):rnd(3);
  const sidesTxt=n=>n?`${n} sides`:'no straight sides';
  const countHint=`Put your finger on one side. Count each side as you go around. Stop when you get back to the start.<br>3 sides = triangle. 4 sides = square or rectangle.${L>=2?' 5 = pentagon.':''} 6 = hexagon. Round = circle.`;
  if(v===0){
    const kind=pick(pool),vis=mmSvg(200,200,'a shape',230,mmShapeBody(kind,100,100,78,pick(cols)));
    const whyOf=w=>kind==='circle'?`A ${w} has straight sides. This shape is round.`:w==='circle'?'A circle is round. This shape has straight sides.'
      :w==='square'&&kind==='rectangle'?'A square has 4 equal sides. This shape has 2 long sides and 2 short sides.'
      :w==='rectangle'&&kind==='square'?null:`A ${w} has ${sidesTxt(MM_SIDES[w])}. This shape has ${sidesTxt(MM_SIDES[kind])}.`;
    const near={square:['triangle','hexagon'],rectangle:['square'],pentagon:['hexagon'],hexagon:L>=2?['pentagon']:['circle'],triangle:['square'],circle:['hexagon']}[kind];
    // A square is also a kind of rectangle, so "rectangle" is never offered as a wrong answer for a square.
    const others=near.concat(shuffle(pool.filter(w=>w!==kind&&!near.includes(w)))).filter(w=>!(kind==='square'&&w==='rectangle'));
    return mkChoice('mt:shape','What is the name of this shape?',vis,mmCap(kind),others.slice(0,3).map(w=>[mmCap(w),whyOf(w)]),
      {hint:kind==='square'||kind==='rectangle'?countHint+'<br>4 sides? Check: are all 4 sides the same length? Then it is a square.':countHint,explain:MM_SHAPE_DESC[kind]});
  }
  if(v===1){
    const ask=rnd(2)?'sides':'corners',kind=pick(ask==='sides'?pool.filter(k=>k!=='circle'):pool),N=MM_SIDES[kind];
    const vis=mmSvg(200,200,'a shape',230,mmShapeBody(kind,100,100,78,pick(cols)));
    const one=ask==='sides'?'side':'corner';
    return mkChoice('mt:shape',`How many ${ask} does this shape have?`,vis,N,
      N?[[N+1,`You counted one ${one} twice. Stop when you get back to the first one.`],[N-1,`You missed a ${one}. Touch each one as you count.`],[N+2,`Count slowly. Touch each ${one} only once.`]]:[[1,'A circle is one curved line. It has no corners.'],[2,'A circle has no pointy corners at all.']],
      {hint:`Put your finger on one ${one}. Count each ${one} as you go around. Stop when you get back to the start.`,explain:MM_SHAPE_DESC[kind]});
  }
  const qs=[['has 3 sides','triangle'],['has no corners','circle'],['has 6 sides','hexagon']].concat(L>=2?[['has 5 sides','pentagon'],['has 4 equal sides','square'],['has 4 equal sides','square']]:[]);
  const [q,ans]=pick(qs),n=L>=2?4:3;
  let shown=[ans].concat(q==='has 4 equal sides'?['rectangle']:[]);shown=shown.concat(take(pool.filter(k=>!shown.includes(k)&&k!==ans),n-shown.length));shown=shuffle(shown);
  const body=shown.map((k,i)=>mmShapeBody(k,70+i*130,70,50,cols[i%4])+mmT(70+i*130,152,mmCap(k),{s:17,c:MM_C.muted})).join('');
  const whyOf=w=>q==='has no corners'?`A ${w} has ${MM_SIDES[w]} corners.`:w==='rectangle'&&ans==='square'?'A rectangle has 4 sides, but 2 are long and 2 are short.':w==='circle'?'A circle has no straight sides.':`A ${w} has ${MM_SIDES[w]} sides.`;
  return mkChoice('mt:shape',`Which shape ${q}?`,mmSvg(n*130+10,166,'shapes',n*130+30,body),mmCap(ans),shown.filter(k=>k!==ans).map(w=>[mmCap(w),whyOf(w)]),
    {hint:'Look at each shape. Count its sides with your finger. Check which one matches.',explain:MM_SHAPE_DESC[ans]});
}

/* ================= 2. MONEY (Grade 2) ================= */
const MM_COINS={q:[25,'quarter','quarters','#dfe6ea',25],d:[10,'dime','dimes','#c5d0d6',18],n:[5,'nickel','nickels','#b9c4ca',22],p:[1,'penny','pennies','#d08a54',19.5]};
function mmCoinsSVG(list,label){
  const per=Math.min(6,list.length),rows=Math.ceil(list.length/per),w=per*66+14;
  const body=list.map((k,i)=>{const[v,nm,,col,r]=MM_COINS[k],x=40+(i%per)*66,y=40+Math.floor(i/per)*84;
    return`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="${MM_C.dark}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r-4}" fill="none" stroke="${MM_C.dark}" stroke-opacity=".35" stroke-width="1.5"/>`+
      mmT(x,y+6,`${v}¢`,{s:r>20?16:14,c:MM_C.dark})+mmT(x,y+r+16,nm,{s:12,w:400,c:MM_C.muted})}).join('');
  return mmSvg(w,rows*84+6,label||'coins',Math.round(Math.max(240,w*1.4)),body);
}
const mmCoinVal=list=>sumOf(list.map(k=>MM_COINS[k][0]));
function mmSetText(c){return['q','d','n','p'].filter(k=>c[k]).map(k=>`${c[k]} ${c[k]===1?MM_COINS[k][1]:MM_COINS[k][2]}`).join(', ')}
const mmSetVal=c=>['q','d','n','p'].reduce((s,k)=>s+(c[k]||0)*MM_COINS[k][0],0);
function mmRandCoins(L,maxTotal,minN,maxN){
  for(let tries=0;tries<500;tries++){
    const c={q:L>=2?between(0,3):0,d:between(0,4),n:between(0,3),p:between(0,4)},list=['q','d','n','p'].flatMap(k=>Array(c[k]).fill(k)),t=mmCoinVal(list);
    if(list.length>=minN&&list.length<=maxN&&t<=maxTotal&&t>0)return list;
  }
  return['d','d','n','p'];
}
function genMoney(lv){
  const L=mmLv(lv,1,3),v=L===1?rnd(2):rnd(3);
  const legend=mmCoinsSVG(['p','n','d','q'].filter(k=>L>=2||k!=='q'),'coin values');
  if(v===0){
    const list=mmRandCoins(L,L===1?60:99,2,L===1?6:8),t=mmCoinVal(list),cnt=list.length,sorted=list.slice().sort((a,b)=>MM_COINS[b][0]-MM_COINS[a][0]);
    const shown=L===1?sorted:shuffle(list),nN=list.filter(k=>k==='n').length,nD=list.filter(k=>k==='d').length,swap=t+5*nN-5*nD;
    const run=[];sorted.reduce((s,k)=>{s+=MM_COINS[k][0];run.push(s);return s},0);
    return mkChoice('mt:money','How much money is this?',mmCoinsSVG(shown),`${t}¢`,[
      cnt!==t?[`${cnt}¢`,'That counts the coins. Each coin has its own value. Add the values.']:null,
      swap!==t?[`${swap}¢`,'A nickel is bigger but worth less. Nickel = 5¢. Dime = 10¢.']:null,
      [`${t-MM_COINS[sorted[sorted.length-1]][0]}¢`,'You missed a coin. Touch each coin as you count.'],[`${t+5}¢`,'Count on again from the biggest coin.']].filter(Boolean),
      {hint:`1. Start with the coin worth the most.<br>2. Count on: ${sorted.map((k,i)=>i?`+${MM_COINS[k][0]}`:MM_COINS[k][0]).join(', ')}.<br>Quarter 25¢, dime 10¢, nickel 5¢, penny 1¢.`,explain:`${sorted.map(k=>MM_COINS[k][0]).join(' + ')} = ${t}¢.`});
  }
  if(v===1){
    const target=L===1?pick([10,15,20,25,30,40,50]):(rnd(2)?50:pick([25,30,35,40,45,60,75,80,90]));let c=null;
    for(let i=0;i<3000&&!c;i++){const x={q:L>=2?between(0,3):0,d:between(0,5),n:between(0,4),p:between(0,5)},n=x.q+x.d+x.n+x.p;if(mmSetVal(x)===target&&n>=2&&n<=7)c=x}
    if(!c){c={q:0,d:Math.floor(target/10),n:target%10?1:0,p:0}}
    const variants=[];
    if(c.d){variants.push([{...c,d:c.d-1,n:(c.n||0)+1},'A nickel is only 5¢. A dime is 10¢.'])}
    if(c.n){variants.push([{...c,n:c.n-1,d:(c.d||0)+1},'A dime is 10¢, not 5¢.'])}
    if(c.q){variants.push([{...c,q:c.q-1,d:(c.d||0)+2},'A quarter is 25¢. Two dimes are only 20¢.'])}
    if(target%10===0&&target/10<=9)variants.push([{q:0,d:0,n:target/10,p:0},`That is ${target/10} coins, but nickels are 5¢ each. Count the value, not the coins.`]);
    variants.push([{...c,p:(c.p||0)+1},null],[{...c,p:(c.p||0)+2},null]);
    const wr=shuffle(variants).filter(([x])=>mmSetVal(x)!==target&&mmSetText(x)).map(([x,why])=>[mmSetText(x),`That makes ${mmSetVal(x)}¢, not ${target}¢. ${why||''}`.trim()]);
    return mkChoice('mt:money',`Which coins make ${target}¢?`,`<div class="bignum">${target}¢</div>${legend}`,mmSetText(c),wr,
      {wide:true,hint:'For each choice, start with the biggest coin and count on. Stop when you reach the end. Is it the target?',explain:`${mmSetText(c)}: ${['q','d','n','p'].flatMap(k=>Array(c[k]||0).fill(MM_COINS[k][0])).join(' + ')} = ${target}¢.`});
  }
  let list;do{list=mmRandCoins(3,95,2,6)}while(mmCoinVal(list)<25);
  const t=mmCoinVal(list),ans=100-t,sorted=list.slice().sort((a,b)=>MM_COINS[b][0]-MM_COINS[a][0]);
  return mkChoice('mt:money','You have these coins. How many more cents make 1 dollar?',mmCoinsSVG(sorted),`${ans}¢`,
    [[`${t}¢`,'That is how much you have. Count up from it to 100¢.'],[`${ans+10}¢`,`Check: ${t} + ${ans+10} = ${t+ans+10}, not 100.`],ans>5?[`${ans-5}¢`,`Check: ${t} + ${ans-5} = ${95}, not 100.`]:[`${ans+5}¢`,`Check: ${t} + ${ans+5} = ${105}, not 100.`]],
    {hint:`1. Count the coins: ${t}¢.<br>2. 1 dollar = 100¢.<br>3. Count up from ${t} to 100, or do 100 − ${t}.`,explain:`${t}¢ + ${ans}¢ = 100¢ = 1 dollar.`});
}

/* ================= 3. GRAPHS (Grades 1–3) ================= */
function mmPicGraph(items,counts,s,title){
  const rh=50,top=46,W=560;let b=mmT(W/2,28,title,{s:20,c:MM_C.gold});
  items.forEach(([e,name],i)=>{const y=top+i*rh;b+=`<rect x="8" y="${y}" width="${W-16}" height="${rh-6}" rx="10" fill="${MM_C.panel}"/>`+mmT(20,y+29,`${e} ${esc(name)}`,{a:'start',s:16})+mmLine(172,y+4,172,y+rh-10,MM_C.grid,2);
    for(let k=0;k<counts[i];k++)b+=mmT(196+k*44,y+32,e,{s:28,w:400})});
  const ky=top+items.length*rh+26;b+=mmT(W/2,ky,`Key: each picture = ${s}`,{s:17,c:MM_C.green});
  return mmSvg(W,ky+14,'picture graph',560,b);
}
function mmBarGraph(items,vals,s,title,maxC){
  const W=540,x0=70,y0=270,yT=50,nT=maxC+1,step=nT>8?2:1,uh=(y0-yT)/nT,bw=Math.min(72,380/items.length-20),cols=[MM_C.blue,MM_C.pink,MM_C.green,MM_C.gold];
  let b=mmT(W/2,28,title,{s:20,c:MM_C.gold});
  for(let k=0;k<=nT;k++){const y=y0-k*uh;b+=mmLine(x0,y,W-20,y,MM_C.grid,k?1:2);if(k%step===0)b+=mmT(x0-10,y+6,k*s,{a:'end',s:15,c:MM_C.muted})}
  b+=mmLine(x0,yT-10,x0,y0,MM_C.ink,3)+mmLine(x0,y0,W-20,y0,MM_C.ink,3);
  b+=mmT(20,(y0+yT)/2,'Number',{s:15,c:MM_C.muted,extra:` transform="rotate(-90 20 ${(y0+yT)/2})"`});
  const gap=(W-20-x0)/items.length;
  items.forEach(([e,name],i)=>{const cx=x0+gap*(i+.5),h=vals[i]/s*uh;b+=`<rect x="${mmR(cx-bw/2)}" y="${mmR(y0-h)}" width="${mmR(bw)}" height="${mmR(h)}" fill="${cols[i%4]}" stroke="${MM_C.dark}" stroke-width="2"/>`+mmT(cx,y0+26,e,{s:22,w:400})+mmT(cx,y0+46,esc(name),{s:13,c:MM_C.muted})});
  return mmSvg(W,y0+58,'bar graph',560,b);
}
function genGraph(lv){
  const L=mmLv(lv,1,3),n=L===1?3:4,items=mmItems(n),bar=L===1?false:rnd(2)===1;
  const s=L<3?1:bar?pick([2,5,10]):pick([2,5]),maxC=L===1?6:bar&&s===1?12:8;
  const counts=take(times(maxC,i=>i+1),n),vals=counts.map(c=>c*s),title=pick(['Things we counted','Our nature count','What we saw today']);
  const vis=bar?mmBarGraph(items,vals,s,title,Math.max(...counts)):mmPicGraph(items,counts,s,title);
  const nm=i=>items[i][1],readHint=bar?'Go to the top of the bar. Slide across to the numbers on the left.':s>1?`Look at the key: each picture stands for ${s}. Count by ${s}s.`:'Count the pictures in the row.';
  const pics=s>1&&!bar;
  const q=L===1?pick([0,2,3]):rnd(4);
  if(q===0){const i=rnd(n),ans=vals[i],j=(i+1)%n;
    return mkChoice('mt:graph',`How many ${nm(i)} are there?`,vis,ans,[pics?[counts[i],`Each picture stands for ${s}, not 1. Count by ${s}s.`]:null,[vals[j],`That is the ${bar?'bar':'row'} for ${nm(j)}.`],[ans+s,bar?'Slide straight across from the top of the bar.':'Count the pictures again.'],[ans-s,bar?'Slide straight across from the top of the bar.':'Count the pictures again.']].filter(Boolean),
      {hint:readHint,explain:`The graph shows ${ans} ${nm(i)}.`});}
  if(q===1){let i,j;do{i=rnd(n);j=rnd(n)}while(vals[i]<=vals[j]);const d=vals[i]-vals[j];
    return mkChoice('mt:graph',`How many more ${nm(i)} than ${nm(j)}?`,vis,d,[[vals[i]+vals[j],'That adds them. "How many more" means find the difference.'],[vals[i],`That is how many ${nm(i)} there are. Now take away the ${nm(j)}.`],pics?[counts[i]-counts[j],`That counts pictures. Each picture is ${s}.`]:null,[d+s,`Check: ${vals[j]} + ${d+s} is not ${vals[i]}.`]].filter(Boolean),
      {hint:`${readHint}<br>1. How many ${nm(i)}? 2. How many ${nm(j)}?<br>3. Bigger − smaller.`,explain:`${nm(i)}: ${vals[i]}. ${nm(j)}: ${vals[j]}. ${vals[i]} − ${vals[j]} = ${d}.`});}
  if(q===2){const two=L<3||rnd(2),idx=two?take(times(n,i=>i),2):times(n,i=>i),tot=sumOf(idx.map(i=>vals[i])),names=idx.map(nm);
    const lbl=names.length===2?`${names[0]} and ${names[1]}`:'things';
    const diff=Math.abs(vals[idx[0]]-vals[idx[1]]);
    return mkChoice('mt:graph',`How many ${lbl} are there in all?`,vis,tot,[pics?[sumOf(idx.map(i=>counts[i])),`That counts pictures. Each picture is ${s}.`]:null,idx.length===2&&diff?[diff,'"In all" means add, not take away.']:null,[tot-vals[idx[idx.length-1]],'You missed one group. Add every group asked for.'],[tot+s,'Read each number again, then add.']].filter(Boolean),
      {hint:`${readHint}<br>Find each number, then add them.`,explain:`${idx.map(i=>vals[i]).join(' + ')} = ${tot}.`});}
  const most=rnd(2),best=most?vals.indexOf(Math.max(...vals)):vals.indexOf(Math.min(...vals));
  return mkChoice('mt:graph',`Which has the ${most?'most':'fewest'}?`,vis,`${items[best][0]} ${nm(best)}`,times(n,i=>i).filter(i=>i!==best).map(i=>[`${items[i][0]} ${nm(i)}`,`${mmCap(nm(i))}: ${vals[i]}. ${mmCap(nm(best))}: ${vals[best]}.`]),
    {hint:bar?`Look for the ${most?'tallest':'shortest'} bar.`:`Look for the ${most?'longest':'shortest'} row of pictures.`,explain:`${mmCap(nm(best))} ${most?'has the most':'has the fewest'}: ${vals[best]}.`});
}

/* ================= 4. ROUNDING (Grades 3–4) ================= */
const MM_PNAME={1:'ones',10:'tens',100:'hundreds',1000:'thousands'},MM_TO={10:'ten',100:'hundred',1000:'thousand',10000:'ten thousand'};
const mmRoundTo=(n,P)=>Math.floor(n/P)*P+(n%P>=P/2?P:0);
function genRound(lv){
  const L=mmLv(lv,3,4),P=L===3?pick([10,10,100]):pick([10,100,100,1000]);
  let n;
  for(;;){n=P===10?(L===3?between(12,999):between(101,9999)):P===100?(L===3?between(101,999):between(1001,9999)):between(1001,9999);
    if(rnd(3)===0){const lo=Math.floor(n/P)*P;n=lo+P/2+(P>10?between(0,P/10-1):0)}
    if(n%P)break}
  const lo=Math.floor(n/P)*P,hi=lo+P,d=Math.floor(n/(P/10))%10,ans=d>=5?hi:lo,other=d>=5?lo:hi,dn=MM_PNAME[P/10];
  let dbl=n;for(let q=10;q<=P;q*=10)dbl=mmRoundTo(dbl,q);
  const small=P>10?mmRoundTo(n,P/10):null,big=mmRoundTo(n,P*10);
  return mkChoice('mt:round',`Round ${n} to the nearest ${MM_TO[P]}.`,mmNumLine(lo,hi,10,n,String,{mid:true,label:`number line from ${lo} to ${hi}`}),ans,[
    [other,d===5?'When the digit is 5, round up.':d>5?`${n} is closer to ${hi}. The ${dn} digit ${d} is 5 or more, so round up.`:`${n} is closer to ${lo}. The ${dn} digit ${d} is less than 5, so round down.`],
    dbl!==ans?[dbl,'Do not round twice. Look only at the digit just to the right of the rounding place.']:null,
    small!=null&&small!==ans?[small,`That is rounded to the nearest ${MM_TO[P/10]}. We need the nearest ${MM_TO[P]}.`]:null,
    big>0&&big!==ans&&big!==other?[big,`That is rounded to the nearest ${MM_TO[P*10]}. We need the nearest ${MM_TO[P]}.`]:null,
    [ans+P,`Round to one of the two ${MM_PNAME[P]} next to ${n}: ${lo} or ${hi}.`]].filter(Boolean),
    {hint:`1. ${n} is between ${lo} and ${hi}.<br>2. Halfway is ${lo+P/2}.<br>3. Look at the ${dn} digit: <b>${d}</b>. 5 or more: round up. Less than 5: round down.`,
     explain:`${n} is between ${lo} and ${hi}. The ${dn} digit is ${d}, so it rounds ${d>=5?'up':'down'} to ${ans}.`});
}

/* ================= 5. AREA AND PERIMETER (Grades 3–5) ================= */
// A shape made of unit squares. cells(x,y) says if a square is inside. Labels: [{x,y,t,a}] in grid units.
function mmGridShape(W,H,inside,labels,o={}){
  const c=Math.min(40,380/W,260/H),ox=70,oy=36;let b='';
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(inside(x,y))b+=`<rect x="${mmR(ox+x*c)}" y="${mmR(oy+y*c)}" width="${mmR(c)}" height="${mmR(c)}" fill="${MM_C.panel}" stroke="${o.grid===false?MM_C.panel:MM_C.grid}" stroke-width="1.5"/>`;
  if(o.outline)b+=`<polygon points="${mmPts(o.outline.map(([x,y])=>[ox+x*c,oy+y*c]))}" fill="none" stroke="${MM_C.gold}" stroke-width="4" stroke-linejoin="round"/>`;
  labels.forEach(l=>{b+=mmT(ox+l.x*c+(l.dx||0),oy+l.y*c+(l.dy||0),l.t,{a:l.a||'middle',s:18,c:l.c||MM_C.ink})});
  if(o.center)b+=mmT(ox+W*c/2,oy+H*c/2+7,o.center,{s:18,c:MM_C.green});
  return mmSvg(ox+W*c+90,oy+H*c+40,o.label||'shape on a grid',520,b);
}
function mmRectVis(w,h,lw,lh,o={}){return mmGridShape(w,h,()=>true,[{x:w/2,y:0,dy:-10,t:lw},{x:0,y:h/2,dx:-10,dy:6,a:'end',t:lh}],{outline:[[0,0],[w,0],[w,h],[0,h]],grid:o.grid,center:o.center,label:`rectangle ${lw} by ${lh}`})}
function genAreaPerim(lv){
  const L=mmLv(lv,3,5),unit=L===3?'cm':pick(['cm','m','in','ft']),sq=`square ${unit}`;
  const v=L===3?rnd(2):L===4?rnd(4):rnd(6);
  if(v<=1){let w,h;do{w=between(2,L===3?8:12);h=between(2,L===3?6:9)}while(w*h===2*(w+h));
    const grid=L===3||w*h<=60,vis=mmRectVis(w,h,`${w} ${unit}`,`${h} ${unit}`,{grid}),A=w*h,P=2*(w+h);
    if(v===0)return mkChoice('mt:area',`What is the area of this rectangle?${grid?' Each square is 1 '+sq+'.':''}`,vis,`${A} ${sq}`,
      [[`${P} ${sq}`,'That is the perimeter, the distance around. Area counts the squares inside.'],[`${w+h} ${sq}`,`You added 2 sides. Area = ${h} rows of ${w}.`],[`${w*(h+1)} ${sq}`,`There are ${h} rows, not ${h+1}.`]],
      {hint:`Area = how many squares cover it.<br>1. There are ${h} rows of ${w} squares.<br>2. ${h} × ${w} = ?`,explain:`${h} rows of ${w}: ${h} × ${w} = ${A} ${sq}.`});
    return mkChoice('mt:area','What is the perimeter of this rectangle?',vis,`${P} ${unit}`,
      [[`${A} ${unit}`,'That is the area. Perimeter is the distance around the outside.'],[`${w+h} ${unit}`,'That is only 2 sides. Add all 4 sides.'],[`${2*w+h} ${unit}`,'You missed one side. A rectangle has 4 sides.'],grid?[`${P-4} ${unit}`,'Count the outside edges, not the outside squares.']:null].filter(Boolean),
      {hint:`Perimeter = all the way around.<br>${w} + ${h} + ${w} + ${h} = ?`,explain:`${w} + ${h} + ${w} + ${h} = ${P} ${unit}.`});
  }
  if(v===2||v===3){const w=between(3,12),h=between(2,9),ask=v===2?'area':'perim';
    if(ask==='area'){const A=w*h;
      return mkChoice('mt:area',`The area is ${A} ${sq}. One side is ${w} ${unit}. How long is the other side?`,mmRectVis(w,h,`${w} ${unit}`,'?',{grid:false,center:`Area = ${A} ${sq}`}),`${h} ${unit}`,
        [[`${A-w} ${unit}`,`Area is side × side, so divide: ${A} ÷ ${w}.`],[`${h+1} ${unit}`,`Check: ${w} × ${h+1} = ${w*(h+1)}, not ${A}.`],h>2?[`${h-1} ${unit}`,`Check: ${w} × ${h-1} = ${w*(h-1)}, not ${A}.`]:null].filter(Boolean),
        {hint:`${w} × ? = ${A}<br>Divide: ${A} ÷ ${w} = ?`,explain:`${A} ÷ ${w} = ${h}. Check: ${w} × ${h} = ${A}.`});}
    const P=2*(w+h);
    return mkChoice('mt:area',`The perimeter is ${P} ${unit}. One side is ${w} ${unit}. How long is the other side?`,mmRectVis(w,h,`${w} ${unit}`,'?',{grid:false,center:`Perimeter = ${P} ${unit}`}),`${h} ${unit}`,
      [[`${P-w} ${unit}`,`There are two sides of ${w}. Take both away: ${P} − ${w} − ${w}.`],[`${P-2*w} ${unit}`,`That is both missing sides together. Split it in half.`],[`${h+1} ${unit}`,`Check: ${w} + ${h+1} + ${w} + ${h+1} is not ${P}.`]],
      {hint:`1. Take away the two ${w} sides: ${P} − ${w} − ${w} = ${P-2*w}.<br>2. That is the two other sides. Split in half: ${P-2*w} ÷ 2 = ?`,explain:`${P} − ${2*w} = ${P-2*w}, and ${P-2*w} ÷ 2 = ${h}.`});
  }
  // Grade 5: L-shapes made of two rectangles.
  const W=between(5,10),H=between(4,8),w2=between(2,W-2),h1=between(2,H-2),h2=H-h1,A=W*h1+w2*h2,P=2*(W+H);
  const inside=(x,y)=>y>=h2||x<w2,out=[[0,0],[w2,0],[w2,h2],[W,h2],[W,H],[0,H]];
  const labels=[{x:w2/2,y:0,dy:-10,t:`${w2} ${unit}`},{x:0,y:H/2,dx:-10,dy:6,a:'end',t:`${H} ${unit}`},{x:W/2,y:H,dy:26,t:`${W} ${unit}`},{x:W,y:h2+h1/2,dx:10,dy:6,a:'start',t:`${h1} ${unit}`}];
  const vis=mmGridShape(W,H,inside,labels,{outline:out,label:'L-shaped figure'});
  if(v===4)return mkChoice('mt:area','What is the area of this shape? Each square is 1 '+sq+'.',vis,`${A} ${sq}`,
    [[`${W*H} ${sq}`,'That is the whole big rectangle. The corner is missing, so it is less.'],[`${W*h1+w2*H} ${sq}`,'Some squares were counted twice. Split the shape so the parts do not overlap.'],[`${W+H+w2+h1} ${sq}`,'That adds side lengths. Area counts the squares inside.'],[`${P} ${sq}`,'That is the perimeter, not the area.']],
    {hint:`Split it into two rectangles.<br>1. Bottom: ${W} × ${h1} = ${W*h1}.<br>2. Top: ${w2} × ${h2} = ${w2*h2}. (${h2} = ${H} − ${h1})<br>3. Add them.`,explain:`${W} × ${h1} = ${W*h1}. ${w2} × ${h2} = ${w2*h2}. ${W*h1} + ${w2*h2} = ${A} ${sq}.`});
  return mkChoice('mt:area','What is the perimeter of this shape?',vis,`${P} ${unit}`,
    [[`${W+H+w2+h1} ${unit}`,`Two sides have no labels. Find them first: ${W-w2} and ${h2}.`],[`${A} ${unit}`,'That is the area. Perimeter is the distance around.'],[`${P-h2} ${unit}`,'You missed one side. Count all 6 sides.']],
    {hint:`1. Missing sides: ${W} − ${w2} = ${W-w2} and ${H} − ${h1} = ${h2}.<br>2. Add all 6 sides: ${w2} + ${h2} + ${W-w2} + ${h1} + ${W} + ${H} = ?`,explain:`${w2} + ${h2} + ${W-w2} + ${h1} + ${W} + ${H} = ${P} ${unit}.`});
}

/* ================= 6. MULTI-DIGIT × AND ÷ (Grade 4) ================= */
const mmExpand=n=>digitsOf(n).map((d,i,a)=>d*10**(a.length-1-i)).filter(x=>x);
function mmAreaModel(A,B){
  const cell='background:#1b4254;border:2px solid #3a7389;border-radius:10px;padding:14px 10px;min-width:74px';
  return`<div style="display:grid;grid-template-columns:auto repeat(${A.length},auto);gap:6px;font-weight:700;font-size:1.3rem;text-align:center;align-items:center">`+
    `<span></span>${A.map(a=>`<span style="color:#ffc94d">${a}</span>`).join('')}`+
    B.map(b=>`<span style="color:#6cc6ff;padding-right:6px">${b}</span>${A.map(a=>`<span style="${cell}">${a} × ${b}</span>`).join('')}`).join('')+'</div>';
}
function genMultiDigit(lv){
  const L=mmLv(lv,4,5),v=rnd(3);
  if(v<2){let a,b;
    if(v===0){do{a=between(12,98)}while(a%10===0);b=between(3,9)}
    else if(L===5&&rnd(2)){do{a=between(101,499)}while(a%10===0);do{b=between(12,39)}while(b%10===0)}
    else{do{a=between(12,99)}while(a%10===0);do{b=between(12,L===4?49:99)}while(b%10===0)}
    const A=mmExpand(a),B=mmExpand(b),cells=B.flatMap(y=>A.map(x=>[x,y,x*y])),ans=a*b;
    const miss=pick(cells.slice(1)),diag=b<10?Math.floor(a/10)*b+(a%10)*b:A.length===2?A[0]*B[0]+A[1]*B[1]:null;
    const wr=[[ans-miss[2],`You forgot a box: ${miss[0]} × ${miss[1]} = ${miss[2]}. Add ${cells.length===2?'both':'all '+cells.length} boxes.`]];
    if(b<10)wr.push([Math.floor(a/10)*10*b+a%10,`Multiply the ones too: ${a%10} × ${b} = ${a%10*b}, not ${a%10}.`],[diag,`The ${Math.floor(a/10)} in ${a} means ${Math.floor(a/10)*10}. ${Math.floor(a/10)*10} × ${b} = ${Math.floor(a/10)*10*b}.`]);
    else if(diag!=null)wr.push([diag,`You did tens × tens and ones × ones only. There are ${cells.length} boxes.`]);
    wr.push([ans+10,'Add the boxes again carefully.']);
    return mkChoice('mt:mdig',`${a} × ${b} = ?`,mmAreaModel(A,B)+`<div class="eq sm">${a} × ${b} = <span class="blank">?</span></div>`,ans,wr,
      {hint:`Area model: split the numbers by place.<br>${cells.map((c,i)=>`${i+1}. ${c[0]} × ${c[1]} = ${c[2]}`).join('<br>')}<br>${cells.length+1}. Add all the boxes.`,
       explain:`${cells.map(c=>c[2]).join(' + ')} = ${ans}.`});
  }
  // 3-digit ÷ 1-digit with a remainder (Grade 4), sometimes with a 0 in the quotient.
  const d=between(3,9),qmax=Math.floor((1000-d)/d);let q;
  const zeroQ=times(qmax,i=>i+1).filter(x=>x>=101&&Math.floor(x/10)%10===0&&x%10);
  if(zeroQ.length&&rnd(3)===0)q=pick(zeroQ);else q=between(Math.max(12,Math.ceil(100/d)),qmax);
  const r=between(1,d-1),n=q*d+r,qs=String(q),ans=`${q} R ${r}`;
  const wr=[[`${q-1} R ${r+d}`,`The remainder ${r+d} is bigger than ${d}. Share one more to each group.`]];
  if(q>=100&&qs[1]==='0')wr.push([`${qs[0]+qs[2]} R ${r}`,`Don't skip the 0. ${d} does not go into the tens, so write 0 there.`]);
  wr.push([`${q+1} R ${r}`,`Check: ${q+1} × ${d} + ${r} = ${(q+1)*d+r}, not ${n}.`],[`${q} R ${r===d-1?r-1:r+1}`,`Check: ${q} × ${d} + ${r===d-1?r-1:r+1} = ${q*d+(r===d-1?r-1:r+1)}, not ${n}.`]);
  let left=n;const steps=[];mmExpand(q).forEach(p=>{steps.push(`${d} × ${p} = ${d*p}. Left: ${left} − ${d*p} = ${left-d*p}.`);left-=d*p});
  return mkChoice('mt:mdig',`${n} ÷ ${d} = ?`,`<div class="eq">${n} ÷ ${d} = <span class="blank">?</span></div>`+barHTML(n,times(d,()=>({v:q,label:'?'})).concat([{v:r,label:'R',cls:'gone'}]),n),ans,wr,
    {hint:`Take away groups of ${d}, biggest first:<br>${steps.map((s,i)=>`${i+1}. ${s}`).join('<br>')}<br>${steps.length+1}. ${r} is left. It is smaller than ${d}, so it is the remainder.<br>${steps.length+2}. Add the parts: ${mmExpand(q).join(' + ')}.`,
     explain:`${n} ÷ ${d} = ${q} R ${r}. Check: ${q} × ${d} + ${r} = ${n}.`});
}

/* ================= 7. TIMES AS MANY (Grade 4) ================= */
function mmTimesBars(nA,k,unitLab,totLab,nB,bLab){
  const x0=86,U=Math.min(64,430/k);let b='';
  const row=(y,n,lab,col)=>{let s='';for(let i=0;i<n;i++)s+=`<rect x="${mmR(x0+i*U)}" y="${y}" width="${mmR(U)}" height="40" rx="6" fill="${col}" stroke="${MM_C.dark}" stroke-width="2"/>`+mmT(x0+i*U+U/2,y+27,lab,{s:U<46?14:17,c:MM_C.dark});return s};
  b+=mmT(x0-10,94,esc(nA),{a:'end',s:16,c:MM_C.muted})+row(68,k,unitLab,MM_C.blue);
  b+=mmLine(x0,58,x0+k*U,58,MM_C.gold,2)+mmLine(x0,52,x0,64,MM_C.gold,2)+mmLine(x0+k*U,52,x0+k*U,64,MM_C.gold,2)+mmT(x0+k*U/2,46,totLab,{s:17,c:MM_C.gold});
  b+=mmT(x0-10,150,esc(nB),{a:'end',s:16,c:MM_C.muted})+row(124,1,bLab,MM_C.pink);
  return mmSvg(x0+Math.max(k*U,U)+20,176,'comparison bars',560,b);
}
function genTimesAsMany(lv){
  const[A,B]=mmOthers(),[,it]=tItem(),v=rnd(4);let b,k;
  do{b=between(2,12);k=between(2,9)}while(b*k>100||(k-1)*b===k);
  const a=k*b,barHint=`Draw 1 bar for ${B}. ${A} gets ${k} bars the same size.`;
  if(v===0)return mkChoice('mt:times',`${B} has ${b} ${it}. ${A} has ${k} times as many. How many does ${A} have?`,mmTimesBars(A,k,b,'?',B,b),a,
    [[b+k,`${k} times as many means ${k} groups of ${b}, not ${k} more.`],[(k+1)*b,`${A}'s bar is ${k} units long, not ${k+1}.`],[a-b,`That is how many more ${A} has. The question asks how many ${A} has.`]],
    {hint:`${barHint}<br>${k} × ${b} = ?`,explain:`${k} times as many as ${b}: ${k} × ${b} = ${a}.`});
  if(v===1)return mkChoice('mt:times',`${A} has ${a} ${it}. That is ${k} times as many as ${B}. How many does ${B} have?`,mmTimesBars(A,k,'?',a,B,'?'),b,
    [[a*k,`${B} has fewer, so divide: ${a} ÷ ${k}.`],[a-k,`That would be "${k} fewer". "Times as many" means divide into ${k} equal units.`],[b+1,`Check: ${k} × ${b+1} = ${k*(b+1)}, not ${a}.`]],
    {hint:`${A}'s ${a} is split into ${k} equal units. ${B} has 1 unit.<br>${a} ÷ ${k} = ?`,explain:`${a} ÷ ${k} = ${b}. Check: ${k} × ${b} = ${a}.`});
  if(v===2)return mkChoice('mt:times',`${A} has ${a} ${it}. ${B} has ${b}. Which is true?`,mmTimesBars(A,k,b,a,B,b),`${A} has ${k} times as many as ${B}`,
    [[`${A} has ${k} more than ${B}`,`${a} − ${b} = ${a-b}. ${A} has ${a-b} more, not ${k} more.`],[`${A} has ${a-b} times as many as ${B}`,`${a-b} is how many more. ${a-b} × ${b} is not ${a}.`],[`${B} has ${k} times as many as ${A}`,`${B} has fewer. ${A} has the bigger amount.`]],
    {wide:true,hint:`Count ${A}'s units: how many ${b}s make ${a}? That is "times as many".<br>${a} − ${b} is "how many more".`,explain:`${k} × ${b} = ${a}, so ${A} has ${k} times as many. (${A} has ${a-b} more.)`});
  return mkChoice('mt:times',`${B} has ${b} ${it}. ${A} has ${k} times as many. How many more does ${A} have?`,mmTimesBars(A,k,b,'?',B,b),a-b,
    [[a,`That is how many ${A} has. Now take away ${B}'s ${b}.`],[k-1,`${A} has ${k-1} more units. Each unit is ${b}.`],[b+k,'"Times as many" means multiply first.']],
    {hint:`1. ${A}: ${k} × ${b} = ${a}.<br>2. How many more: ${a} − ${b} = ?`,explain:`${k} × ${b} = ${a}. ${a} − ${b} = ${a-b} more.`});
}

/* ================= 8. ANGLES (Grade 4) ================= */
const mmPt=(cx,cy,L,deg)=>[cx+L*Math.cos(deg*Math.PI/180),cy-L*Math.sin(deg*Math.PI/180)];
function mmArc(cx,cy,r,a1,a2){const p=mmPt(cx,cy,r,a1),q=mmPt(cx,cy,r,a2);return`M${mmR(p[0])} ${mmR(p[1])} A${r} ${r} 0 ${a2-a1>180?1:0} 0 ${mmR(q[0])} ${mmR(q[1])}`}
function mmAngleSVG(theta,rot,L1,L2,o={}){
  const cx=150,cy=135,p1=mmPt(cx,cy,L1,rot),p2=mmPt(cx,cy,L2,rot+theta);let b='';
  if(theta===90&&!o.noMark){const u=mmPt(0,0,16,rot),w=mmPt(0,0,16,rot+90);b+=`<polygon points="${mmPts([[cx,cy],[cx+u[0],cy+u[1]],[cx+u[0]+w[0],cy+u[1]+w[1]],[cx+w[0],cy+w[1]]])}" fill="none" stroke="${MM_C.gold}" stroke-width="2.5"/>`}
  else b+=`<path d="${mmArc(cx,cy,30,rot,rot+theta)}" fill="none" stroke="${MM_C.gold}" stroke-width="3"/>`;
  b+=mmLine(cx,cy,p1[0],p1[1],MM_C.blue,5,' stroke-linecap="round"')+mmLine(cx,cy,p2[0],p2[1],MM_C.blue,5,' stroke-linecap="round"')+`<circle cx="${cx}" cy="${cy}" r="5" fill="${MM_C.ink}"/>`;
  return mmSvg(300,270,'an angle',340,b);
}
function genAngles(lv){
  const v=rnd(4),rot=pick([0,0,0,20,-15,35,160]);
  if(v<=1){const type=pick(['acute','right','obtuse','straight','acute','obtuse']),theta={acute:5*between(5,14),right:90,obtuse:5*between(22,32),straight:180}[type];
    const longShort=type==='acute'?[between(118,130),between(115,130)]:type==='obtuse'?[between(78,92),between(75,92)]:[between(95,120),between(95,120)];
    const desc={acute:'less than a square corner (under 90°)',right:'exactly a square corner (90°)',obtuse:'more than a square corner, but not a straight line (between 90° and 180°)',straight:'a straight line (180°)'};
    const short={acute:'less than 90°',right:'exactly 90°',obtuse:'between 90° and 180°',straight:'180°, a flat line'};
    const trick=type==='acute'?' Long arms do not make an angle bigger.':type==='obtuse'?' Short arms do not make an angle smaller.':'';
    const r=mkChoice('mt:angle','What kind of angle is this?',mmAngleSVG(theta,rot,...longShort),mmCap(type),[],{fixed:true,
      hint:'Compare it with the corner of a sheet of paper. That is a right angle (90°).<br>Smaller = acute. Exactly = right. Bigger = obtuse. A flat line = straight.',explain:`It is ${desc[type]}, so it is ${type==='acute'||type==='obtuse'?'an':'a'} ${type} angle.`});
    r.opts=['acute','right','obtuse','straight'].map(t=>({t:mmCap(t),ok:t===type,label:{acute:'under 90°',right:'90°',obtuse:'90° to 180°',straight:'180°'}[t],why:t===type?null:`${mmCap(t)} means ${short[t]}. This angle is ${short[type]}.${trick}`}));
    return r;}
  if(v===2){const turns=[[90,'1/4'],[180,'1/2'],[270,'3/4'],[360,'full']],[deg,fr]=pick(turns),cx=150,cy=135,R=90;
    let b=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${MM_C.grid}" stroke-width="2" stroke-dasharray="6 5"/>`;
    b+=deg===360?`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${MM_C.gold}" fill-opacity=".35" stroke="${MM_C.gold}" stroke-width="3"/>`:`<path d="M${cx} ${cy} L${cx+R} ${cy} ${mmArc(cx,cy,R,0,deg).replace(/^M[^A]*/,'')} Z" fill="${MM_C.gold}" fill-opacity=".35" stroke="${MM_C.gold}" stroke-width="3"/>`;
    b+=mmLine(cx,cy,cx+R+14,cy,MM_C.blue,5,' stroke-linecap="round"')+`<circle cx="${cx}" cy="${cy}" r="5" fill="${MM_C.ink}"/>`;
    const vis=mmSvg(300,270,'a turn',300,b),frTxt=f=>f==='full'?'a full turn':`a ${f} turn`;
    if(rnd(2))return mkChoice('mt:angle','A full turn is 360°. How many degrees is this turn?',vis,`${deg}°`,
      [[`${deg/360*100}°`,'A full turn is 360°, not 100°. So a quarter turn is 360 ÷ 4 = 90°.']].concat(turns.filter(t=>t[0]!==deg).slice(0,2).map(t=>[`${t[0]}°`,`${t[0]}° is ${frTxt(t[1])}. Look at how much of the circle is shaded.`])),
      {hint:'A full turn is 360°.<br>1/4 turn = 360 ÷ 4 = 90°.<br>How many quarter turns are shaded?',explain:`This is ${frTxt(fr)}: ${deg}°.`});
    const name=f=>f==='full'?'Full turn':`${f} turn`;
    return mkChoice('mt:angle','What fraction of a full turn is shaded?',vis,name(fr),turns.filter(t=>t[1]!==fr).map(t=>[name(t[1]),`${name(t[1])} is ${t[0]}°. Count the quarters of the circle that are shaded.`]),
      {hint:'Split the circle into 4 equal quarters. How many quarters are shaded?',explain:`${name(fr)} = ${deg}°.`});}
  const T=pick([90,180]),a=T===90?5*between(4,14):5*between(6,30),bb=T-a,cx=T===90?60:150,cy=T===90?230:190,m=0,RL=T===90?200:135;
  const p0=mmPt(cx,cy,RL,m),p1=mmPt(cx,cy,RL,m+a),p2=mmPt(cx,cy,RL,m+T),la=mmPt(cx,cy,64,m+a/2),lb=mmPt(cx,cy,74,m+a+bb/2);
  let b=`<path d="${mmArc(cx,cy,40,m,m+a)}" fill="none" stroke="${MM_C.gold}" stroke-width="3"/><path d="${mmArc(cx,cy,50,m+a,m+T)}" fill="none" stroke="${MM_C.pink}" stroke-width="3"/>`;
  [p0,p1,p2].forEach(p=>{b+=mmLine(cx,cy,p[0],p[1],MM_C.blue,5,' stroke-linecap="round"')});
  b+=`<circle cx="${cx}" cy="${cy}" r="5" fill="${MM_C.ink}"/>`+mmT(la[0],la[1]+6,`${a}°`,{s:17,c:MM_C.gold})+mmT(lb[0],lb[1]+6,'?',{s:20,c:MM_C.pink});
  const other=(T===90?180:90)-a;
  return mkChoice('mt:angle',`The whole angle is ${T}°${T===90?' (a right angle)':' (a straight line)'}. One part is ${a}°. What is the other part?`,mmSvg(300,250,'an angle split into two parts',340,b),`${bb}°`,
    [[`${T+a}°`,'The parts are smaller than the whole. Subtract.'],other>0?[`${other}°`,T===90?'The whole is a right angle, 90°, not a straight line.':'The whole is a straight line, 180°, not a right angle.']:null,a!==bb?[`${a}°`,'The two parts are not the same size. Subtract to find the other part.']:null,[`${bb+10}°`,`Check: ${a} + ${bb+10} = ${a+bb+10}, not ${T}.`]].filter(Boolean),
    {hint:`The two parts add up to the whole.<br>${a}° + ? = ${T}°<br>${T} − ${a} = ?`,explain:`${T}° − ${a}° = ${bb}°. Check: ${a}° + ${bb}° = ${T}°.`});
}

/* ================= 9. DECIMALS (Grades 4–5) ================= */
function mmGrid100(k,x0=0,col=MM_C.gold){let b='';const c=22;
  for(let i=0;i<100;i++){const cx=Math.floor(i/10),ry=i%10;b+=`<rect x="${x0+2+cx*c}" y="${2+ry*c}" width="${c}" height="${c}" fill="${i<k?col:MM_C.panel}" stroke="${MM_C.grid}" stroke-width="1.5"/>`}
  return b+`<rect x="${x0+2}" y="2" width="${10*c}" height="${10*c}" fill="none" stroke="${MM_C.ink}" stroke-width="3"/>`}
const mmGridSVG=(k,label)=>mmSvg(224,224,label||'hundred grid',240,mmGrid100(k));
function mmDecCompare(){
  const t=between(2,9),kind=pick(['trap','trap','bigger','equal']);let h;
  if(kind==='trap'){do{h=between((t-1)*10+1,t*10-1)}while(h%10===0)}else if(kind==='bigger'){h=t*10+between(1,9);if(h>99)h=t*10-5}else h=t*10;
  const L={txt:`0.${t}`,v:t*10},Rr={txt:kind==='equal'?`0.${t}0`:mmHund(h),v:h},flip=rnd(2),left=flip?Rr:L,right=flip?L:Rr;
  const sign=left.v<right.v?'<':left.v>right.v?'>':'=';
  const vis=mmSvg(500,250,'two hundred grids',500,mmGrid100(left.v,10,MM_C.gold)+mmGrid100(right.v,266,MM_C.blue)+mmT(122,246,left.txt,{s:18})+mmT(378,246,right.txt,{s:18}))+
    `<div class="cmp"><div><b class="ex">${left.txt}</b></div><span class="blank">?</span><div><b class="ex">${right.txt}</b></div></div>`;
  const expl=`${left.txt} = ${left.v} hundredths. ${right.txt} = ${right.v} hundredths. So ${left.txt} ${sign} ${right.txt}.`;
  const r=mkChoice('mt:dec','Which sign goes in the middle?',vis,sign,[],{fixed:true,hint:`Make both numbers hundredths: 0.${t} = 0.${t}0.<br>Then compare ${left.v} hundredths and ${right.v} hundredths.`,explain:expl});
  const trapWhy=kind==='trap'?` A longer decimal is not always bigger: 0.${t} = 0.${t}0.`:'';
  r.opts=['<','=','>'].map(x=>({t:x,ok:x===sign,label:{'<':'less than','=':'equal to','>':'greater than'}[x],why:x===sign?null:`Compare the same places.${trapWhy} ${left.txt} is ${left.v} hundredths and ${right.txt} is ${right.v} hundredths.`}));
  return r;
}
function genDecimals(lv){
  const L=mmLv(lv,4,5),v=L===4?rnd(4):rnd(8);
  if(L===5&&v>=3&&v<=6){
    if(v===3){// round to the nearest tenth or whole number
      const toWhole=rnd(2);let H;do{H=between(101,1999);if(rnd(3)===0)H=toWhole?Math.floor(H/100)*100+50+between(0,9):Math.floor(H/10)*10+5}while(toWhole?H%100===0:H%10===0);
      const P=toWhole?100:10,lo=Math.floor(H/P)*P,hi=lo+P,d=toWhole?Math.floor(H/10)%10:H%10,ans=H%P>=P/2?hi:lo,other=ans===hi?lo:hi,f=x=>toWhole?String(x/100):mmFix(x,1);
      const wrongPlace=toWhole?mmFix(mmRoundTo(H,10),1):String(mmRoundTo(H,100)/100);
      return mkChoice('mt:dec',`Round ${mmHund(H)} to the nearest ${toWhole?'whole number':'tenth'}.`,mmNumLine(lo,hi,10,H,x=>x===H?mmHund(H):toWhole?String(x/100):x===(lo+hi)/2?mmFix(x,2):mmFix(x,1),{mid:true,label:'number line'}),f(ans),
        mmNotSame(f(ans),[[f(other),d===5?'When the digit is 5, round up.':`Look at the ${toWhole?'tenths':'hundredths'} digit: ${d}. ${d>=5?'5 or more rounds up.':'Less than 5 rounds down.'}`],
         [wrongPlace,`That is rounded to the nearest ${toWhole?'tenth':'whole number'}. We need the nearest ${toWhole?'whole number':'tenth'}.`],
         [f(ans+P),`Round to one of the two numbers next to it: ${f(lo)} or ${f(hi)}.`]]),
        {hint:`1. It is between ${f(lo)} and ${f(hi)}.<br>2. Look at the ${toWhole?'tenths':'hundredths'} digit: <b>${d}</b>.<br>3. 5 or more: round up. Less than 5: round down.`,explain:`${mmHund(H)} rounds ${ans===hi?'up':'down'} to ${f(ans)}.`});
    }
    if(v===4){// add with place-value alignment
      let a,b,ans,bad,whole=rnd(4)===0;
      do{if(whole){a=between(2,9)*100;do{b=between(11,99)}while(b%10===0)}else{do{a=between(101,899)}while(a%10===0);do{b=between(1,59)*10}while(b%100===0)}
        ans=a+b;bad=whole?a/100+b:a+b/10}while(!Number.isInteger(bad)||bad===ans);
      const A=mmHund(a),B=mmHund(b),col=x=>mmFix(x,2).padStart(5,' ');
      return mkChoice('mt:dec',`${A} + ${B} = ?`,`<div class="eq">${A} + ${B} = <span class="blank">?</span></div>`,mmHund(ans),
        [[mmHund(bad),whole?`${A} is ${A} wholes. Line up the decimal points: ${A}.00 + ${B}.`:`Line up the decimal points. Write ${B} as ${mmFix(b,2)}.`],[mmHund(ans+10),'Check the tenths column again.'],[mmHund(ans+100),'Check the ones column again.']],
        {hint:`Line up the decimal points. Fill empty places with 0:<br><pre style="font-size:1.3rem;margin:4px 0">  ${col(a)}\n+ ${col(b)}</pre>Add each column, right to left.`,explain:`${mmFix(a,2)} + ${mmFix(b,2)} = ${mmFix(ans,2)}${mmFix(ans,2)!==mmHund(ans)?` = ${mmHund(ans)}`:''}.`});
    }
    if(v===5){// subtract: 5.3 − 2.15
      let a,b;do{b=between(101,499)}while(b%10===0);do{a=between(Math.ceil((b+60)/10),99)*10}while(a%100===0);
      const ans=a-b,bad=(a-(b-b%10))+b%10,A=mmHund(a),B=mmHund(b),col=x=>mmFix(x,2).padStart(5,' ');
      return mkChoice('mt:dec',`${A} − ${B} = ?`,`<div class="eq">${A} − ${B} = <span class="blank">?</span></div>`,mmHund(ans),
        [bad!==ans?[mmHund(bad),`Write ${A} as ${mmFix(a,2)}. Then 0 − ${b%10} needs a trade from the tenths.`]:null,[mmHund(a+b),'That adds. Take away instead.'],[mmHund(ans+10),'Check the tenths column again.'],[mmHund(ans+100),'Check the ones column again.']].filter(Boolean),
        {hint:`Line up the decimal points. Write ${A} as ${mmFix(a,2)}:<br><pre style="font-size:1.3rem;margin:4px 0">  ${col(a)}\n− ${col(b)}</pre>Subtract each column, right to left. Trade when you need to.`,explain:`${mmFix(a,2)} − ${mmFix(b,2)} = ${mmHund(ans)}.`});
    }
    // × or ÷ by 10 and 100
    let T;do{T=between(11,99)}while(T%10===0);const X=`${Math.floor(T/10)}.${T%10}`,op=pick(['×10','×100','÷10']);
    if(op==='×10')return mkChoice('mt:dec',`${X} × 10 = ?`,`<div class="eq">${X} × 10 = <span class="blank">?</span></div>`,T,
      [[`${X}0`,'Adding a 0 at the end of a decimal does not change it. Each digit moves one place left.'],[T*10,'× 10 moves each digit one place, not two.'],[mmHund(T),'× 10 makes the number bigger, not smaller.']],
      {hint:'× 10: every digit moves one place to the left. The number gets 10 times bigger.',explain:`${X} × 10 = ${T}.`});
    if(op==='×100')return mkChoice('mt:dec',`${X} × 100 = ?`,`<div class="eq">${X} × 100 = <span class="blank">?</span></div>`,T*10,
      [[T,'That is × 10. × 100 moves each digit two places.'],[`${X}00`,'Adding zeros at the end of a decimal does not change it.'],[T*100,'× 100 moves each digit two places, not three.']],
      {hint:'× 100: every digit moves two places to the left.',explain:`${X} × 100 = ${T*10}.`});
    return mkChoice('mt:dec',`${X} ÷ 10 = ?`,`<div class="eq">${X} ÷ 10 = <span class="blank">?</span></div>`,mmHund(T),
      [[T,'÷ 10 makes the number smaller, not bigger.'],[`${Math.floor(T/10)}.0${T%10}`,'Every digit moves one place to the right, the whole number too.'],[`0.0${T}`,'÷ 10 moves each digit one place, not two.']],
      {hint:'÷ 10: every digit moves one place to the right. The number gets 10 times smaller.',explain:`${X} ÷ 10 = ${mmHund(T)}.`});
  }
  if(v===0){const tenths=rnd(3)===0;let k;if(tenths)k=10*between(1,9);else do{k=between(1,99)}while(k%10===0);
    const t=Math.floor(k/10),o=k%10,ans=mmHund(k);
    const wr=tenths?[[`0.0${t}`,`Each full column is 1 tenth. ${t} columns = ${t} tenths = 0.${t}.`],[String(t),'The whole grid is 1. The answer is less than 1.'],[`0.${t+1<10?t+1:t-1}`,'Count the full columns again.']]
      :k<10?[[`0.${k}`,`${k} hundredths is 0.0${k}. 0.${k} would be ${k} tenths.`],[String(k),'The whole grid is 1. The answer is less than 1.'],[mmHund(k+10),'Count the small squares again.']]
      :[o?[mmHund(o*10+t),'Count the full columns first. Each column is 1 tenth.']:null,[String(k),'The whole grid is 1. The answer is less than 1.'],[`${t}.${o}`,'That is more than 1 whole grid.'],[mmHund(k+1),'Count the small squares again.']].filter(Boolean);
    return mkChoice('mt:dec','The whole grid is 1. What decimal is shaded?',mmGridSVG(k),ans,wr,
      {hint:`1. Each full column is 1 tenth (0.1).<br>2. Each small square is 1 hundredth (0.01).<br>3. Count the columns, then the extra squares.`,explain:o?`${t} tenths and ${o} hundredths = ${k} hundredths = ${ans}.`:`${t} full columns = ${t} tenths = ${ans}.`});}
  if(v===1){const hund=rnd(2),k=hund?(()=>{let x;do{x=between(1,99)}while(x%10===0);return x})():between(1,9),den=hund?100:10,dec=hund?mmHund(k):`0.${k}`,fr=`${k}/${den}`;
    if(rnd(2)){const wr=hund?[[`${k}/10`,`${dec} has two digits after the point. That is hundredths.`],k>9?[`${Math.floor(k/10)}/${k%10}`,`The point does not split the digits into top and bottom.`]:[`${k}/1000`,'Two digits after the point is hundredths, not thousandths.'],[`1/${k}`,`The point does not mean "one over". ${dec} means ${k} hundredths.`]]
        :[[`${k}/100`,`${dec} has one digit after the point. That is tenths.`],[`1/${k}`,`The point does not mean "one over". ${dec} means ${k} tenths.`],[`${k*10}/10`,`${k*10}/10 is ${k} wholes. ${dec} is less than 1.`]];
      return mkChoice('mt:dec',`Which fraction equals ${dec}?`,mmGridSVG(hund?k:k*10),fr,mmNotSame(fr,wr),{hint:`Read it: ${dec} is "${k} ${hund?'hundredths':'tenths'}".<br>${hund?'Two digits':'One digit'} after the point = ${hund?'hundredths (/100)':'tenths (/10)'}.`,explain:`${dec} = ${k} ${hund?'hundredths':'tenths'} = ${fr}.`});}
    const wr=hund?[k<10?[`0.${k}`,`${k}/100 is ${k} hundredths: 0.0${k}.`]:[`${Math.floor(k/10)}.${k%10}`,'That is more than 1. The fraction is less than 1.'],[String(k),`${fr} is less than 1.`],[`${k}.100`,'The bottom number tells the place. It is not written after the point.']]
      :[[`0.0${k}`,`${fr} is ${k} tenths: one place after the point.`],[`${k}.10`,'The bottom number tells the place. It is not written after the point.'],[String(k),`${fr} is less than 1.`]];
    return mkChoice('mt:dec',`Write ${fr} as a decimal.`,mmGridSVG(hund?k:k*10),dec,mmNotSame(dec,wr),{hint:`${fr} is ${k} ${hund?'hundredths':'tenths'}.<br>${hund?'Hundredths use 2 places after the point.':'Tenths use 1 place after the point.'}`,explain:`${fr} = ${dec}.`});}
  if(v===2)return mmDecCompare();
  if(L===4){const t=between(1,9);
    return mkChoice('mt:dec','What decimal is at the dot?',mmNumLine(0,10,10,t,x=>x===t?'?':String(x/10),{pointLabel:'?',label:'number line from 0 to 1'}),`0.${t}`,
      [[`0.0${t}`,'Each jump is 1 tenth (0.1), not 1 hundredth.'],[String(t),'The line goes from 0 to 1. The dot is less than 1.'],[`0.${t<9?t+1:t-1}`,'Count the jumps from 0 again.']],
      {hint:'The line from 0 to 1 is cut into 10 equal jumps. Each jump is 0.1. Count the jumps from 0.',explain:`${t} jumps of 0.1 = 0.${t}.`});}
  // Grade 5: hundredths between two tenths
  const lo=between(1,49)*10,o=between(1,9),H=lo+o;
  return mkChoice('mt:dec','What decimal is at the dot?',mmNumLine(lo,lo+10,10,H,x=>x===H?'?':mmFix(x,1),{pointLabel:'?',label:'number line'}),mmHund(H),
    [[mmHund(lo+o*10),'Each small jump is 0.01, not 0.1.'],[mmHund(H+1),'Count the small jumps again.'],[mmHund(H+100),'Look at the whole number part again.']],
    {hint:`From ${mmFix(lo,1)} to ${mmFix(lo+10,1)} is 0.1, cut into 10 jumps. Each jump is 0.01.`,explain:`${mmFix(lo,1)} + ${o} × 0.01 = ${mmHund(H)}.`});
}

/* ================= 10. FRACTION OPERATIONS (Grades 4–5) ================= */
function genFracOps(lv){
  const L=mmLv(lv,4,5),v=L===4?rnd(5):(rnd(4)===0?rnd(5):5+rnd(5)),G=MM_C.gold,B=MM_C.blue,P=MM_C.pink;
  if(v===0){let n,m;do{n=pick([2,3,4,5,6]);m=pick([2,3,4])}while(n*m>12);const k=between(1,n-1),N=n*m,ans=k*m;
    return mkChoice('mt:fop',`Fill in the blank: ${k}/${n} = ?/${N}`,mmBars([{n,fill:mmFill(n,[[k,G]]),label:`${k}/${n}`,mark:k/n},{n:N,fill:mmFill(N,[]),label:`?/${N}`,mark:k/n}],'fraction bars')+`<div class="eq sm">${k}/${n} = <span class="blank">?</span>/${N}</div>`,ans,
      [[k+N-n,`You added ${N-n} to the bottom and the top. Multiply both by ${m} instead.`],[k,'The parts are smaller now, so you need more of them.'],[ans+1,'Count the small parts to the left of the dashed line again.']],
      {hint:`1. Each 1/${n} part is cut into ${m} smaller parts.<br>2. ${n} × ${m} = ${N} on the bottom, so do the same on top: ${k} × ${m} = ?`,explain:`${k}/${n} = ${k}×${m}/${n}×${m} = ${ans}/${N}.`});}
  if(v===1||v===2){const n=pick([5,6,8,10,12]);let a,b;
    if(v===1){a=between(1,n-2);b=between(1,n-1-a);const ans=`${a+b}/${n}`;
      return mkChoice('mt:fop',`${a}/${n} + ${b}/${n} = ?`,mmBars([{n,fill:mmFill(n,[[a,G],[b,B]]),label:`${a}/${n}+${b}/${n}`}],'fraction bar',{x0:120}),ans,
        mmNotSame(ans,[[`${a+b}/${2*n}`,`Add the tops only. The bottom number is the size of the parts. It stays ${n}.`],a*b!==a+b?[`${a*b}/${n}`,'Add the parts. Do not multiply.']:null,[`${a+b+1}/${n}`,'Count the shaded parts again.']]),
        {hint:`The parts are all ${mmDen(n)}.<br>${a} ${mmDen(n)} + ${b} ${mmDen(n)} = ? ${mmDen(n)}`,explain:`${a} + ${b} = ${a+b}, so ${a}/${n} + ${b}/${n} = ${ans}.`});}
    a=between(2,n-1);b=between(1,a-1);const ans=`${a-b}/${n}`;
    return mkChoice('mt:fop',`${a}/${n} − ${b}/${n} = ?`,mmBars([{n,fill:mmFill(n,[[a-b,G],[b,P]]),label:`${a}/${n}`}],'fraction bar')+`<div class="eq sm">Take away the ${b} pink part${b>1?'s':''}.</div>`,ans,
      mmNotSame(ans,[[`${a+b}/${n}`,`That adds. Take ${b} parts away.`],[`${a}/${n}`,`You still need to take away the ${b} part${b>1?'s':''}.`],[`${a-b}/${2*n}`,`The parts are still ${mmDen(n)}. The bottom number stays ${n}.`],[`${a-b+1}/${n}`,'Count the parts that are left again.']]),
      {hint:`The parts are all ${mmDen(n)}.<br>${a} ${mmDen(n)} − ${b} ${mmDen(n)} = ? ${mmDen(n)}`,explain:`${a} − ${b} = ${a-b}, so ${a}/${n} − ${b}/${n} = ${ans}.`});}
  if(v===3||v===4){const n=pick([2,3,4,5,6,8]),w=between(1,3),r=between(1,n-1),top=w*n+r,mixed=`${w} ${r}/${n}`,imp=`${top}/${n}`;
    const vis=mmBars(times(w+1,i=>({n,fill:mmFill(n,[[i<w?n:r,G]])})),'fraction bars',{x0:20})+`<div class="eq sm">${v===3?mixed:imp} = <span class="blank">?</span></div>`;
    if(v===3)return mkChoice('mt:fop',`Write ${mixed} as an improper fraction.`,vis,imp,
      mmNotSame(imp,[w*r+n!==top?[`${w*r+n}/${n}`,`Multiply the whole number by the bottom number: ${w} × ${n}.`]:null,[`${w+r}/${n}`,`Each whole is ${n}/${n}. ${w} whole${w>1?'s':''} = ${w*n}/${n}.`],[`${w*n}/${n}`,`You forgot the extra ${r}/${n}.`],[`${r}/${n}`,`You forgot the ${w} whole${w>1?'s':''}.`],[`${top+1}/${n}`,'Count all the shaded parts again.']].filter(Boolean)),
      {hint:`1. Each whole bar has ${n} parts. ${w} × ${n} = ${w*n}.<br>2. Add the extra ${r}: ${w*n} + ${r} = ?<br>3. The bottom stays ${n}.`,explain:`${w} × ${n} + ${r} = ${top}, so ${mixed} = ${imp}.`});
    return mkChoice('mt:fop',`Write ${imp} as a mixed number.`,vis,mixed,
      mmNotSame(mixed,[[`${w+1} ${r}/${n}`,`${w+1} wholes would be ${(w+1)*n}/${n}. That is too many.`],r!==w&&w<n?[`${r} ${w}/${n}`,'The whole number is how many full bars. The leftover goes on top.']:null,n-r!==r?[`${w} ${n-r}/${n}`,`Leftover: ${top} − ${w*n} = ${r}.`]:[`${w} ${r+1>=n?r-1:r+1}/${n}`,`Leftover: ${top} − ${w*n} = ${r}.`]].filter(Boolean)),
      {hint:`1. How many full groups of ${n} fit in ${top}? ${n} × ${w} = ${w*n}.<br>2. What is left over? ${top} − ${w*n} = ?`,explain:`${top} ÷ ${n} = ${w} R ${r}, so ${imp} = ${mixed}.`});}
  if(v===5||v===6){// unlike denominators
    const pairs=[[2,4],[2,6],[2,8],[3,6],[4,8],[2,3],[3,4],[2,5],[5,10],[3,12],[4,12],[6,12],[2,10]];
    let b,d,a,c,lcd,A,C;for(let i=0;i<50;i++){[b,d]=shuffle(pick(pairs));a=between(1,b-1);c=between(1,d-1);lcd=b*d/mmGcd(b,d);A=a*lcd/b;C=c*lcd/d;if(v===5?A+C<=lcd+lcd/2:A>C)break}
    if(v===6&&A<=C){[a,b,c,d,A,C]=[c,d,a,b,C,A]}
    const add=v===5||A<=C,res=add?A+C:A-C,ans=`${res}/${lcd}`,op=add?'+':'−',g=mmGcd(res,lcd);
    const wr=add?[[`${a+c}/${b+d}`,'Do not add the bottoms. Make the parts the same size first.'],[`${a+c}/${lcd}`,`Change the tops too: ${a}/${b} = ${A}/${lcd}.`],[`${res+1}/${lcd}`,'Check your adding.']]
      :[a>c&&b>d?[`${a-c}/${b-d}`,'Do not subtract the bottoms. Make the parts the same size first.']:null,a>c?[`${a-c}/${lcd}`,`Change the tops too: ${a}/${b} = ${A}/${lcd}.`]:null,[`${A+C}/${lcd}`,'That adds. Take away instead.'],[`${res+1}/${lcd}`,'Check your subtracting.']].filter(Boolean);
    return mkChoice('mt:fop',`${a}/${b} ${op} ${c}/${d} = ?`,mmBars([{n:b,fill:mmFill(b,[[a,G]]),label:`${a}/${b}`},{n:d,fill:mmFill(d,[[c,B]]),label:`${c}/${d}`},{n:lcd,fill:mmFill(lcd,[]),label:`?/${lcd}`}],'fraction bars'),ans,mmNotSame(ans,wr),
      {hint:`1. Make the parts the same size: ${mmDen(lcd)}.<br>2. ${a}/${b} = ${A}/${lcd} and ${c}/${d} = ${C}/${lcd}.<br>3. ${A}/${lcd} ${op} ${C}/${lcd} = ?`,explain:`${A}/${lcd} ${op} ${C}/${lcd} = ${ans}.${g>1?` That is the same as ${res/g}/${lcd/g}.`:''}`});}
  if(v===7){const k=between(2,6),b=pick([2,3,4,5,6,8]),a=between(1,b-1),ans=`${k*a}/${b}`;
    return mkChoice('mt:fop',`${k} × ${a}/${b} = ?`,mmBars(times(k,()=>({n:b,fill:mmFill(b,[[a,G]])})),'fraction bars',{x0:20})+`<div class="eq sm">${k} groups of ${a}/${b}</div>`,ans,
      mmNotSame(ans,[[`${k*a}/${k*b}`,`Only the top is multiplied: ${k} groups of ${a} ${mmDen(b)} = ${k*a} ${mmDen(b)}.`],[`${a}/${k*b}`,`Multiplying by ${k} makes it bigger, not smaller.`],[`${k+a}/${b}`,'Times, not plus.']]),
      {hint:`${k} × ${a}/${b} means ${k} groups of ${a}/${b}.<br>${times(k,()=>`${a}/${b}`).join(' + ')} = ? ${mmDen(b)}`,explain:`${k} × ${a} = ${k*a}, so ${k} × ${a}/${b} = ${ans}${k*a%b===0?` = ${k*a/b}`:''}.`});}
  if(v===8){const n=pick([2,3,4,5,6,8,10]),k=between(n>2?2:1,n-1),m=between(2,n>6?6:12),total=n*m,ans=k*m,[,it]=tItem();
    return mkChoice('mt:fop',`What is ${k}/${n} of ${total} ${it}?`,barHTML(total,times(n,i=>({v:1,label:i<k?'?':'',cls:i<k?'px':''})),total),ans,
      [k>1?[m,`That is 1/${n}. You need ${k} of those parts.`]:null,total%k===0&&total/k!==ans?[total/k,`Divide by the bottom number, ${n}, not the top.`]:null,[total-k,'"Of" means split into equal parts, not take away.'],[ans+m,`You need ${k} parts, not ${k+1}.`]].filter(Boolean),
      {hint:`1. Split ${total} into ${n} equal parts: ${total} ÷ ${n} = ${m}.<br>2. Take ${k} part${k>1?'s':''}: ${k} × ${m} = ?`,explain:`${total} ÷ ${n} = ${m}. ${k} × ${m} = ${ans}.`});}
  // fraction × fraction with an area model
  const b=between(2,5),d=between(2,5),a=between(1,b-1),c=between(1,d-1),ans=`${a*c}/${b*d}`,S=200,x0=20,y0=10;
  let s='';for(let i=0;i<b;i++)for(let j=0;j<d;j++){const inA=i<a,inC=j<c;s+=`<rect x="${mmR(x0+j*S/d)}" y="${mmR(y0+i*S/b)}" width="${mmR(S/d)}" height="${mmR(S/b)}" fill="${inA&&inC?MM_C.green:inA?G:inC?B:MM_C.panel}" fill-opacity="${inA&&inC?1:.55}" stroke="${MM_C.ink}" stroke-width="2"/>`}
  s+=mmT(x0+S+14,y0+S*a/b/2+6,`${a}/${b}`,{a:'start',c:G})+mmT(x0+S*c/d/2,y0+S+24,`${c}/${d}`,{c:B});
  return mkChoice('mt:fop',`${a}/${b} × ${c}/${d} = ?`,mmSvg(290,250,'area model',300,s),ans,
    mmNotSame(ans,[[`${a+c}/${b+d}`,'Multiply the tops and the bottoms. Do not add.'],[`${a*c}/${b+d}`,`The whole square has ${b} × ${d} = ${b*d} parts.`],[`${a*c+1}/${b*d}`,'Count the green parts again.']]),
    {hint:`1. The square has ${b} rows and ${d} columns: ${b*d} parts.<br>2. The green overlap is ${a} × ${c} parts.<br>3. Top × top, bottom × bottom.`,explain:`${a} × ${c} = ${a*c} and ${b} × ${d} = ${b*d}, so it is ${ans}.`});
}

/* ================= 11. VOLUME (Grade 5) ================= */
function mmBoxSVG(l,w,h,lab){
  const s=30,ax=s*.866,by=s*.5,P=(x,y,z)=>[x*ax-y*ax,x*by+y*by-z*s];
  const face=(pts,col)=>`<polygon points="${mmPts(pts)}" fill="${col}" stroke="${MM_C.dark}" stroke-width="2.5" stroke-linejoin="round"/>`;
  const ln=(p,q)=>mmLine(p[0],p[1],q[0],q[1],MM_C.dark,1.5);
  let b=face([P(0,0,h),P(l,0,h),P(l,w,h),P(0,w,h)],MM_C.gold)+face([P(l,0,0),P(l,w,0),P(l,w,h),P(l,0,h)],MM_C.blue)+face([P(0,w,0),P(l,w,0),P(l,w,h),P(0,w,h)],MM_C.green);
  for(let i=1;i<l;i++)b+=ln(P(i,0,h),P(i,w,h))+ln(P(i,w,0),P(i,w,h));
  for(let j=1;j<w;j++)b+=ln(P(0,j,h),P(l,j,h))+ln(P(l,j,0),P(l,j,h));
  for(let k=1;k<h;k++)b+=ln(P(l,0,k),P(l,w,k))+ln(P(0,w,k),P(l,w,k));
  const mid=(p,q,dx,dy)=>[(p[0]+q[0])/2+dx,(p[1]+q[1])/2+dy];
  const tl=mid(P(0,w,0),P(l,w,0),-22,26),tw=mid(P(l,0,0),P(l,w,0),24,24),th=mid(P(l,0,0),P(l,0,h),14,6);
  b+=mmT(tl[0],tl[1],lab[0],{s:18})+mmT(tw[0],tw[1],lab[1],{s:18})+mmT(th[0],th[1],lab[2],{s:18,a:'start'});
  const pts=[P(0,0,0),P(l,0,0),P(0,w,0),P(l,w,0),P(0,0,h),P(l,0,h),P(0,w,h),P(l,w,h)],xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const minX=Math.min(...xs)-70,minY=Math.min(...ys)-20,W=Math.max(...xs)-minX+90,H=Math.max(...ys)-minY+50;
  return`<svg viewBox="${mmR(minX)} ${mmR(minY)} ${mmR(W)} ${mmR(H)}" role="img" aria-label="box made of unit cubes" style="width:100%;max-width:${Math.min(380,Math.round(W*1.1))}px;height:auto" font-family="Andika,sans-serif">${b}</svg>`;
}
function genVolume(lv){
  const v=rnd(3);
  if(v===0){const l=between(2,5),w=between(1,3),h=between(1,4),V=l*w*h,vis=l*w+l*h+w*h;
    return mkChoice('mt:vol','How many unit cubes make this box?',mmBoxSVG(l,w,h,[l,w,h]),V,
      [[l+w+h,'That adds the edges. Volume = length × width × height.'],vis!==V?[vis,'You counted only the faces you can see. Some cubes are hidden inside.']:null,h>1?[l*w,`That is only the bottom layer. There are ${h} layers.`]:null,[V+l,`Count the layers again: ${h} layers of ${l*w}.`]].filter(Boolean),
      {hint:`1. The bottom layer is ${l} × ${w} = ${l*w} cubes.<br>2. There are ${h} layer${h>1?'s':''}.<br>3. ${l*w} × ${h} = ?`,explain:`${l} × ${w} × ${h} = ${V} cubes.`});}
  const unit=pick(['cm','in','ft']),l=between(2,8),w=between(2,5),h=between(2,5),V=l*w*h,cu=`cubic ${unit}`;
  if(v===1)return mkChoice('mt:vol','What is the volume of this box?',mmBoxSVG(l,w,h,[`${l} ${unit}`,`${w} ${unit}`,`${h} ${unit}`]),`${V} ${cu}`,
    [[`${l+w+h} ${cu}`,'That adds the edges. Volume = length × width × height.'],[`${l*w} ${cu}`,`That is only the bottom layer. There are ${h} layers.`],[`${2*(l*w+l*h+w*h)} ${cu}`,'That covers the outside faces. Volume fills the inside.']],
    {hint:`Volume = length × width × height.<br>1. ${l} × ${w} = ${l*w} (one layer).<br>2. ${l*w} × ${h} = ?`,explain:`${l} × ${w} × ${h} = ${V} ${cu}.`});
  return mkChoice('mt:vol',`The volume is ${V} ${cu}. The base is ${l} ${unit} by ${w} ${unit}. How tall is it?`,mmBoxSVG(l,w,h,[`${l} ${unit}`,`${w} ${unit}`,'?']),`${h} ${unit}`,
    [[`${V-l-w} ${unit}`,`Divide, don't subtract: ${V} ÷ (${l} × ${w}).`],V%l===0&&V/l!==h?[`${V/l} ${unit}`,`Divide by the whole base: ${l} × ${w} = ${l*w}.`]:null,[`${l*w} ${unit}`,'That is the area of the base, not the height.'],[`${h+1} ${unit}`,`Check: ${l} × ${w} × ${h+1} = ${l*w*(h+1)}, not ${V}.`]].filter(Boolean),
    {hint:`1. Base layer: ${l} × ${w} = ${l*w} cubes.<br>2. How many layers make ${V}? ${V} ÷ ${l*w} = ?`,explain:`${V} ÷ ${l*w} = ${h}. Check: ${l} × ${w} × ${h} = ${V}.`});
}

/* ================= 12. COORDINATE GRID (Grade 5) ================= */
function mmCoordSVG(G,pts){
  const c=32,ox=44,oy=44+G*c;let b='';
  for(let i=0;i<=G;i++){b+=mmLine(ox+i*c,oy,ox+i*c,oy-G*c,MM_C.grid,1.5)+mmLine(ox,oy-i*c,ox+G*c,oy-i*c,MM_C.grid,1.5)+mmT(ox+i*c,oy+22,i,{s:14,c:MM_C.muted})+(i?mmT(ox-10,oy-i*c+5,i,{s:14,c:MM_C.muted,a:'end'}):'')}
  b+=mmLine(ox,oy,ox+G*c+12,oy,MM_C.ink,3)+mmLine(ox,oy,ox,oy-G*c-12,MM_C.ink,3)+mmT(ox+G*c+22,oy+6,'x',{s:18,c:MM_C.gold})+mmT(ox,oy-G*c-18,'y',{s:18,c:MM_C.gold});
  pts.forEach(([x,y,e])=>{b+=`<circle cx="${ox+x*c}" cy="${oy-y*c}" r="4" fill="${MM_C.pink}"/>`+mmT(ox+x*c,oy-y*c-7,e,{s:24,w:400})});
  return mmSvg(ox+G*c+40,oy+34,'coordinate grid',420,b);
}
function genCoord(lv){
  const G=10,v=rnd(4),its=mmItems(4);
  const pt=()=>[between(1,G-1),between(1,G-1)];
  if(v===0){let x,y;do{[x,y]=pt()}while(x===y);const[e]=its[0];
    return mkChoice('mt:coord',`What are the coordinates of the ${e}?`,mmCoordSVG(G,[[x,y,e]]),`(${x}, ${y})`,
      [[`(${y}, ${x})`,'x comes first: go across, then up.'],[`(${x+1}, ${y})`,'Count the lines from 0, not the squares.'],[`(${x}, ${y-1})`,'Count up from 0 on the y line.']],
      {hint:`1. Start at 0. Go <b>across</b> to the ${e}: that is x.<br>2. Then go <b>up</b>: that is y.<br>3. Write (x, y).`,explain:`Across ${x}, up ${y}: (${x}, ${y}).`});}
  if(v===1){let x,y;do{[x,y]=pt()}while(Math.abs(x-y)<2);const others=[],far=p=>[[x,y],[y,x]].concat(others).every(q=>Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]))>=2);
    while(others.length<2){const p=pt();if(far(p))others.push(p)}
    const all=[[x,y,its[0][0]],[y,x,its[1][0]],[...others[0],its[2][0]],[...others[1],its[3][0]]];
    return mkChoice('mt:coord',`Which one is at (${x}, ${y})?`,mmCoordSVG(G,all),all[0][2],all.slice(1).map(([px,py,e],i)=>[e,i===0?`That one is at (${px}, ${py}). Go across ${x} first, then up ${y}.`:`That one is at (${px}, ${py}).`]),
      {hint:`Start at 0. Go across ${x}. Then go up ${y}.`,explain:`Across ${x}, up ${y}: the ${all[0][2]}.`});}
  if(v===2){const same=rnd(2),k=between(1,G-1),[a,b2]=take(times(G-1,i=>i+1),2),d=Math.abs(a-b2),e1=its[0][0],e2=its[1][0];
    const P1=same?[k,a]:[a,k],P2=same?[k,b2]:[b2,k],axis=same?'y':'x';
    return mkChoice('mt:coord',`How many units is it from the ${e1} to the ${e2}?`,mmCoordSVG(G,[[...P1,e1],[...P2,e2]]),d,
      [[a+b2,`Subtract the ${axis} numbers, don't add them.`],[d+1,'Count the jumps between lines, not the lines.'],k!==d?[k,`Both have ${same?'x':'y'} = ${k}. Look at how ${axis} changes.`]:null].filter(Boolean),
      {hint:`The ${e1} is at (${P1[0]}, ${P1[1]}). The ${e2} is at (${P2[0]}, ${P2[1]}).<br>Same ${same?'x':'y'}, so subtract the ${axis} numbers: bigger − smaller.`,explain:`${Math.max(a,b2)} − ${Math.min(a,b2)} = ${d} units.`});}
  let x,y;do{[x,y]=pt()}while(x===y);
  return mkChoice('mt:coord',`Start at (0, 0). Go right ${x} and up ${y}. Where are you?`,mmCoordSVG(G,[[0,0,'🏁']]),`(${x}, ${y})`,
    [[`(${y}, ${x})`,'Going right changes x. x is written first.'],[`(${x+y}, 0)`,'Right is x. Up is y. Keep them apart.'],[`(${x}, ${y+1})`,`You went up ${y}, not ${y+1}.`]],
    {hint:'Right (across) is x. Up is y. Write (x, y): across first, then up.',explain:`Right ${x}, up ${y}: (${x}, ${y}).`});
}

/* ================= 13. EXPRESSIONS (Grades 4–5) ================= */
const mmBag=s=>s.replace(/\(([^()]*)\)/,'<span class="bagbox">($1)</span>');
function genExpr(lv){
  const L=mmLv(lv,4,5),v=L===4?rnd(3):rnd(4);
  if(v===0){const forms=L===4?[1,2,3]:[1,2,3,4,5,6,7],f=pick(forms);let s,val,wr,steps;
    const a=between(2,20),b=between(2,9),c=between(2,9);
    if(f===1){s=`${a} + ${b} × ${c}`;val=a+b*c;wr=[[(a+b)*c,'Multiply before you add, unless there are brackets.']];steps=[`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${val}`]}
    else if(f===2){s=`(${a} + ${b}) × ${c}`;val=(a+b)*c;wr=[[a+b*c,`Brackets first: ${a} + ${b} = ${a+b}.`]];steps=[`${a} + ${b} = ${a+b}`,`${a+b} × ${c} = ${val}`]}
    else if(f===3){const bb=b+c;s=`${a} × (${bb} − ${c})`;val=a*b;wr=[[a*bb-c,`Brackets first: ${bb} − ${c} = ${b}.`]];steps=[`${bb} − ${c} = ${b}`,`${a} × ${b} = ${val}`]}
    else if(f===4){const d=between(1,Math.min(9,(a+b)*c-1));s=`(${a} + ${b}) × ${c} − ${d}`;val=(a+b)*c-d;wr=[[a+b*c-d,'Brackets first.']].concat(c>d?[[(a+b)*(c-d),'Multiply before you subtract.']]:[]);steps=[`${a} + ${b} = ${a+b}`,`${a+b} × ${c} = ${(a+b)*c}`,`${(a+b)*c} − ${d} = ${val}`]}
    else if(f===5){const d=between(1,a);s=`${a} + ${b} × ${c} − ${d}`;val=a+b*c-d;wr=[[(a+b)*c-d,'Multiply first. Then add and subtract from left to right.']];steps=[`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${a+b*c}`,`${a+b*c} − ${d} = ${val}`]}
    else if(f===6){const m=between(2,9),q=c*m,t=between(1,6),p=q+c*t;s=`${p} − ${q} ÷ ${c}`;val=p-m;wr=[[(p-q)/c,'Divide before you subtract.']];steps=[`${q} ÷ ${c} = ${m}`,`${p} − ${m} = ${val}`]}
    else{const d=between(1,c-1);s=`${b} × [${a} + (${c} − ${d})]`;val=b*(a+c-d);wr=[[b*a+c-d,'The [ ] bracket holds everything inside it. Multiply the whole bracket.']];steps=[`${c} − ${d} = ${c-d}`,`${a} + ${c-d} = ${a+c-d}`,`${b} × ${a+c-d} = ${val}`]}
    return mkChoice('mt:expr',`Work it out: ${s}`,`<div class="tfbox brk">${mmBag(s)}</div>`,val,wr.concat([[val+1,'Check each step again.'],[val+10,'Check each step again.']]),
      {hint:`Order: 1. brackets, 2. × and ÷, 3. + and − from left to right.<br>${steps.map((x,i)=>`${i+1}. ${x.replace(/= \d+$/,i===steps.length-1?'= ?':'$&')}`).join('<br>')}`,explain:steps.join(', then ')+'.'});}
  if(v===1){const p=between(2,9);let q;do{q=between(2,9)}while(q===p);
    const T=[
      [`${q} more than ${p} times a number n`,`${p} × n + ${q}`,[[`${p} × (n + ${q})`,`That adds first. Multiply n by ${p} first, then add ${q}.`],[`${q} × n + ${p}`,`${p} is the "times" number. ${q} is the "more than".`],[`${p} + n + ${q}`,'"Times" means multiply.']]],
      [`${q} less than a number n`,`n − ${q}`,[[`${q} − n`,`"${q} less than n" starts at n and takes ${q} away.`],[`n + ${q}`,'"Less than" means take away.'],[`${q} × n`,'Nothing is multiplied here.']]],
      [`a number n shared equally by ${p}`,`n ÷ ${p}`,[[`${p} ÷ n`,`Start with n, then divide it by ${p}.`],[`n × ${p}`,'Sharing equally means divide.'],[`n − ${p}`,'Sharing equally means divide.']]]
    ].concat(L===5?[
      [`twice the sum of n and ${q}`,`2 × (n + ${q})`,[[`2 × n + ${q}`,`"The sum" is one amount. Put brackets around n + ${q}.`],[`n + ${q} + 2`,'"Twice" means multiply by 2.'],[`2 + (n + ${q})`,'"Twice" means multiply by 2.']]],
      [`${p} times the difference of n and ${q}`,`${p} × (n − ${q})`,[[`${p} × n − ${q}`,`"The difference" is one amount. Put brackets around n − ${q}.`],[`${p} × (${q} − n)`,`Take ${q} away from n, in that order.`],[`${p} + (n − ${q})`,'"Times" means multiply.']]],
      [`n divided by ${p}, then add ${q}`,`n ÷ ${p} + ${q}`,[[`n ÷ (${p} + ${q})`,'Divide first, then add.'],[`${p} ÷ n + ${q}`,`Start with n, then divide it by ${p}.`],[`n × ${p} + ${q}`,'Divided means ÷, not ×.']]]
    ]:[]);
    const[ph,right,wr]=pick(T);
    return mkChoice('mt:expr',`Which expression means "${ph}"?`,`<div class="eq sm"><b class="xv">n</b> = 🎒 a mystery number</div>`,right,wr,
      {wide:true,hint:'Read the words slowly. What happens to n first? Then what? Words like "sum" or "difference" mean brackets.',explain:`"${ph}" is ${right}.`});}
  if(v===2){const n=between(2,9),p=between(2,9);let q=between(1,9),e,val,wr,steps;
    const f=L===4?pick([1,2,3]):pick([4,5,6]);
    if(f===1){e=`n + ${p*3}`;val=n+p*3;wr=[[p*3,`Put ${n} in place of n.`],[n*p*3,'The sign is +, not ×.']];steps=[`${n} + ${p*3} = ?`]}
    else if(f===2){e=`${p} × n`;val=p*n;wr=[[p+n,'× means multiply.'],[p*10+n,`${p} × n means ${p} times ${n}, not the digits side by side.`]];steps=[`${p} × ${n} = ?`]}
    else if(f===3){const m=n+between(2,9);e=`n + n + ${m}`;val=2*n+m;wr=[[n+m,'There are two n\'s. Put the number in for both.'],[n*2*m,'Only + signs here.']];steps=[`${n} + ${n} + ${m} = ?`]}
    else if(f===4){e=`${p} × n + ${q}`;val=p*n+q;wr=[[p*(n+q),'Multiply first, then add.'],[p+n+q,'× means multiply.'],[p*10+n+q,`${p} × n means ${p} × ${n}, not the number ${p}${n}.`]];steps=[`${p} × ${n} = ${p*n}`,`${p*n} + ${q} = ?`]}
    else if(f===5){const n2=n+q;e=`${p} × (n − ${q})`;val=p*n;wr=[[p*n2-q,`Brackets first: ${n2} − ${q} = ${n}.`],[p+n,'× means multiply.']];steps=[`${n2} − ${q} = ${n}`,`${p} × ${n} = ?`];
      return mkChoice('mt:expr',`What is ${e} when n = ${n2}?`,`<div class="tfbox brk">${mmBag(e)}</div><div class="eq sm"><b class="xv">n</b> = ${n2}</div>`,val,wr.concat([[val+p,`Check: n is ${n2}.`]]),{hint:`Put ${n2} in place of n.<br>${steps.map((x,i)=>`${i+1}. ${x}`).join('<br>')}`,explain:`${p} × (${n2} − ${q}) = ${p} × ${n} = ${val}.`})}
    else{const nn=n+1;q=between(1,nn-1);e=`n × n − ${q}`;val=nn*nn-q;wr=[[2*nn-q,'n × n means n times n, not n + n.'],[nn*(nn-q),'Multiply first, then subtract.']].filter(w=>w[0]>0);
      return mkChoice('mt:expr',`What is ${e} when n = ${nn}?`,`<div class="tfbox">${e}</div><div class="eq sm"><b class="xv">n</b> = ${nn}</div>`,val,wr.concat([[val+1,'Check each step again.']]),{hint:`Put ${nn} in place of each n.<br>1. ${nn} × ${nn} = ${nn*nn}<br>2. ${nn*nn} − ${q} = ?`,explain:`${nn} × ${nn} − ${q} = ${nn*nn} − ${q} = ${val}.`})}
    return mkChoice('mt:expr',`What is ${e} when n = ${n}?`,`<div class="tfbox">${e}</div><div class="eq sm"><b class="xv">n</b> = ${n}</div>`,val,wr.concat([[val+1,'Check each step again.']]),
      {hint:`Put ${n} in place of n.<br>${steps.map((x,i)=>`${i+1}. ${x}`).join('<br>')}`,explain:steps.map(x=>x.replace('?',val)).join(', then ')+'.'});}
  const k=between(2,9),a=between(100,999),b=between(11,99);
  return mkChoice('mt:expr',`Without calculating: which is ${k} times as large as ${a} + ${b}?`,`<div class="tfbox brk"><span class="bagbox">(${a} + ${b})</span></div>`,`${k} × (${a} + ${b})`,
    [[`${k} × ${a} + ${b}`,`Only ${a} is multiplied there. Put brackets around the whole sum.`],[`${a} + ${b} + ${k}`,`That is ${k} more, not ${k} times as large.`],[`(${a} + ${b}) ÷ ${k}`,'Dividing makes it smaller.']],
    {wide:true,hint:`"${k} times as large" means ${k} copies of the whole sum. The sum must stay together in brackets.`,explain:`${k} × (${a} + ${b}) is ${k} copies of the whole sum ${a} + ${b}.`});
}

/* ================= REGISTRATION ================= */
Object.assign(GEN,{shape:genShapes,money:genMoney,graph:genGraph,round:genRound,area:genAreaPerim,mdig:genMultiDigit,times:genTimesAsMany,angle:genAngles,dec:genDecimals,fop:genFracOps,vol:genVolume,coord:genCoord,expr:genExpr});
MATH_CURRICULUM.push(
 {id:'m22',order:18,grades:[0,1,2],src:'Singapore',gen:['shape'],name:'Shape Garden',icon:'🔷',short:'Shapes',learn:'Name shapes. Count sides and corners.',tip:'Count the <b>straight sides</b> with your finger. 3 = triangle, 4 = square or rectangle, 5 = pentagon, 6 = hexagon.',
  build:lv=>times(6,()=>genShapes(lv)),spec:['❄️','Snowflake','Snowflakes almost always have 6 sides or 6 arms.'],bonus:'Go on a shape hunt at home. Find a circle, a square, a rectangle and a triangle.',
  what:'2D shapes: names, sides and corners',why:'Shapes drawn in different sizes and turns, so she learns the rule (count sides), not just one picture'},
 {id:'m23',order:28,grades:[2],src:'Singapore',gen:['money'],name:'Coin Cave',icon:'🪙',short:'Money',learn:'Count coins and make amounts.',tip:'Start with the coin worth the most, then count on. Quarter 25¢, dime 10¢, nickel 5¢, penny 1¢.',
  build:lv=>times(6,()=>genMoney(lv)),spec:['🦫','Beaver','A beaver\'s front teeth never stop growing.'],bonus:'Count real coins from a jar with a grown-up. Sort them first!',
  what:'US coins: counting money under $1',why:'Counting on from the biggest coin; wrong choices catch "counting coins, not cents" and "a nickel is bigger, so it is worth more"'},
 {id:'m24',order:56,grades:[1,2,3],src:'Singapore',gen:['graph'],name:'Graph Safari',icon:'📈',short:'Graphs',learn:'Read picture graphs and bar graphs.',tip:'Read the <b>key</b> first. "How many more" means subtract. "In all" means add.',
  build:lv=>times(6,()=>genGraph(lv)),spec:['🐧','Emperor penguin','Emperor penguins huddle together in big groups to stay warm.'],bonus:'Ask your family their favorite animal. Make a picture graph together.',
  what:'Picture graphs and bar graphs',why:'Data from her interests; Grade 3 adds scaled graphs where each picture stands for 2 or 5'},
 {id:'m25',order:17,grades:[3,4],src:'Both',gen:['round'],name:'Rounding Hill',icon:'⛰️',short:'Rounding',learn:'Round to the nearest 10, 100 or 1,000.',tip:'Find the two neighbors on the number line. Look at the next digit: <b>5 or more, round up</b>.',
  build:lv=>times(6,()=>genRound(lv)),spec:['🌍','Earth','Earth is about 93 million miles from the Sun.'],bonus:null,
  what:'Rounding whole numbers',why:'A number line shows the two neighbors and the halfway point; wrong choices catch "5 rounds down", rounding twice and the wrong place'},
 {id:'m26',order:64,grades:[3,4,5],src:'Singapore',gen:['area'],name:'Garden Plots',icon:'🌱',short:'Area & Perimeter',learn:'Area inside, perimeter around.',tip:'<b>Area</b> = squares inside (rows × columns). <b>Perimeter</b> = add all the sides around.',
  build:lv=>times(6,()=>genAreaPerim(lv)),spec:['🐜','Leafcutter ant','Leafcutter ants cut up leaves and carry them home to grow their food.'],bonus:'Measure a table with a ruler. Work out how far it is all the way around.',
  what:'Area and perimeter',why:'Grid pictures first; tackles mixing up area and perimeter. Grade 4 finds a missing side; Grade 5 splits L-shapes into rectangles'},
 {id:'m27',order:45,grades:[4,5],src:'Singapore',gen:['mdig'],name:'Big Number Barn',icon:'🏗️',short:'Multi-digit × ÷',learn:'Multiply with an area model. Divide with remainders.',tip:'Split numbers by place and fill every box. For division, the remainder must be <b>smaller</b> than the number you divide by.',
  build:lv=>times(6,()=>genMultiDigit(lv)),spec:['🐘','Elephant','An elephant can pick up something as small as a peanut with its trunk.'],bonus:null,
  what:'Multi-digit multiplication and division',why:'Area model (partial products) and partial quotients; wrong choices catch a forgotten box and a skipped 0'},
 {id:'m28',order:33,grades:[4],src:'Singapore',gen:['times'],name:'Whale of a Difference',icon:'🐋',short:'Times as Many',learn:'"Times as many" vs "more than".',tip:'"3 times as many" = 3 bars the same size. "3 more" = add 3. Draw the bars!',
  build:lv=>times(6,()=>genTimesAsMany(lv)),spec:['🐋','Blue whale','A blue whale is the biggest animal that has ever lived.'],bonus:null,
  what:'Multiplicative comparison',why:'Singapore unit bars show "times as many" next to "how many more", the key Grade 4 idea'},
 {id:'m29',order:66,grades:[4],src:'Both',gen:['angle'],name:'Web Angles',icon:'🕸️',short:'Angles',learn:'Acute, right, obtuse and straight angles.',tip:'Compare with a square corner (90°). A full turn is 360°, a quarter turn is 90°.',
  build:lv=>times(6,()=>genAngles(lv)),spec:['🕸️','Spider web','Orb spiders spin threads out from the center, like the spokes of a wheel.'],bonus:'Find a right angle, an acute angle and an obtuse angle in your room.',
  what:'Angles and turns',why:'Angles drawn with long and short arms, so she compares the opening, not the arm length. Adding angles and quarter turns'},
 {id:'m30',order:48,grades:[4,5],src:'Singapore',gen:['dec'],name:'Decimal Dive',icon:'🐠',short:'Decimals',learn:'Tenths and hundredths.',tip:'0.3 = 3 tenths = 0.30. Compare the <b>same places</b>: 0.3 is bigger than 0.25.',
  build:lv=>times(6,()=>genDecimals(lv)),spec:['🐦','Hummingbird','A hummingbird\'s heart can beat more than 1,000 times a minute.'],bonus:null,
  what:'Decimals',why:'Hundred grids and number lines; tackles "0.25 > 0.3 because 25 > 3". Grade 5 rounds, adds and subtracts with the points lined up'},
 {id:'m31',order:47,grades:[4,5],src:'Singapore',gen:['fop'],name:'Fraction Factory',icon:'🥧',short:'Fraction Ops',learn:'Equivalent fractions, adding and multiplying fractions.',tip:'Add the <b>tops</b> only when the parts are the same size. Never add the bottoms!',
  build:lv=>times(6,()=>genFracOps(lv)),spec:['🌙','The Moon','We always see the same side of the Moon from Earth.'],bonus:null,
  what:'Fraction operations',why:'Fraction bars for equivalence, like-denominator sums and mixed numbers; Grade 5 unlike denominators and multiplying. Catches adding the denominators'},
 {id:'m32',order:68,grades:[5],src:'Singapore',gen:['vol'],name:'Ice Cube Tower',icon:'🧊',short:'Volume',learn:'Volume of boxes made of cubes.',tip:'One layer = length × width. Then × how many layers (height).',
  build:lv=>times(6,()=>genVolume(lv)),spec:['🧊','Ice','Water gets bigger when it freezes. That is why ice floats.'],bonus:'Build a box from sugar cubes or blocks. Count the cubes in one layer, then the layers.',
  what:'Volume of rectangular prisms',why:'Layers of unit cubes before the formula; catches adding the edges and counting only the faces you see'},
 {id:'m33',order:58,grades:[5],src:'Both',gen:['coord'],name:'Treasure Map',icon:'🧭',short:'Coordinates',learn:'Find points on a grid: (x, y).',tip:'Go <b>across</b> first (x), then <b>up</b> (y). Like walking into a building, then taking the elevator.',
  build:lv=>times(6,()=>genCoord(lv)),spec:['🧭','Compass','A compass needle points north because Earth acts like a giant magnet.'],bonus:null,
  what:'Coordinate grid (first quadrant)',why:'Themed points on a grid; wrong choices catch swapping x and y'},
 {id:'m34',order:36,grades:[4,5],src:'RSM',gen:['expr'],name:'Expression Express',icon:'🚂',short:'Expressions',learn:'Order of operations and expressions with a letter.',tip:'<b>Brackets</b> first, then <b>× ÷</b>, then <b>+ −</b> from left to right. A letter is a mystery number.',
  build:lv=>times(6,()=>genExpr(lv)),spec:['🐜','Ant','Some ants can carry 10 to 50 times their own body weight.'],bonus:'Make up a mystery-number rule for a grown-up: "I double it and add 3. I get 11."',
  what:'Expressions and order of operations',why:'RSM algebra: words to expressions, values with a letter, brackets and "3 times as large" without calculating'}
);
// Missions that keep going in Grade 5 (review and harder numbers).
['m2','m9','m10','m11','m13','m16','m17','m18','m19','m20','m21','m8'].forEach(id=>{const m=MATH_CURRICULUM.find(x=>x.id===id);if(m&&!m.grades.includes(5))m.grades.push(5)});
if(GRADE_NAMES.length<6)GRADE_NAMES.push('Grade 5');
