require('dotenv').config();
const express=require('express'),helmet=require('helmet'),rl=require('express-rate-limit'),cookie=require('cookie-parser'),multer=require('multer'),
bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),{DatabaseSync}=require('node:sqlite'),crypto=require('crypto'),fs=require('fs'),path=require('path');
const sharp=require('sharp'),{PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const prod=process.env.NODE_ENV==='production',D=path.join(__dirname,'data'),FD=path.join(D,'files'),TMP=path.join(D,'tmp');
[D,FD,TMP].forEach(p=>fs.mkdirSync(p,{recursive:true}));
// keys: env in prod, auto-generated file in dev
const kf=path.join(D,'.keys');let K={};try{K=JSON.parse(fs.readFileSync(kf))}catch{}
if(!K.jwt||!K.master){K={jwt:crypto.randomBytes(48).toString('hex'),master:crypto.randomBytes(32).toString('hex')};if(!prod)fs.writeFileSync(kf,JSON.stringify(K),{mode:0o600})}
const JWT=process.env.JWT_SECRET||K.jwt,MASTER=Buffer.from(process.env.MASTER_KEY||K.master,'hex');
if(prod&&(!process.env.JWT_SECRET||!process.env.MASTER_KEY))throw new Error('Set JWT_SECRET and MASTER_KEY in production');
if(MASTER.length!==32)throw new Error('MASTER_KEY must be 64 hex chars');
const GB=1024**3,MB=1024**2;
const BILLING=false; // v2: flip when paid plans + a payment provider ship
const PLANS={
free:{name:'Starter',price:0,quota:5*GB,maxFile:100*MB,links:10,maxHours:168,fit:'Documents, scans and school or side projects.',features:['5 GB encrypted storage','Files up to 100 MB','10 active share links','Links last up to 7 days','Password-protected links','Download limits','Free file converter']},
plus:{name:'Plus',price:4,quota:200*GB,maxFile:1*GB,links:100,maxHours:720,fit:'Freelancers and families: photo libraries, design and work files.',features:['200 GB encrypted storage','Files up to 1 GB','100 active share links','Links last up to 30 days','Everything in Starter']},
pro:{name:'Pro',price:10,quota:2048*GB,maxFile:2*GB,links:1000,maxHours:8760,fit:'Studios and small teams: video, large archives and client delivery.',features:['2 TB encrypted storage','Files up to 2 GB','1,000 active share links','Links last up to 1 year','Everything in Plus','Priority support']}};
const db=new DatabaseSync(path.join(D,'sentinel.db'));db.exec('PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;');
db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT,hash TEXT NOT NULL,plan TEXT DEFAULT 'free',stripe_customer TEXT,created INTEGER);
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,name TEXT,size INTEGER,mime TEXT,iv TEXT,tag TEXT,wkey TEXT,created INTEGER);
CREATE TABLE IF NOT EXISTS links(id TEXT PRIMARY KEY,file_id TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,user_id TEXT NOT NULL,token_hash TEXT UNIQUE,pw_hash TEXT,expires INTEGER,max_dl INTEGER,dl INTEGER DEFAULT 0,revoked INTEGER DEFAULT 0,created INTEGER);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT,action TEXT,detail TEXT,ip TEXT,ts INTEGER);`);
try{db.exec('ALTER TABLE users ADD COLUMN tv INTEGER DEFAULT 0')}catch{}
for(const c of['starred INTEGER DEFAULT 0','trashed INTEGER'])try{db.exec('ALTER TABLE files ADD COLUMN '+c)}catch{}
try{db.exec('ALTER TABLE users ADD COLUMN google INTEGER DEFAULT 0')}catch{}
const uid=()=>crypto.randomUUID(),now=()=>Date.now(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const log=(u,a,d,req)=>db.prepare('INSERT INTO audit(user_id,action,detail,ip,ts) VALUES(?,?,?,?,?)').run(u,a,d||'',req?.ip||'',now());
const BLOCK=/\.(exe|bat|cmd|com|scr|msi|vbs|js|jar|ps1|sh|dll|apk)$/i;
// AES-256-GCM: per-file random key, wrapped by master key
const wrap=k=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',MASTER,iv),e=Buffer.concat([c.update(k),c.final()]);return Buffer.concat([iv,c.getAuthTag(),e]).toString('base64')};
const unwrap=s=>{const b=Buffer.from(s,'base64'),d=crypto.createDecipheriv('aes-256-gcm',MASTER,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()])};
function sendFile(f,res){const k=unwrap(f.wkey),d=crypto.createDecipheriv('aes-256-gcm',k,Buffer.from(f.iv,'hex'));d.setAuthTag(Buffer.from(f.tag,'hex'));
 res.setHeader('Content-Type','application/octet-stream');res.setHeader('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`);res.setHeader('X-Content-Type-Options','nosniff');
 const s=fs.createReadStream(path.join(FD,f.id));s.on('error',()=>res.destroy());d.on('error',()=>res.destroy());s.pipe(d).pipe(res)}
const app=express();app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],objectSrc:["'none'"],frameAncestors:["'none'"]}}}));
app.use(express.json({limit:'50kb'}));app.use(cookie());
app.use('/api',rl({windowMs:60000,limit:300}));
app.use('/api',(q,r,n)=>{r.set('Cache-Control','no-store');n()});
app.get('/api/health',(q,r)=>r.json({ok:1,version:require('./package.json').version}));
app.get('/api/config',(q,r)=>r.json({google:!!(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET)}));
const authLimit=rl({windowMs:15*60000,limit:20,message:{error:'Too many attempts. Try again later.'}});
const setSession=(res,u)=>res.cookie('st',jwt.sign({id:u.id,tv:u.tv||0},JWT,{expiresIn:'7d'}),{httpOnly:true,sameSite:'strict',secure:prod,maxAge:7*864e5});
const auth=(req,res,next)=>{try{const{id,tv}=jwt.verify(req.cookies.st,JWT);req.u=db.prepare('SELECT * FROM users WHERE id=?').get(id);if(!req.u||(req.u.tv||0)!==(tv||0))throw 0;if(!PLANS[req.u.plan])req.u.plan='free';next()}catch{res.status(401).json({error:'Not signed in'})}};
const pub=u=>({id:u.id,email:u.email,name:u.name,plan:u.plan,since:u.created,google:!!u.google,limits:PLANS[u.plan]});
const used=id=>db.prepare('SELECT COALESCE(SUM(size),0) s FROM files WHERE user_id=?').get(id).s;
app.post('/api/auth/register',authLimit,(req,res)=>{const{email,password,name}=req.body||{};
 if(!/^\S+@\S+\.\S+$/.test(email||'')||(password||'').length<10)return res.status(400).json({error:'Valid email and a password of 10+ characters required'});
 if(db.prepare('SELECT 1 FROM users WHERE email=?').get(email.toLowerCase()))return res.status(409).json({error:'Email already registered'});
 const u={id:uid(),email:email.toLowerCase(),name:(name||'').slice(0,80),hash:bcrypt.hashSync(password,12),plan:'free',stripe_customer:null,created:now()};
 db.prepare('INSERT INTO users(id,email,name,hash,plan,stripe_customer,created) VALUES(@id,@email,@name,@hash,@plan,@stripe_customer,@created)').run(u);setSession(res,u);log(u.id,'auth.register','',req);res.json(pub(u))});
app.post('/api/auth/login',authLimit,(req,res)=>{const{email,password}=req.body||{};const u=db.prepare('SELECT * FROM users WHERE email=?').get(String(email||'').toLowerCase());
 if(!u||!bcrypt.compareSync(String(password||''),u.hash)){return res.status(401).json({error:'Invalid email or password'})}
 setSession(res,u);log(u.id,'auth.login','',req);res.json(pub(u))});
app.post('/api/auth/logout',(req,res)=>{res.clearCookie('st');res.json({ok:1})});
// Google sign-in (OAuth 2.0 authorization-code flow). Needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET; redirect URI = APP_URL + /api/auth/google/callback
const gBase=req=>process.env.APP_URL||`${req.protocol}://${req.get('host')}`;
app.get('/api/auth/google',(req,res)=>{const id=process.env.GOOGLE_CLIENT_ID;if(!id||!process.env.GOOGLE_CLIENT_SECRET)return res.redirect('/?auth_error=google_off');
 const state=crypto.randomBytes(16).toString('hex');res.cookie('gs',state,{httpOnly:true,sameSite:'lax',secure:prod,maxAge:600000});
 res.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+new URLSearchParams({client_id:id,redirect_uri:gBase(req)+'/api/auth/google/callback',response_type:'code',scope:'openid email profile',state,prompt:'select_account'}))});
app.get('/api/auth/google/callback',authLimit,async(req,res)=>{try{const{code,state}=req.query;if(!code||!state||state!==req.cookies.gs)throw new Error('state');res.clearCookie('gs');
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:String(code),client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:gBase(req)+'/api/auth/google/callback',grant_type:'authorization_code'})}),t=await r.json();if(!r.ok||!t.access_token)throw new Error('token');
 const p=await(await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+t.access_token}})).json();if(!p.email||p.email_verified!==true)throw new Error('email');
 const email=String(p.email).toLowerCase();let u=db.prepare('SELECT * FROM users WHERE email=?').get(email);
 let note='';
 if(!u){u={id:uid(),email,name:String(p.name||'').slice(0,80),hash:bcrypt.hashSync(crypto.randomBytes(32).toString('hex'),12),plan:'free',stripe_customer:null,created:now()};db.prepare('INSERT INTO users(id,email,name,hash,plan,stripe_customer,created) VALUES(@id,@email,@name,@hash,@plan,@stripe_customer,@created)').run(u);db.prepare('UPDATE users SET google=1 WHERE id=?').run(u.id);u.google=1;log(u.id,'auth.register','google',req)}
 else if(!u.google){ // existing email+password account: Google now proves who owns this email. Disable the old password and end old sessions, so anyone who pre-registered this email loses access.
  db.prepare('UPDATE users SET google=1,hash=?,tv=COALESCE(tv,0)+1 WHERE id=?').run(bcrypt.hashSync(crypto.randomBytes(32).toString('hex'),12),u.id);u=db.prepare('SELECT * FROM users WHERE id=?').get(u.id);log(u.id,'auth.google_linked','',req);note='?notice=google_linked'}
 else log(u.id,'auth.login','google',req);
 setSession(res,u);res.redirect('/'+note)}catch(e){res.redirect('/?auth_error=google_failed')}});
app.get('/api/me',auth,(req,res)=>res.json({...pub(req.u),used:used(req.u.id),plans:PLANS,billing:BILLING}));
const upload=multer({dest:TMP,limits:{fileSize:2*GB}});
app.get('/api/files',auth,(req,res)=>res.json(db.prepare('SELECT id,name,size,mime,created,starred,trashed FROM files WHERE user_id=? ORDER BY created DESC').all(req.u.id)));
app.post('/api/files',auth,upload.single('file'),(req,res)=>{const f=req.file,P=PLANS[req.u.plan],rm=()=>f&&fs.rm(f.path,()=>{});
 if(!f)return res.status(400).json({error:'No file'});
 const name=path.basename(f.originalname).slice(0,200);
 if(BLOCK.test(name)){rm();return res.status(400).json({error:'Executable file types are blocked for safety'})}
 if(f.size>P.maxFile){rm();return res.status(413).json({error:`${P.name} plan allows files up to ${Math.round(P.maxFile/MB)} MB`})}
 if(used(req.u.id)+f.size>P.quota){rm();return res.status(402).json({error:'Storage full. Delete files you no longer need to free up space.'})}
 const id=uid(),key=crypto.randomBytes(32),iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',key,iv);
 fs.createReadStream(f.path).pipe(c).pipe(fs.createWriteStream(path.join(FD,id))).on('finish',()=>{rm();
  try{db.prepare('INSERT INTO files(id,user_id,name,size,mime,iv,tag,wkey,created) VALUES(?,?,?,?,?,?,?,?,?)').run(id,req.u.id,name,f.size,f.mimetype,iv.toString('hex'),c.getAuthTag().toString('hex'),wrap(key),now());
  log(req.u.id,'file.upload',name,req);res.json({id,name,size:f.size})}catch(e){console.error(e.message);fs.rm(path.join(FD,id),()=>{});res.status(500).json({error:'Upload failed'})}}).on('error',()=>{rm();res.status(500).json({error:'Upload failed'})})});
const own=(req)=>db.prepare('SELECT * FROM files WHERE id=? AND user_id=?').get(req.params.id,req.u.id);
app.get('/api/files/:id/download',auth,(req,res)=>{const f=own(req);if(!f)return res.sendStatus(404);log(req.u.id,'file.download',f.name,req);sendFile(f,res)});
app.delete('/api/files/:id',auth,(req,res)=>{const f=own(req);if(!f)return res.sendStatus(404);db.prepare('DELETE FROM files WHERE id=?').run(f.id);fs.rm(path.join(FD,f.id),()=>{});log(req.u.id,'file.delete',f.name,req);res.json({ok:1})});
// share links
app.get('/api/links',auth,(req,res)=>res.json(db.prepare('SELECT l.id,f.name,l.expires,l.max_dl,l.dl,l.revoked,l.created,(l.pw_hash IS NOT NULL) pw FROM links l JOIN files f ON f.id=l.file_id WHERE l.user_id=? ORDER BY l.created DESC').all(req.u.id)));
app.post('/api/links',auth,(req,res)=>{const{fileId,hours=24,password,maxDownloads}=req.body||{},f=db.prepare('SELECT * FROM files WHERE id=? AND user_id=?').get(fileId,req.u.id),P=PLANS[req.u.plan];
 if(!f)return res.sendStatus(404);
 if(db.prepare('SELECT COUNT(*) c FROM links WHERE user_id=? AND revoked=0 AND expires>?').get(req.u.id,now()).c>=P.links)return res.status(402).json({error:'Active link limit reached. Revoke a link you no longer need.'});
 if((password||maxDownloads)&&BILLING&&req.u.plan==='free')return res.status(402).json({error:'Passwords and download limits are Plus features.'});
 const token=crypto.randomBytes(32).toString('base64url'),h=Math.min(Math.max(+hours||24,5/60),P.maxHours);
 db.prepare('INSERT INTO links(id,file_id,user_id,token_hash,pw_hash,expires,max_dl,created) VALUES(?,?,?,?,?,?,?,?)').run(uid(),f.id,req.u.id,sha(token),password?bcrypt.hashSync(String(password),10):null,now()+h*36e5,Math.floor(+maxDownloads)>0?Math.floor(+maxDownloads):null,now());
 log(req.u.id,'link.create',f.name,req);res.json({url:`${process.env.APP_URL||`${req.protocol}://${req.get('host')}`}/s/${token}`})});
app.delete('/api/links/:id',auth,(req,res)=>{db.prepare('UPDATE links SET revoked=1 WHERE id=? AND user_id=?').run(req.params.id,req.u.id);log(req.u.id,'link.revoke',req.params.id,req);res.json({ok:1})});
const getLink=t=>{const l=db.prepare('SELECT l.*,f.name,f.size FROM links l JOIN files f ON f.id=l.file_id WHERE token_hash=? AND f.trashed IS NULL').get(sha(t));
 return l&&!l.revoked&&l.expires>now()&&(!l.max_dl||l.dl<l.max_dl)?l:null};
app.get('/api/public/:t',(req,res)=>{const l=getLink(req.params.t);if(!l)return res.status(404).json({error:'This link is invalid, expired, or revoked.'});res.json({name:l.name,size:l.size,pw:!!l.pw_hash,expires:l.expires,left:l.max_dl?l.max_dl-l.dl:null})});
app.post('/api/public/:t/download',authLimit,(req,res)=>{const l=getLink(req.params.t);if(!l)return res.status(404).json({error:'This link is invalid, expired, or revoked.'});
 if(l.pw_hash&&!bcrypt.compareSync(String(req.body?.password||''),l.pw_hash))return res.status(401).json({error:'Incorrect password'});
 if(!db.prepare('UPDATE links SET dl=dl+1 WHERE id=? AND (max_dl IS NULL OR dl<max_dl)').run(l.id).changes)return res.status(404).json({error:'This link has reached its download limit.'});log(l.user_id,'link.download',l.name,req);sendFile(db.prepare('SELECT * FROM files WHERE id=?').get(l.file_id),res)});
db.exec('CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT,link_id TEXT,file_id TEXT,reason TEXT,ip TEXT,ts INTEGER)');
app.post('/api/public/:t/report',authLimit,(req,res)=>{const l=db.prepare('SELECT l.*,f.name FROM links l JOIN files f ON f.id=l.file_id WHERE token_hash=?').get(sha(req.params.t));if(!l)return res.status(404).json({error:'Link not found'});
 db.prepare('INSERT INTO reports(link_id,file_id,reason,ip,ts) VALUES(?,?,?,?,?)').run(l.id,l.file_id,String(req.body?.reason||'').slice(0,500),req.ip,now());log(l.user_id,'link.reported',l.name,req);res.json({ok:1})});
app.get('/api/activity',auth,(req,res)=>res.json(db.prepare('SELECT action,detail,ip,ts FROM audit WHERE user_id=? ORDER BY id DESC LIMIT 100').all(req.u.id)));

app.patch('/api/files/:id',auth,(req,res)=>{const f=own(req);if(!f)return res.sendStatus(404);const{name,starred,trashed}=req.body||{};
 if(typeof name==='string'&&name.trim()&&!BLOCK.test(name))db.prepare('UPDATE files SET name=? WHERE id=?').run(path.basename(name).slice(0,200),f.id);
 if(starred!==undefined)db.prepare('UPDATE files SET starred=? WHERE id=?').run(starred?1:0,f.id);
 if(trashed!==undefined){db.prepare('UPDATE files SET trashed=? WHERE id=?').run(trashed?now():null,f.id);log(req.u.id,trashed?'file.trash':'file.restore',f.name,req)}res.json({ok:1})});
app.post('/api/me/signout-all',auth,(req,res)=>{const tv=(req.u.tv||0)+1;db.prepare('UPDATE users SET tv=? WHERE id=?').run(tv,req.u.id);setSession(res,{id:req.u.id,tv});log(req.u.id,'auth.signout_all','',req);res.json({ok:1})});
app.patch('/api/me',auth,(req,res)=>{db.prepare('UPDATE users SET name=? WHERE id=?').run(String(req.body?.name||'').slice(0,80),req.u.id);log(req.u.id,'profile.update','',req);res.json({ok:1})});
app.post('/api/me/password',authLimit,auth,(req,res)=>{const{current,next}=req.body||{};
 if(!bcrypt.compareSync(String(current||''),req.u.hash))return res.status(401).json({error:'Current password is incorrect'});
 if(String(next||'').length<10)return res.status(400).json({error:'New password must be 10+ characters'});
 db.prepare('UPDATE users SET hash=? WHERE id=?').run(bcrypt.hashSync(next,12),req.u.id);log(req.u.id,'auth.password','',req);res.json({ok:1})});
app.delete('/api/me',authLimit,auth,(req,res)=>{if(req.u.google){if(req.body?.confirm!=='DELETE')return res.status(400).json({error:'Type DELETE to confirm'})}else if(!bcrypt.compareSync(String(req.body?.password||''),req.u.hash))return res.status(401).json({error:'Password is incorrect'});
 db.prepare('SELECT id FROM files WHERE user_id=?').all(req.u.id).forEach(f=>fs.rm(path.join(FD,f.id),()=>{}));
 db.prepare('DELETE FROM links WHERE user_id=?').run(req.u.id);db.prepare('DELETE FROM audit WHERE user_id=?').run(req.u.id);db.prepare('DELETE FROM users WHERE id=?').run(req.u.id);res.clearCookie('st');res.json({ok:1})});
// converter (nothing is stored)
const cvUp=multer({dest:TMP,limits:{fileSize:50*MB}});
const readVault=f=>{const d=crypto.createDecipheriv('aes-256-gcm',unwrap(f.wkey),Buffer.from(f.iv,'hex'));d.setAuthTag(Buffer.from(f.tag,'hex'));return Buffer.concat([d.update(fs.readFileSync(path.join(FD,f.id))),d.final()])};
const csvParse=t=>{const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const h=t[i];if(q){if(h==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=h}else if(h==='"')q=true;else if(h===',')r.push(c),c='';else if(h==='\n'||h==='\r'){if(h==='\r'&&t[i+1]==='\n')i++;r.push(c);c='';rows.push(r);r=[]}else c+=h}if(c||r.length){r.push(c);rows.push(r)}return rows};
const csvCell=v=>{v=v==null?'':typeof v==='object'?JSON.stringify(v):String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
async function textPdf(text){const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),W=595,H=842,M=50,S=11;let pg=doc.addPage([W,H]),y=H-M;
 const draw=l=>{if(y<M){pg=doc.addPage([W,H]);y=H-M}pg.drawText(l,{x:M,y,size:S,font,color:rgb(.1,.1,.1)});y-=S*1.5};
 for(const para of text.replace(/\t/g,'  ').replace(/[^\n\r\x20-\x7E\xA0-\xFF]/g,'?').split(/\r?\n/)){let line='';for(const w of para.split(' ')){const t=line?line+' '+w:w;if(font.widthOfTextAtSize(t,S)>W-2*M&&line){draw(line);line=w}else line=t}draw(line)}
 return Buffer.from(await doc.save())}
app.post('/api/convert',auth,cvUp.single('file'),async(req,res)=>{try{let buf,name;const to=String(req.body.to||'').toLowerCase();
 if(req.file){buf=fs.readFileSync(req.file.path);name=path.basename(req.file.originalname)}
 else{const f=db.prepare('SELECT * FROM files WHERE id=? AND user_id=?').get(req.body.fileId,req.u.id);if(!f)return res.status(400).json({error:'Choose a file first'});buf=readVault(f);name=f.name}
 const ext=(name.split('.').pop()||'').toLowerCase(),IMG=['png','jpg','jpeg','webp','avif','gif','tiff'];let out;
 if(IMG.includes(ext)&&['png','jpg','webp','avif'].includes(to))out=await sharp(buf).toFormat(to==='jpg'?'jpeg':to).toBuffer();
 else if(IMG.includes(ext)&&to==='pdf'){const doc=await PDFDocument.create(),im=await doc.embedPng(await sharp(buf).png().toBuffer());doc.addPage([im.width,im.height]).drawImage(im,{x:0,y:0,width:im.width,height:im.height});out=Buffer.from(await doc.save())}
 else if(['txt','md'].includes(ext)&&to==='pdf')out=await textPdf(buf.toString('utf8').slice(0,2e6));
 else if(ext==='csv'&&to==='json'){const[h,...r]=csvParse(buf.toString('utf8').trim());out=Buffer.from(JSON.stringify(r.map(x=>Object.fromEntries(h.map((k,i)=>[k,x[i]??'']))),null,2))}
 else if(ext==='json'&&to==='csv'){const a=JSON.parse(buf.toString('utf8'));if(!Array.isArray(a))throw new Error('JSON must be an array of objects');const h=[...new Set(a.flatMap(o=>Object.keys(o)))];out=Buffer.from([h.map(csvCell).join(','),...a.map(o=>h.map(k=>csvCell(o[k])).join(','))].join('\n'))}
 else return res.status(400).json({error:'That conversion is not supported'});
 log(req.u.id,'file.convert',`${name} → ${to}`,req);res.set('Content-Type','application/octet-stream').send(out)}
 catch(e){res.status(400).json({error:'Conversion failed: '+String(e.message).slice(0,100)})}finally{req.file&&fs.rm(req.file.path,()=>{})}});
app.use(express.static(path.join(__dirname,'public')));
app.get('/s/:t',(q,r)=>r.sendFile(path.join(__dirname,'public/index.html')));
app.use((e,req,res,next)=>{console.error(e.message);res.status(500).json({error:'Server error'})});
process.on('unhandledRejection',e=>console.error('unhandled:',e));
setInterval(()=>fs.readdir(TMP,(e,l)=>(l||[]).forEach(f=>fs.stat(path.join(TMP,f),(e2,st)=>st&&Date.now()-st.mtimeMs>36e5&&fs.rm(path.join(TMP,f),()=>{})))),6e5).unref(); // clear abandoned upload temp files
app.listen(process.env.PORT||3000,()=>console.log('Sentinel running on :'+(process.env.PORT||3000)));
