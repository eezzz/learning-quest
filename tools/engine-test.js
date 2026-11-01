#!/usr/bin/env node
/* Runs the math engine with no DOM, the way the native apps do, across every grade.
   Every question must be plain JSON with exactly one right answer. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const pack=read('content/bundle.json');
const src=`const CONTENT=${pack};const {INTERESTS,THEMES}=CONTENT.interests;const {STORIES,STORY_TYPES}=CONTENT.stories;\n`
  +['util','math-lab','curriculum','math-more','engine'].map(f=>read(`js/subjects/${f}.js`)).join('\n;\n')
  +';__api={mathDay,MATH_CURRICULUM,mathMissionsFor,toPlain,GEN};';
const c={console,Math,Date,JSON};vm.createContext(c);vm.runInContext(src,c);
const{mathDay,mathMissionsFor,toPlain,GEN}=c.__api;
const errors=[];let total=0,steps=0;
const bad=(q,why)=>errors.push(`${q.key}: ${why}`);
const checkOpts=(q,opts)=>{
  if(opts.filter(o=>o.ok).length!==1)bad(q,'needs exactly one right answer: '+JSON.stringify(opts).slice(0,160));
  if(new Set(opts.map(o=>o.t)).size!==opts.length)bad(q,'duplicate choices');
};
const check=q=>{
  total++;
  if(/NaN|undefined/.test(JSON.stringify(q)))bad(q,'NaN or undefined text');
  if(q.kind==='choice')checkOpts(q,q.opts);
  else{steps++;q.steps.forEach(s=>{if(s.opts)checkOpts(q,s.opts);else if(!s.tapNumbers)bad(q,'step has nothing to do')})}
};
const interests=['space','cars','food'];
for(let math=0;math<=5;math++){
  const ids=mathMissionsFor(math).map(m=>m.id);
  for(let rep=0;rep<25;rep++)for(let d=0;d<=ids.length;d++){
    const day=JSON.parse(mathDay({math,interests,done:ids.slice(0,d),due:[],count:6,day:d}));
    if(!day.questions.length)errors.push(`grade ${math}, ${day.topic.id}: no questions`);
    day.questions.forEach(check);
  }
  for(const k of Object.keys(GEN))for(let i=0;i<60;i++){const q=toPlain(GEN[k](math));if(!q)errors.push(`${k}: a round type the engine can't play`);else check(q)}
}
console.log(`${total} questions checked (${steps} multi-step).`);
if(errors.length){console.error(`${errors.length} problems:\n- `+[...new Set(errors)].slice(0,20).join('\n- '));process.exit(1)}
console.log('OK');
