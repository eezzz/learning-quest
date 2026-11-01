#!/usr/bin/env node
/* Copies the web app into www/, which Capacitor packages into the iOS app. */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'www');
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT);
['index.html','privacy.html','manifest.webmanifest','assets','css','content','js'].forEach(f=>fs.cpSync(path.join(ROOT,f),path.join(OUT,f),{recursive:true}));
fs.rmSync(path.join(OUT,'content','src'),{recursive:true});fs.rmSync(path.join(OUT,'content','bank-lock.json'),{force:true});// only the built pack ships
console.log('www/ ready');
