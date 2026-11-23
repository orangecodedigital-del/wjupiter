/* West Jupiter — autenticação segregada no Cloudflare Pages.
 * Somente a credencial configurada como segredo de produção autoriza o acesso.
 * A sessão não concede qualquer permissão às unidades Polaris e Auriga.
 */
const PREFIX="/wjupiter";
const COOKIE="wjupiter_session";
const USER="wjupiter";
const TTL=8*60*60;
const encoder=new TextEncoder();
const headers={
  "Cache-Control":"private, no-store",
  "X-Content-Type-Options":"nosniff",
  "X-Frame-Options":"DENY",
  "X-Robots-Tag":"noindex, nofollow",
  "Referrer-Policy":"no-referrer"
};
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
const equal=(a,b)=>{a=String(a);b=String(b);let d=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)d|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return d===0;};
async function mac(secret,message){
 const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return hex(await crypto.subtle.sign("HMAC",key,encoder.encode(message)));
}
function protectedResponse(resp){
 const h=new Headers(resp.headers);
 Object.entries(headers).forEach(([name,value])=>h.set(name,value));
 return new Response(resp.body,{status:resp.status,statusText:resp.statusText,headers:h});
}
function redirect(to,cookie){
 const h=new Headers({Location:to,...headers});
 if(cookie)h.set("Set-Cookie",cookie);
 return new Response(null,{status:303,headers:h});
}
const loginHTML=(error=false)=>'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>West Jupiter | Shimmer × Seadrill</title><style>*{box-sizing:border-box}body{min-height:100vh;display:grid;place-items:center;margin:0;padding:22px;background:radial-gradient(circle at 72% 15%,#27566a,transparent 55%),#071925;color:#ecf7f8;font:14px Arial,Helvetica,sans-serif}main{max-width:440px;width:100%;padding:36px;background:#102d3cf2;border:1px solid #547784;box-shadow:0 20px 90px #06131cab}header{display:flex;align-items:center;gap:13px;border-bottom:1px solid #ffffff31;padding-bottom:23px}.mark{height:48px;width:48px;display:grid;place-items:center;background:#d77e55;color:white;font-weight:900;font-size:18px}.brand{font-size:13px;font-weight:bold;letter-spacing:.13em}.brand small{display:block;font-size:10px;color:#b6cbd2;margin-top:5px}.eyebrow{margin:24px 0 12px;font-size:10px;color:#efaa87;letter-spacing:.18em;font-weight:900}h1{font:normal 35px Georgia;margin:0 0 10px}p{font-size:13px;color:#b9c9ce;line-height:1.7;margin:0 0 22px}label{font-size:11px;font-weight:900;letter-spacing:.1em;display:block;margin:16px 0 8px}input{width:100%;padding:13px;color:white;background:#071c26;border:1px solid #557583}input:focus{border-color:#edac8c}button{width:100%;padding:16px;border:0;background:#da7750;color:white;font-weight:900;cursor:pointer;margin-top:24px}.warn{padding:12px;background:#922d2d44;border:1px solid #cc7b7b;color:#ffdddd;font-size:12px;margin-bottom:18px}footer{margin-top:25px;font-size:10px;color:#91a9b0;text-align:center}</style></head><body><main><header><div class="mark">WJ</div><div class="brand">WEST JUPITER<small>SHIMMER × SEADRILL</small></div></header><div class="eyebrow">ÁREA DOCUMENTAL RESTRITA · NR-13</div><h1>Acesso à unidade</h1><p>Ambiente exclusivo de controle documental e análise NR-13 da West Jupiter.</p>'+(error?'<div class="warn" role="alert">Credenciais inválidas ou acesso temporariamente bloqueado.</div>':"")+'<form method="post" action="/wjupiter/login" autocomplete="off"><label for="u">USUÁRIO</label><input id="u" name="user" required autocomplete="username"><label for="p">SENHA</label><input id="p" type="password" name="pass" required autocomplete="current-password"><button type="submit">ENTRAR NA UNIDADE</button></form><footer>SHIMMER PLATFORM · Acesso exclusivo West Jupiter</footer></main></body></html>';
const loginPage=(error=false,status=401)=>protectedResponse(new Response(loginHTML(error),{status,headers:{"Content-Type":"text/html; charset=utf-8"}}));
const unavailable=()=>protectedResponse(new Response("West Jupiter indisponível: configure WJ_PORTAL_PASSWORD, WJ_SESSION_SECRET e o binding DB no Cloudflare.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}}));
async function validSession(req,secret){
 const value=(req.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
 const match=value?.slice(COOKIE.length+1).match(/^(wjupiter)\.(\d{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/);
 if(!match)return false;
 const now=Math.floor(Date.now()/1000),stamp=Number(match[2]);
 if(stamp>now+30||stamp<now-TTL)return false;
 return equal(match[4],await mac(secret,match[1]+"."+match[2]+"."+match[3]));
}
async function doLogin(context,secret,password){
 const req=context.request,env=context.env;
 if(req.method!=="POST")return loginPage(false,405);
 const origin=req.headers.get("origin"),fetchSite=req.headers.get("sec-fetch-site");
 const accepted=new Set([new URL(req.url).origin,"https://shimmer-4j1.pages.dev"]);
 if(fetchSite==="cross-site"||(origin&&!accepted.has(origin)&&fetchSite!=="same-origin"))
  return protectedResponse(new Response("Origem não autorizada",{status:403}));
 if(Number(req.headers.get("content-length")||0)>4096)return loginPage(true,413);
 const raw=await req.text();
 if(raw.length>4096)return loginPage(true,413);
 const params=new URLSearchParams(raw);
 const ip=req.headers.get("CF-Connecting-IP")||"unknown";
 const id=hex(await crypto.subtle.digest("SHA-256",encoder.encode(secret+":wjupiter:"+ip)));
 try{
  const rec=await env.DB.prepare("SELECT attempts,blocked_until FROM auth_attempts WHERE identity_key=?").bind(id).first();
  const now=Math.floor(Date.now()/1000);
  if(rec?.blocked_until>now)return loginPage(true,429);
  const failures=rec?.blocked_until&&rec.blocked_until<=now?0:(rec?.attempts||0);
  const ok=equal(params.get("user")||"",USER)&&equal(params.get("pass")||"",password);
  if(!ok){
   const attempts=failures+1;
   await env.DB.prepare("INSERT INTO auth_attempts(identity_key,attempts,blocked_until) VALUES(?,?,?) ON CONFLICT(identity_key) DO UPDATE SET attempts=excluded.attempts,blocked_until=excluded.blocked_until").bind(id,Math.min(attempts,5),attempts>=5?now+900:0).run();
   return loginPage(true,401);
  }
  await env.DB.prepare("DELETE FROM auth_attempts WHERE identity_key=?").bind(id).run();
  const token="wjupiter."+now+"."+hex(crypto.getRandomValues(new Uint8Array(16)));
  const cookie=COOKIE+"="+token+"."+(await mac(secret,token))+"; Path=/wjupiter; Secure; HttpOnly; SameSite=Strict; Max-Age="+TTL;
  return redirect("/wjupiter/",cookie);
 }catch{return protectedResponse(new Response("Controle de acesso D1 indisponível.",{status:503}));}
}
export async function onRequest(context){
 const {request,env}=context,path=new URL(request.url).pathname;
 // Rota pública sem informações internas, destinada exclusivamente a verificar
 // a versão publicada. APIs e documentos continuam exigindo sessão válida.
 if(path==="/wjupiter/version"&&request.method==="GET"){
  return protectedResponse(Response.json({
   unit:"West Jupiter",version:"drive-private-20261123-v3",status:"site-code-loaded",
   documents:"authentication-required"
  },{headers:{"Content-Type":"application/json; charset=utf-8"}}));
 }
 const secret=env.WJ_SESSION_SECRET||env.SHIMMER_SESSION_SECRET,password=env.WJ_PORTAL_PASSWORD;
 const configured=Boolean(env.DB&&typeof secret==="string"&&secret.length>=32&&typeof password==="string"&&password.length>=7);
 if(!configured){
  if(request.method==="GET"&&(path===PREFIX+"/"||path===PREFIX+"/login")){
   const html=loginHTML(false).replace(/<form method="post"[\s\S]*?<\/form>/,
    '<div class="warn" role="status">A unidade está publicada no Cloudflare. A autenticação aguarda a configuração de produção.</div>');
   return protectedResponse(new Response(html,{status:200,headers:{"Content-Type":"text/html; charset=utf-8"}}));
  }
  return unavailable();
 }
 if(path===PREFIX+"/login")return doLogin(context,secret,password);
 if(path===PREFIX+"/logout")return redirect("/",COOKIE+"=; Path=/wjupiter; Secure; HttpOnly; SameSite=Strict; Max-Age=0");
 if(!(await validSession(request,secret))){
  if(path.startsWith(PREFIX+"/api/"))return protectedResponse(Response.json({error:"Faça login na West Jupiter."},{status:401}));
  return loginPage(false);
 }
 context.data.wjupiterSession={unit:"wjupiter",reviewer:"wjupiter"};
 return protectedResponse(await context.next());
}
