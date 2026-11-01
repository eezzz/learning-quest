/* Math engine for the native apps. It runs in JavaScriptCore after util.js, math-lab.js, curriculum.js and
   math-more.js, with no DOM, and answers with plain JSON. The web app doesn't load this file.
   Every question becomes one of two shapes:
     {kind:'choice', key, prompt, say, visual, show, done, opts, hint, explain, fixed}
     {kind:'steps', key, steps:[{prompt, say, visual, show, tapNumbers, log, note, opts}], explain}
   A multi-step question is a script: the native app only needs one view to play any of them.
   Pack data arrives as CONTENT; math rules stay here, so they are the same on every platform. */
var S={profile:{math:0,interests:[]},adapt:{},done:{},mistakes:{}};
function lvFor(m){return Math.max(0,Math.min(5,(S.profile.math|0)+((S.adapt||{})[m.id]||0)))}

const go=[{t:'Next',ok:true}];
// Drawing specs stay opaque text for the native app, which hands them back to applyVisual.
const spec=v=>v?JSON.stringify(v):undefined;
function balanceSteps(r){
  const B={L:r.L.slice(),R:r.R.slice()},xs=r.L.includes('x')?'L':'R',os=xs==='L'?'R':'L';
  const known=s=>B[s].filter(v=>v!=='x'),eq=()=>`${sideStr(B.L)} = ${sideStr(B.R)}`;
  const shot=o=>({scale:[B.L.slice(),B.R.slice(),r.xv,o||{}]}),steps=[];
  const step=(prompt,log,note,opts,o)=>steps.push({prompt,say:strip(prompt),visual:scaleSVG(),show:spec(shot(o)),log,note,opts});
  step('Look at the scale. Each side weighs the same amount.',eq(),'What the scale shows',go);
  ['L','R'].filter(s=>known(s).length>1).forEach(s=>{
    const ks=known(s),t=sumOf(ks);B[s]=B[s].includes('x')?(B[s].indexOf('x')===0?['x',t]:[t,'x']):[t];
    step(`Step 1 of 3: Add up the weights you know. ${ks.join(' + ')} = ?`,eq(),`${ks.join(' + ')} = ${t}`,
      shuffle([{t:String(t),ok:true},{t:String(t+1),why:'Add the weights again.'},{t:String(Math.max(0,t-2)),why:'Add the weights again.'}]))});
  const k=known(xs)[0],T=known(os)[0];
  if(k!=null){
    B[xs]=['x'];B[os]=[T-k];
    step(`Step 2 of 3: Take ${k} off the side with the mystery bag. What must you do to the other side?`,eq(),`Take ${k} off both sides: ${T} − ${k} = ${T-k}`,
      shuffle([{t:`Take ${k} off it too`,ok:true},{t:'Leave it the same',why:'The scale would tip. Both sides must change the same way.'}]))}
  const w=a=>a.map(v=>v==='x'?r.xv:v),check=`Check: ${w(r.L).join(' + ')} = ${w(r.R).join(' + ')} → ${sumOf(w(r.L))} = ${sumOf(w(r.R))} ✓`;
  const opts=[...new Set([r.xv,T,k,T+k,r.xv+1].filter(v=>v!=null))].slice(0,4).map(v=>v===r.xv?{t:String(v),ok:true}:{t:String(v),why:`Look at the scale now: the bag balances the ${r.xv} weight.`});
  step('Step 3 of 3: What is in the mystery bag?',`x = ${r.xv}`,check,shuffle(opts));
  return{kind:'steps',key:r.key,steps,explain:`The bag holds ${r.xv}. ${check}`};
}
function storySteps(r){
  const s=r.s||STORIES[r.idx],steps=[{prompt:'Step 1 of 4: Tap every number in the story.',say:s.t,tapNumbers:s.t,log:`Numbers: ${(s.t.match(/\d+/g)||[]).join(', ')}`,note:'These are the numbers we use'}];
  const types=shuffle([s.type].concat(take(Object.keys(STORY_TYPES).filter(k=>k!==s.type),3)));
  steps.push({prompt:'Step 2 of 4: What is happening in the story?',say:'What is happening in the story?',visual:s.t,log:stName(s.type),note:STORY_TYPES[s.type][2],
    opts:types.map(k=>({t:`${stName(k)}: ${STORY_TYPES[k][2]}`,ok:k===s.type||undefined,why:`${STORY_TYPES[k][3]} Not in this story.`}))});
  const why=`That does not match the picture. This story is "${STORY_TYPES[s.type][1]}".`;
  steps.push({prompt:'Step 3 of 4: Which number sentence matches the picture?',say:'Which number sentence matches the picture?',visual:storyPic(s),log:`${s.eq} = ?`,
    opts:shuffle([{t:s.eq+' = ?',ok:true}].concat(storyWrongs(s).map(w=>({t:w+' = ?',why}))))});
  const value=w=>{try{return Function('return '+w.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'))()}catch(e){return null}};
  const wrong=s.wrong.map(value).filter(v=>Number.isInteger(v)&&v>=0&&v!==s.ans);
  const vals=[s.ans].concat([...new Set(wrong)].slice(0,2),[s.ans+1]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4);
  steps.push({prompt:'Step 4 of 4: What is the answer?',say:'What is the answer?',visual:storyPic(s),log:`${s.eq} = ${s.ans}`,note:`Answer: ${s.ans} ${s.unit}`,
    opts:shuffle(vals.map(v=>({t:`${v} ${s.unit}`,ok:v===s.ans||undefined,why:'Work out the number sentence from step 3.'})))});
  return{kind:'steps',key:r.key,steps,explain:`${stName(s.type)}: ${s.eq} = ${s.ans}. The answer is ${s.ans} ${s.unit}.`};
}
function toPlain(r){
  if(r.type==='balance')return balanceSteps(r);
  if(r.type==='story')return storySteps(r);
  if(r.type!=='choice')return null;// a round the native app doesn't play yet
  const opts=r.opts.map(o=>({t:String(o.t),ok:o.ok||undefined,why:o.why||undefined}));
  return{kind:'choice',key:r.key,prompt:r.prompt,say:r.say||strip(r.prompt),visual:r.visual||'',show:spec(r.show),done:spec(r.done),opts:r.fixed?opts:shuffle(opts),hint:r.hint,explain:r.explain};
}

/* One day's math part. state: {math, interests, adapt, done:[mission ids], due:[generator keys], count}.
   The next unfinished topic on the path, then up to 2 review questions, as on the web. */
function mathDay(state){
  S={profile:{math:state.math,interests:state.interests||[]},adapt:state.adapt||{},done:{},mistakes:state.mistakes||{}};
  const done=state.done||[],N=state.count||6;
  let path=mathMissionsFor(state.math);if(!path.length)path=mathMissionsFor(4);
  const topic=path.find(m=>!done.includes(m.id))||path[(state.day||0)%path.length],lv=lvFor(topic);
  const others=path.filter(m=>m.id!==topic.id&&m.gen.length),rounds=topic.gen.length?topic.build(lv).slice(0,N-2):topic.build(lv).slice(0,N);
  if(topic.gen.length){
    const inPath=k=>GEN[k]&&others.some(m=>m.gen.includes(k))&&!topic.gen.includes(k);
    const finished=others.filter(m=>done.includes(m.id)).flatMap(m=>m.gen),fallback=others.flatMap(m=>m.gen);
    [...new Set((state.due||[]).filter(inPath).concat(shuffle(finished.length?finished:fallback)))].filter(k=>GEN[k]).slice(0,2).forEach(k=>rounds.push(GEN[k](lv)));
  }
  return JSON.stringify({topic:{id:topic.id,name:topic.name,icon:topic.icon,learn:topic.learn,tip:topic.tip},questions:rounds.map(toPlain).filter(Boolean)});
}
