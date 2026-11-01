/* Number Lab extras: equations (balance scale), bar models, equal groups and word problems.
   Built from Stella's math homework (balance-scale equations, "write and solve", multiplication as
   equal groups, and multi-step word problems). Loaded before app.js and uses its helpers at run time.
   Everything goes picture first: scale, bars or groups, then the number sentence. */

/* ---------------- word problems ----------------
   type: join | take | groups | share | compare
   eq: the matching number sentence. wrong: other sentences. pic: what to draw after step 2. */
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
  const s=r.s||STORIES[r.idx];let revealed=false;
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
