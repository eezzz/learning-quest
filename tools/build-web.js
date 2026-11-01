#!/usr/bin/env node
/* Copies the web app into www/, which Capacitor packages into the iOS app. */
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'www');
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT);
['index.html','manifest.webmanifest','assets','css','data','js'].forEach(f=>fs.cpSync(path.join(ROOT,f),path.join(OUT,f),{recursive:true}));
fs.rmSync(path.join(OUT,'data','bank-lock.json'));// a release-check file, not needed at run time
console.log('www/ ready');
