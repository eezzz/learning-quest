/* Inside the iOS app, progress is also kept in native storage, because iOS may clear a web view's
   localStorage when the device runs low on space. Does nothing in a browser.
   Loaded before main.js. */
(function(){
  const C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
  const P=C.Plugins&&C.Plugins.Preferences;if(!P)return;
  const THEME='learning-quest-theme';let timer=0;
  const mirror=()=>{clearTimeout(timer);timer=0;
    [ROOTKEY,THEME].forEach(k=>{const v=localStorage.getItem(k);if(v!=null)P.set({key:k,value:v}).catch(()=>{})})};
  const _save=window.save;
  window.save=function(){_save();if(!timer)timer=setTimeout(mirror,500)};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer)mirror()});
  // If the web view lost its data, put it back and start again. Otherwise bring native storage up to date.
  if(localStorage.getItem(ROOTKEY)!=null){mirror();return}
  Promise.all([P.get({key:ROOTKEY}),P.get({key:THEME})]).then(([r,t])=>{
    if(t.value)localStorage.setItem(THEME,t.value);
    if(r.value){localStorage.setItem(ROOTKEY,r.value);location.reload()}
  }).catch(()=>{});
})();
