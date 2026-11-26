// Usage: node scripts/backup.js   (safe while the server is running)
const {DatabaseSync}=require('node:sqlite'),{execFileSync}=require('child_process'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),D=path.join(root,'data'),B=path.join(root,'backups');fs.mkdirSync(B,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),snap=path.join(D,`snapshot-${stamp}.db`);
const db=new DatabaseSync(path.join(D,'sentinel.db'));db.exec(`VACUUM INTO '${snap.replace(/'/g,"''")}'`);db.close();
const out=path.join(B,`sentinel-${stamp}.tar.gz`);
execFileSync('tar',['-czf',out,'-C',D,'files',path.basename(snap)]);fs.rmSync(snap);
fs.readdirSync(B).filter(f=>f.endsWith('.tar.gz')).sort().slice(0,-14).forEach(f=>fs.rmSync(path.join(B,f)));
console.log('Backup written:',out,'\nNOTE: also keep your .env / MASTER_KEY backed up separately and offline.');
