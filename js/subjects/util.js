/* Small helpers shared by the math generators and the app. No DOM here: this file also runs in the native apps. */
const pad2=n=>String(n).padStart(2,'0');
const rnd=n=>Math.floor(Math.random()*n);
const between=(a,b)=>a+rnd(b-a+1);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const take=(arr,n,not=[])=>shuffle(arr.filter(x=>!not.includes(x))).slice(0,n);
const times=(n,f)=>Array.from({length:n},(_,k)=>f(k));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,'');
function mkChoice(key,prompt,visual,right,wrongs,o={}){
  const seen=new Set([String(right)]);
  const opts=[{t:String(right),ok:true,why:o.why}];
  wrongs.forEach(w=>{const[t,why]=Array.isArray(w)?w:[w,null];if(t==null||seen.has(String(t))||(typeof t==='number'&&t<0))return;seen.add(String(t));if(opts.length<4)opts.push({t:String(t),ok:false,why})});
  return Object.assign({type:'choice',key,prompt,visual,opts},o);
}
