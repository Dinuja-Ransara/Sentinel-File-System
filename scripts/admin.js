// Moderation tool. Usage:
//   node scripts/admin.js reports            list abuse reports
//   node scripts/admin.js revoke <linkId>    disable a share link
//   node scripts/admin.js delete-user <email>  erase a user, their files and links
const {DatabaseSync}=require('node:sqlite'),fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','data'),db=new DatabaseSync(path.join(D,'sentinel.db'));db.exec('PRAGMA foreign_keys=ON');
const [cmd,arg]=process.argv.slice(2);
if(cmd==='reports'){const r=db.prepare('SELECT r.id,r.ts,r.link_id,f.name file,u.email owner,r.reason,r.ip FROM reports r LEFT JOIN files f ON f.id=r.file_id LEFT JOIN users u ON u.id=f.user_id ORDER BY r.id DESC LIMIT 50').all();console.table(r.map(x=>({...x,ts:new Date(x.ts).toISOString()})))}
else if(cmd==='revoke'&&arg){console.log(db.prepare('UPDATE links SET revoked=1 WHERE id=?').run(arg).changes?'Link revoked':'No such link')}
else if(cmd==='delete-user'&&arg){const u=db.prepare('SELECT id FROM users WHERE email=?').get(arg.toLowerCase());if(!u)console.log('No such user');else{db.prepare('SELECT id FROM files WHERE user_id=?').all(u.id).forEach(f=>fs.rmSync(path.join(D,'files',f.id),{force:true}));db.prepare('DELETE FROM links WHERE user_id=?').run(u.id);db.prepare('DELETE FROM audit WHERE user_id=?').run(u.id);db.prepare('DELETE FROM users WHERE id=?').run(u.id);console.log('User and all their data erased')}}
else console.log('Commands: reports | revoke <linkId> | delete-user <email>');
