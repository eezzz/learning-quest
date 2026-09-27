/* Daily plan: every day has Math, Words and People, each a short mixed set.
   - Math: 4 questions on the day's topic (next level on her path) + 2 spiral-review questions.
   - Words: meet 4 new vocabulary words, 4 quick questions on them, 1 prefix/suffix or review word, 1 grammar review.
   - People: 4 situations on the day's topic + 1 review.
   Grade 3 vocabulary: tier-2 academic words with a science flavor (Common Core L.3.4–L.3.5:
   context clues, affixes, synonyms and antonyms). Loaded after curriculum.js, before app.js. */

// [word, kid-friendly meaning, example with ___ for the word, synonym, antonym, emoji]
const VOCAB=[
 ['enormous','very, very big','The ___ whale was longer than a school bus.','huge','tiny','🐋'],
 ['fragile','easy to break','Be careful, the bird egg is ___.','delicate','sturdy','🥚'],
 ['observe','to watch something carefully','Scientists ___ animals to learn how they live.','watch',null,'🔭'],
 ['predict','to say what you think will happen next','I ___ it will rain, because the clouds are dark.','guess',null,'⛈️'],
 ['habitat','the natural home of an animal or plant','The ocean is the ___ of the octopus.','home',null,'🌊'],
 ['migrate','to move to a new place when the season changes','Many birds ___ south for the winter.','travel',null,'🐦'],
 ['camouflage','colors or patterns that help an animal hide','The chameleon uses ___ to hide on a green leaf.',null,null,'🦎'],
 ['swift','very fast','The ___ cheetah caught up in seconds.','fast','slow','🐆'],
 ['ancient','very, very old','The ___ bones were millions of years old.','old','new','🦕'],
 ['curious','wanting to know or learn about something','The ___ kitten sniffed the new box.','interested',null,'🐱'],
 ['gather','to collect things into one place','Squirrels ___ acorns for the winter.','collect','scatter','🐿️'],
 ['shelter','a place that keeps you safe from weather or danger','The bear found ___ in a dry cave.',null,null,'⛺'],
 ['survive','to stay alive','Camels can ___ many days without water.',null,null,'🐪'],
 ['evaporate','to change from water into a gas in the air','Puddles ___ on a hot, sunny day.',null,null,'☀️'],
 ['erupt','to burst out suddenly','Hot lava poured out when the volcano began to ___.','explode',null,'🌋'],
 ['dissolve','to mix into a liquid until you cannot see it','Sugar will ___ in warm water.',null,null,'🫖'],
 ['gradual','happening slowly, a little at a time','The change from caterpillar to butterfly is ___.','slow','sudden','🐛'],
 ['sudden','happening quickly, with no warning','A ___ storm made us run inside.','quick','gradual','⚡'],
 ['examine','to look at something closely','The vet will ___ the puppy\'s ear.','inspect',null,'🔍'],
 ['predator','an animal that hunts other animals for food','A shark is an ocean ___.','hunter','prey','🦈'],
 ['prey','an animal that is hunted by another animal','The mouse is the owl\'s ___.',null,'predator','🐭'],
 ['nocturnal','awake and active at night','Bats are ___ animals.',null,null,'🦇'],
 ['hibernate','to sleep through the whole winter','Some bears ___ in caves until spring.',null,null,'🐻'],
 ['cautious','careful to stay away from danger','Be ___ near the edge of the cliff.','careful','reckless','🧗'],
 ['journey','a long trip','The sea turtle\'s ___ across the ocean took months.','trip',null,'🐢'],
 ['moist','a little bit wet','Worms live in ___ soil.','damp','dry','🪱'],
 ['transparent','clear enough to see through','A window is ___.','clear',null,'🪟'],
 ['massive','very big and heavy','A ___ rock blocked the path.','huge','tiny','🪨'],
 ['vibrate','to shake back and forth very quickly','A bee\'s wings ___ to make a buzzing sound.','shake',null,'🐝'],
 ['extinct','no longer alive anywhere on Earth','Dinosaurs are ___.',null,null,'🦖'],
 ['endangered','at risk of dying out forever','Tigers are ___ animals, so we must protect them.',null,null,'🐅'],
 ['scatter','to spread things out in many directions','The wind can ___ seeds far away.','spread','gather','🌬️'],
 ['ascend','to go up','The rocket began to ___ into the sky.','rise','descend','🚀'],
 ['descend','to go down','The divers ___ to the ocean floor.','drop','ascend','🤿'],
 ['abundant','more than enough; lots and lots','Berries are ___ in the summer forest.','plentiful','scarce','🫐'],
 ['scarce','hard to find; not enough','Water is ___ in the desert.','rare','abundant','🏜️'],
 ['construct','to build something','Beavers ___ dams with sticks and mud.','build','destroy','🦫'],
 ['investigate','to find out about something carefully','Our class will ___ why ice melts.','explore',null,'🔬'],
 ['sturdy','strong and hard to break','The ___ bridge held the heavy truck.','strong','fragile','🌉'],
 ['dense','thick and packed close together','The ___ fog made it hard to see.','thick','thin','🌫️'],
 ['cluster','a small group of things close together','A ___ of grapes hung from the vine.','bunch',null,'🍇'],
 ['absorb','to soak something up','A sponge can ___ a lot of water.','soak up',null,'🧽'],
 ['reflect','to bounce back light or sound','A mirror can ___ light.','bounce back',null,'🪞'],
 ['solar','having to do with the Sun','___ panels turn sunlight into power.',null,null,'🌞'],
 ['lunar','having to do with the Moon','Astronauts drove a ___ rover on the Moon.',null,null,'🌕'],
 ['marine','having to do with the sea','Whales and dolphins are ___ animals.',null,null,'🐬'],
 ['brilliant','very bright, or very smart','The ___ sunlight made us squint.','bright','dull','🌟'],
 ['fierce','wild, strong and scary','The ___ lion roared loudly.','wild','gentle','🦁']
];
// [prefix or suffix, what it means, template for a made-up meaning, [word, meaning, base word]]
const AFFIXES=[
 ['un-','not (or the opposite)',b=>`not ${b}`,[['unhappy','not happy','happy'],['unsafe','not safe','safe'],['unkind','not kind','kind'],['unlock','the opposite of lock','lock']]],
 ['re-','again',b=>`${b} again`,[['rebuild','build again','build'],['reread','read again','read'],['refill','fill again','fill'],['replay','play again','play']]],
 ['pre-','before',b=>`${b} before`,[['preview','see before','view'],['preheat','heat before','heat'],['prepay','pay before','pay']]],
 ['dis-','not, or the opposite',b=>`not ${b}`,[['disagree','not agree','agree'],['dislike','not like','like'],['disappear','the opposite of appear','appear']]],
 ['mis-','wrongly',b=>`${b} wrongly`,[['misspell','spell wrongly','spell'],['misread','read wrongly','read'],['misplace','put in the wrong place','place']]],
 ['-ful','full of',b=>`full of ${b}`,[['helpful','full of help','help'],['careful','full of care','care'],['colorful','full of color','color'],['joyful','full of joy','joy']]],
 ['-less','without',b=>`without ${b}`,[['careless','without care','care'],['fearless','without fear','fear'],['harmless','without harm','harm'],['endless','without an end','end']]],
 ['-er','a person who does something',b=>`a person who can ${b}`,[['teacher','a person who teaches','teach'],['explorer','a person who explores','explore'],['farmer','a person who farms','farm']]],
 ['-able','can be done',b=>`can be ${b}`,[['breakable','can be broken','break'],['washable','can be washed','wash'],['readable','can be read','read']]]
];
const VW=w=>VOCAB.find(v=>v[0]===w);

/* ---------- vocabulary rounds ---------- */
function learnR(words){return{type:'learn',words}}
function rLearn(r,st){
  setPrompt('New words for today. Read each card. Tap 🔊 to hear it.','New words for today: '+r.words.join(', '));
  const grid=el('div','wcards');
  r.words.forEach(w=>{const v=VW(w);const c=el('div','wcard',`<div class="we">${v[5]}</div><div class="ww">${v[0]}</div><div class="wm">${esc(v[1])}</div><div class="wx">${esc(v[2]).replace('___',`<b>${v[0]}</b>`)}</div>`);
    const b=el('button','say','🔊');b.setAttribute('aria-label','Hear '+w);b.onclick=()=>speak(`${v[0]}. ${v[0]} means ${v[1]}. ${v[2].replace('___',v[0])}`);c.appendChild(b);grid.appendChild(c)});
  st.appendChild(grid);
  const go=el('button','big',"I'm ready ✓");$('#actions').appendChild(go);
  go.onclick=()=>{$('#actions').innerHTML='';st.classList.add('locked');finish(true,['You met '+r.words.length+' new words. Now let\'s use them!'])};
}
function vocabQ(w,kind){
  const v=VW(w),others=VOCAB.filter(x=>x[0]!==w);
  if(kind==='syn'&&!v[3])kind='context';if(kind==='ant'&&!v[4])kind='meaning';
  const key='v:'+w,card=`<div class="wx big">${v[5]}</div>`;
  if(kind==='meaning')return mkChoice(key,`What does <b>${w}</b> mean?`,card,esc(v[1]),take(others,3).map(o=>[esc(o[1]),`That is what "${o[0]}" means.`]),
    {wide:true,explain:`<b>${w}</b> means ${esc(v[1])}. ${esc(v[2]).replace('___',`<b>${w}</b>`)}`,hint:`Try each meaning in the sentence: "${esc(v[2]).replace('___',w)}"`});
  if(kind==='reverse')return mkChoice(key,`Which word means <b>${esc(v[1])}</b>?`,card,w,take(others,3).map(o=>[o[0],`"${o[0]}" means ${esc(o[1])}.`]),
    {explain:`<b>${w}</b> means ${esc(v[1])}.`});
  if(kind==='syn')return mkChoice(key,`Which word means almost the <b>same</b> as <b>${w}</b>?`,card,v[3],take(others.filter(o=>o[3]&&o[3]!==v[3]),2).map(o=>o[3]).concat(v[4]?[[v[4],`"${v[4]}" is the opposite of ${w}.`]]:take(others.filter(o=>o[3]),1).map(o=>o[3])),
    {explain:`<b>${w}</b> and <b>${v[3]}</b> mean almost the same thing: ${esc(v[1])}.`,hint:`${w} means ${esc(v[1])}. Which word is closest?`});
  if(kind==='ant')return mkChoice(key,`Which word means the <b>opposite</b> of <b>${w}</b>?`,card,v[4],(v[3]?[[v[3],`"${v[3]}" means almost the SAME as ${w}. We want the opposite.`]]:[]).concat(take(others.filter(o=>o[4]&&o[4]!==v[4]),3).map(o=>o[4])),
    {explain:`<b>${w}</b> means ${esc(v[1])}. The opposite is <b>${v[4]}</b>.`,hint:`${w} means ${esc(v[1])}. Which word means the other way around?`});
  return mkChoice(key,'Which word fits in the sentence?',`<div class="wsent">${esc(v[2]).replace('___','<span class="blank">?</span>')}</div>`,w,take(others,3).map(o=>[o[0],`"${o[0]}" means ${esc(o[1])}. Does that fit here?`]),
    {explain:`${esc(v[2]).replace('___',`<b>${w}</b>`)} (${w} = ${esc(v[1])})`,hint:'Read the sentence with each word. Which one makes sense? Look for clues around the blank.'});
}
function affixQ(){
  const i=rnd(AFFIXES.length),[a,mean,,list]=AFFIXES[i],[w,m,base]=pick(list),part=a.replace('-','');
  const wrong=[...new Set(shuffle(AFFIXES.filter((_,j)=>j!==i&&j<7)).map(x=>x[2](base)))].filter(x=>x!==m).slice(0,3).map(x=>[x,`That is a different prefix or suffix. ${a} means "${mean}".`]);
  return mkChoice('af:'+i,`<b>${a}</b> means "${mean}". What does <b>${w}</b> mean?`,`<div class="wx big">${w.replace(part,`<u>${part}</u>`)}</div>`,m,wrong,
    {explain:`${a} means "${mean}", so <b>${w}</b> means ${m}.`,hint:`Cover up "${part}". The word left is "${base}". Then add the meaning of ${a}.`});
}

/* ---------- today's words ---------- */
function nextWords(){const learned=new Set((S.vocab&&S.vocab.learned)||[]);const fresh=VOCAB.map(v=>v[0]).filter(w=>!learned.has(w));return(fresh.length>=4?fresh:shuffle(VOCAB.map(v=>v[0]))).slice(0,4)}
function wordReview(){
  const k=Object.entries(S.mistakes).filter(e=>/^[wspfq]:/.test(e[0])).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
  if(k.length&&rnd(3))return fromKey(pick(k.slice(0,4)));
  return pick([()=>sortR(pick(sort4Words())),()=>punctR(rnd(PUNCT.length)),()=>pairR(rnd(ADV_SENTS.length)),()=>proofR(rnd(PROOF.length)),()=>sentR(sentIdx('a',1)[0],'a')])();
}
function buildDailyWords(){
  const t=today(),ws=t.words,kinds=shuffle(['context','meaning','syn','ant']).map((k,i)=>i===3?'reverse':k);
  const rounds=[learnR(ws)].concat(ws.map((w,i)=>vocabQ(w,kinds[i])));
  const learned=((S.vocab&&S.vocab.learned)||[]).filter(w=>!ws.includes(w));
  const missed=Object.keys(S.mistakes).filter(k=>k.startsWith('v:')).map(k=>k.slice(2)).filter(w=>VW(w)&&!ws.includes(w));
  rounds.push(t.n%2&&learned.length?vocabQ(missed[0]||pick(learned),pick(['context','meaning','reverse'])):affixQ());
  rounds.push(wordReview());
  return rounds;
}

/* ---------- today's math and people ---------- */
function buildDailyMath(){
  const topic=MISS[today().topics.m],lv=lvFor(topic);
  if(!topic.gen.length)return topic.build(lv).slice(0,6);
  const main=topic.build(lv).slice(0,4),path=WORLDS.m.missions.filter(m=>m.id!==topic.id&&m.gen.length);
  const missed=Object.entries(S.mistakes).filter(e=>e[0].startsWith('mt:')).sort((a,b)=>b[1]-a[1]).map(e=>e[0].slice(3)).filter(k=>path.some(m=>m.gen.includes(k)));
  const done=path.filter(m=>S.done[m.id]).flatMap(m=>m.gen);
  const pool=[...new Set(missed.concat(shuffle(done.length?done:path.flatMap(m=>m.gen))))].slice(0,2);
  return main.concat(pool.map(k=>GEN[k](lv)));
}
function buildDailySocial(){
  const topic=MISS[today().topics.s],main=topic.build().slice(0,topic.n===3?5:4);
  const missed=Object.keys(S.mistakes).filter(k=>k.startsWith('so:')).map(k=>+k.slice(3)).filter(i=>SOCIAL[i]&&SOCIAL[i].m!==topic.n);
  const other=SOCIAL.map((_,i)=>i).filter(i=>SOCIAL[i].m!==topic.n&&(S.done['s'+SOCIAL[i].m]||SOCIAL[i].m<topic.n));
  const i=missed[0]??(other.length?pick(other):null);
  return i==null?main:main.concat([soR(i)]);
}
// Daily mission objects (registered in MISS so the normal player can run them).
function registerDaily(){
  const t=S.today;if(!t||!t.topics)return;
  const tm=MISS[t.topics.m],ts=MISS[t.topics.s];
  MISS.dw={id:'dw',daily:true,world:'w',link:null,name:'New Words',icon:'📖',short:'4 new words + review',learn:'Meet 4 new words, use them, then a quick review.',tip:'Read each word card first. Use clues in the sentence.',build:buildDailyWords,spec:null,bonus:'Use one of today\'s new words when you talk to a grown-up today.'};
  if(tm)MISS.dm={id:'dm',daily:true,world:'m',link:tm.id,name:tm.name,icon:tm.icon,short:`${tm.short} + review`,learn:tm.learn,tip:tm.tip,build:buildDailyMath,spec:tm.spec,bonus:tm.bonus,gen:tm.gen};
  if(ts)MISS.ds={id:'ds',daily:true,world:'s',link:ts.id,name:ts.name,icon:ts.icon,short:`${ts.short} + review`,learn:ts.learn,tip:ts.tip,build:buildDailySocial,spec:ts.spec,bonus:ts.bonus};
}
