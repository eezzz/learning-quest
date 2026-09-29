/* Expert words: a small, above-grade "stretch" inside each day's reward.
   - Every Discovery card has one real expert word (middle school, high school or college level),
     with how to say it, what it means, and one quick "Expert check" question.
   - Getting the check right (first or second try) earns an Expert stamp on that card.
   - Stamps in an interest earn real job titles: 3 stamps, 6 stamps and all 12.
   It is part of the reward, not extra practice: one word per finished day, and checks for cards
   the child already owns can be retried from the Field Guide. Loaded after rewards.js; calls boot(). */

const XBAND={m:'Middle school word',h:'High school word',c:'College word'};
const XBANDLONG={m:'Most kids learn this word in middle school.',h:'Most people learn this word in high school.',c:'Most people learn this word in college.'};
const XTIERS=[3,6,12];
const expertOf=c=>{const E=typeof EXPERT!=='undefined'&&EXPERT[c.k];const w=E&&E.words[c.i];return w?{word:w[0],say:w[1],meaning:w[2],band:w[3],q:w[4],choices:w[5],ans:w[6]}:null};
const xkey=c=>c.k+':'+c.i;
const hasStamp=c=>!!(S.expert&&S.expert[xkey(c)]);
const stampsIn=k=>Object.keys(S.expert||{}).filter(x=>x.split(':')[0]===k).length;
function jobFor(k,n=stampsIn(k)){const E=typeof EXPERT!=='undefined'&&EXPERT[k];if(!E)return null;let t=-1;XTIERS.forEach((m,i)=>{if(n>=m)t=i});return t<0?null:E.jobs[t]}
function nextJob(k){const E=typeof EXPERT!=='undefined'&&EXPERT[k],n=stampsIn(k),i=XTIERS.findIndex(m=>n<m);return E&&i>=0?{job:E.jobs[i],left:XTIERS[i]-n}:null}
const gradeWord=()=>GRADE_NAMES[S.profile.grade]||'your grade';

/* The expert word panel with its check. `done` is called after the check ends. */
function expertHTML(c){
  const x=expertOf(c);if(!x)return'';const got=hasStamp(c);
  return`<div class="xword" data-k="${c.k}" data-i="${c.i}">
    <div class="eyebrow">🎓 Expert word · <span class="xband">${XBAND[x.band]||'Expert word'}</span></div>
    <div class="xw"><b class="disp">${esc(x.word)}</b> <button class="ghost xsay" aria-label="Hear the word">🔊</button></div>
    <div class="fact">Say it: ${esc(x.say)}</div>
    <p class="xmean">${esc(x.meaning)}</p>
    <p class="fact">${XBANDLONG[x.band]||''} You're in ${esc(gradeWord())}. Now you know it too!</p>
    ${got?`<p class="xstamp">🎓 Expert stamp earned</p>`:`<div class="xcheck"><div class="eyebrow">Expert check</div><p class="xq">${esc(x.q)}</p>
      <div class="xopts">${x.choices.map((t,i)=>`<button class="xopt" data-i="${i}">${esc(t)}</button>`).join('')}</div><p class="fact xfb" aria-live="polite"></p></div>`}
  </div>`;
}
function wireExpert(root,onStamp){
  root.querySelectorAll('.xword').forEach(box=>{
    const c={k:box.dataset.k,i:+box.dataset.i},x=expertOf(c);if(!x)return;let tries=0;
    box.querySelector('.xsay').onclick=()=>speak(x.word);
    box.querySelectorAll('.xopt').forEach(b=>b.onclick=()=>{
      if(b.disabled)return;const i=+b.dataset.i,fb=box.querySelector('.xfb');
      if(i===x.ans){
        box.querySelectorAll('.xopt').forEach(o=>o.disabled=true);b.classList.add('right');
        const before=jobFor(c.k);S.expert=S.expert||{};S.expert[xkey(c)]=dayStr();S.stars+=2;save();
        const after=jobFor(c.k),nj=nextJob(c.k);
        fb.innerHTML=`<b>🎓 Expert stamp!</b> +2 ⭐`+(after&&after!==before?`<br><span class="xnew">New title: <b>${esc(after)}</b>!</span>`:nj?`<br>${nj.left} more stamp${nj.left===1?'':'s'} to become a <b>${esc(nj.job)}</b>.`:'');
        if(autoRead())speak(`Expert stamp! ${after&&after!==before?`You are now a ${after}!`:''}`);
        if(onStamp)onStamp(c);
      }else{
        tries++;shake(b);b.disabled=true;
        if(tries===1){fb.textContent='Not quite. Read the meaning again and try one more time.';if(autoRead())speak('Not quite. '+x.meaning+' Try one more time.')}
        else{box.querySelectorAll('.xopt').forEach(o=>{o.disabled=true;if(+o.dataset.i===x.ans)o.classList.add('right')});
          b.classList.add('wrong');fb.textContent='Now you know it! You can try this check again tomorrow in your Field Guide.';if(autoRead())speak('The answer is '+x.choices[x.ans]+'. Now you know it!')}
      }
    });
  });
}

/* ---------- results page: the expert word comes with the day's new card ---------- */
const _endMissionX=window.endMission;
window.endMission=function(){
  const t=today(),was=t.rewarded;_endMissionX();
  if(!was&&t.rewarded&&t.cardGot){
    const card=$('#v-result .dcard');if(!card)return;
    card.insertAdjacentHTML('afterend',expertHTML(t.cardGot));wireExpert($('#v-result'));
    const x=expertOf(t.cardGot);if(x&&autoRead())setTimeout(()=>speak(`Expert word: ${x.word}. ${x.meaning} ${x.q}`),7000);
  }
};

/* ---------- home: the child's expert titles ---------- */
const _renderHomeX=window.renderHome;
window.renderHome=function(){
  _renderHomeX();if(!S)return;
  const titles=Object.keys(typeof EXPERT!=='undefined'?EXPERT:{}).map(k=>jobFor(k)).filter(Boolean);
  const g=$('#v-home .goldgoal');
  if(g)g.insertAdjacentHTML('afterend',titles.length?`<p class="fact xtitles">🎓 You are a <b>${titles.map(esc).join('</b>, <b>')}</b></p>`:`<p class="fact xtitles">🎓 Earn expert stamps to become a real ${esc((EXPERT[cardInterests()[0]]||{jobs:['expert']}).jobs[0])}</p>`);
};

/* ---------- Field Guide: expert words on owned cards, titles per interest, retry checks ---------- */
const _renderCardsX=window.renderCards;
window.renderCards=function(){
  _renderCardsX();if(!S||typeof EXPERT==='undefined')return;
  const v=$('#v-stk');
  v.querySelectorAll('h3.dgh').forEach(h=>{
    const k=h.dataset.k;if(!k||!EXPERT[k])return;
    const job=jobFor(k),nj=nextJob(k),n=stampsIn(k);
    h.insertAdjacentHTML('beforeend',` <small class="xjob">🎓 ${n} expert stamp${n===1?'':'s'}${job?` · ${esc(job)}`:''}${nj?` · ${nj.left} more to ${esc(nj.job)}`:''}</small>`);
  });
  // add the expert word to each owned card (cards appear in the same order as S.cards within each interest)
  const seen={};
  (S.cards||[]).forEach(c=>{seen[c.k]=seen[c.k]||[];seen[c.k].push(c)});
  v.querySelectorAll('h3.dgh').forEach(h=>{
    const k=h.dataset.k;const grid=h.nextElementSibling;if(!k||!grid||!seen[k])return;
    [...grid.querySelectorAll('.stk:not(.lock)')].forEach((el,j)=>{const c=seen[k][j];const x=c&&expertOf(c);if(!x)return;
      el.insertAdjacentHTML('beforeend',`<div class="xmini">🎓 <b>${esc(x.word)}</b> <small>${XBAND[x.band]||''}</small>${hasStamp(c)?' <span class="xok">✔ stamp</span>':`<button class="ghost xretry" data-k="${c.k}" data-i="${c.i}">Expert check</button>`}</div>`)});
  });
  v.querySelectorAll('.xretry').forEach(b=>b.onclick=()=>openExpertCheck({k:b.dataset.k,i:+b.dataset.i}));
};
function openExpertCheck(c){
  const ov=$('#overlay');
  ov.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Expert check">${expertHTML(c)}<div class="btnrow"><button class="ghost" id="shX">Close</button></div></div>`;
  ov.hidden=false;$('#shX').onclick=()=>{closeSheet();renderCards()};wireExpert(ov);
  const x=expertOf(c);if(autoRead())speak(`${x.word}. ${x.meaning} ${x.q}`);
}

/* ---------- parent dashboard: expert words the child has learned ---------- */
const _renderParentX=window.renderParent;
window.renderParent=function(){
  _renderParentX();if(parTab!=='progress'||!S||typeof EXPERT==='undefined')return;
  const rows=(S.cards||[]).map(c=>({c,x:expertOf(c)})).filter(r=>r.x);
  const titles=Object.keys(EXPERT).map(k=>jobFor(k)).filter(Boolean);
  const sec=`<section><h2>Expert words</h2><p class="fact">Each finished day brings one real word from middle school, high school or college, tied to the child's interests. A correct Expert check earns a stamp; stamps earn job titles.${titles.length?` Titles: <b>${titles.map(esc).join(', ')}</b>.`:''}</p>
    ${rows.length?`<table><tr><th>Word</th><th>Level</th><th>Meaning</th><th>Stamp</th></tr>${rows.map(r=>`<tr><td><b>${esc(r.x.word)}</b></td><td>${XBAND[r.x.band]||''}</td><td>${esc(r.x.meaning)}</td><td class="c">${hasStamp(r.c)?'✔':''}</td></tr>`).join('')}</table>`:'<p>No expert words yet. The first one comes with the first finished day.</p>'}</section>`;
  $('#v-par .parent').insertAdjacentHTML('beforeend',sec);
};

boot();
