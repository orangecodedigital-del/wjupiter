/* Google Drive privado da West Jupiter. Este módulo nunca roda no navegador. */
export const CATEGORIES=[
 "01. TECHNICAL SPECIFICATION","02. MAWP","03. DRAWING","04. PRESSURE TEST",
 "05. EXTERNAL INSPECTION","06. INTERNAL INSPECTION","07. NDT",
 "08. SAFETY DEVICE","09. INSTRUMENTS","10. ORIGINAL DOCUMENTS",
 "11. TECHNICAL INSPECTION RECOMMENDATION","12.  ANTI-LOCK DEVICE (DCBI)","13. OPERATING MANUAL"
];
const FOLDER="application/vnd.google-apps.folder";
const ID=/^[A-Za-z0-9_-]{12,200}$/;
const TAG=/^VP-[0-9]{3,4}$/;
let accessCache={email:"",token:"",expires:0};
export class DriveFailure extends Error{constructor(message,status=502){super(message);this.status=status;}}
export function json(data,status=200){return Response.json(data,{status,headers:{
 "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-Robots-Tag":"noindex, nofollow"
}});}
function encoded(bytes){
 const arr=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 let binary="";for(let i=0;i<arr.length;i++)binary+=String.fromCharCode(arr[i]);
 return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function validId(id){return typeof id==="string"&&ID.test(id);}
function requiredEnv(env){
 if(!env.WJ_GOOGLE_CLIENT_EMAIL||!env.WJ_GOOGLE_PRIVATE_KEY||!validId(env.WJ_DRIVE_ROOT_ID))
  throw new DriveFailure("Google Drive privado não configurado. Verifique as credenciais e a pasta raiz.",503);
}
async function token(env){
 requiredEnv(env);
 if(accessCache.token&&accessCache.email===env.WJ_GOOGLE_CLIENT_EMAIL&&Date.now()<accessCache.expires-120000)return accessCache.token;
 try{
  const pem=env.WJ_GOOGLE_PRIVATE_KEY.replace(/\\n/g,"\n");
  const base64=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,"");
  const key=await crypto.subtle.importKey("pkcs8",Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const now=Math.floor(Date.now()/1000);
  const header=encoded(new TextEncoder().encode(JSON.stringify({alg:"RS256",typ:"JWT"})));
  const claims=encoded(new TextEncoder().encode(JSON.stringify({
   iss:env.WJ_GOOGLE_CLIENT_EMAIL,scope:"https://www.googleapis.com/auth/drive.readonly",
   aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600
  })));
  const unsigned=header+"."+claims;
  const signature=encoded(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(unsigned)));
  const body=new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:unsigned+"."+signature});
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body,redirect:"error"});
  if(!r.ok)throw new DriveFailure("Credencial Google inválida ou API não habilitada.",503);
  const o=await r.json();if(!o.access_token||!o.expires_in)throw new DriveFailure("Google não forneceu token de acesso.",503);
  accessCache={email:env.WJ_GOOGLE_CLIENT_EMAIL,token:o.access_token,expires:Date.now()+Number(o.expires_in)*1000};
  return o.access_token;
 }catch(e){if(e instanceof DriveFailure)throw e;throw new DriveFailure("Não foi possível autenticar a conta de serviço Google.",503);}
}
async function call(env,url,options={}){
 const authorization="Bearer "+await token(env);
 let r;try{r=await fetch(url,{...options,headers:{...(options.headers||{}),Authorization:authorization},redirect:"error"});}
 catch{throw new DriveFailure("Falha de comunicação segura com o Google Drive.",502);}
 if(r.status===401||r.status===403)throw new DriveFailure("A conta de serviço não tem acesso ao acervo privado da West Jupiter.",503);
 if(r.status===404)throw new DriveFailure("Arquivo ou pasta não encontrado no Google Drive.",404);
 if(!r.ok)throw new DriveFailure("Google Drive indisponível (HTTP "+r.status+").",502);
 return r;
}
export async function listChildren(env,id){
 if(!validId(id))throw new DriveFailure("Pasta inválida.",400);
 let next=null,result=[],loops=0;
 do{
  const q=new URLSearchParams({
   q:"'"+id+"' in parents and trashed = false",
   fields:"nextPageToken,incompleteSearch,files(id,name,mimeType,size,parents,modifiedTime)",
   pageSize:"1000",supportsAllDrives:"true",includeItemsFromAllDrives:"true",orderBy:"name"
  });if(next)q.set("pageToken",next);
  const r=await call(env,"https://www.googleapis.com/drive/v3/files?"+q.toString());
  const data=await r.json();
  if(data.incompleteSearch||!Array.isArray(data.files))throw new DriveFailure("A listagem do Drive está incompleta.",503);
  result.push(...data.files);next=data.nextPageToken||null;loops++;
  if(loops>=20&&next)throw new DriveFailure("A pasta excede o limite de paginação segura.",503);
 }while(next);
 return result;
}
export async function listEquipment(env){
 requiredEnv(env);
 const root=await listChildren(env,env.WJ_DRIVE_ROOT_ID);
 return root.filter(x=>x.mimeType===FOLDER&&TAG.test(x.name)).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR",{numeric:true}));
}
export async function findEquipment(env,tag){
 if(!TAG.test(tag))throw new DriveFailure("TAG inválida.",400);
 const found=(await listEquipment(env)).find(x=>x.name===tag);
 if(!found)throw new DriveFailure("Equipamento não encontrado neste acervo.",404);
 return found;
}
export async function categoryFolders(env,tag){
 const equipment=await findEquipment(env,tag);
 const all=await listChildren(env,equipment.id),result=new Map();
 for(const name of CATEGORIES){
  const matches=all.filter(x=>x.mimeType===FOLDER&&x.name===name);
  if(matches.length>1)throw new DriveFailure("Há categorias duplicadas; revisão documental necessária.",409);
  if(matches.length===1)result.set(name,matches[0]);
 }
 return result;
}
export async function readEquipment(env,tag){
 const folders=await categoryFolders(env,tag);
 const perCategory=await Promise.all(CATEGORIES.map(async name=>{
  const folder=folders.get(name);if(!folder)return [];
  const items=await listChildren(env,folder.id);
  return items.filter(x=>x.mimeType!==FOLDER&&validId(x.id)).map(x=>({
   name:x.name,category:name,path:tag+"/"+name+"/"+x.id,
   bytes:Number(x.size)||0,pdf:x.mimeType==="application/pdf"||/\.pdf$/i.test(x.name)
  }));
 }));
 return perCategory.flat().sort((a,b)=>a.category.localeCompare(b.category,"pt-BR",{numeric:true})||a.name.localeCompare(b.name,"pt-BR",{numeric:true}));
}
export async function getFileMetadata(env,id){
 if(!validId(id))throw new DriveFailure("Identificador de arquivo inválido.",400);
 const q=new URLSearchParams({fields:"id,name,mimeType,parents,size,trashed",supportsAllDrives:"true"});
 const r=await call(env,"https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(id)+"?"+q);
 return r.json();
}
export async function media(env,id,range){
 if(!validId(id))throw new DriveFailure("Identificador inválido.",400);
 const headers={};if(range&&/^bytes=\d*-\d*$/.test(range))headers.Range=range;
 const r=await call(env,"https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(id)+"?alt=media&supportsAllDrives=true",{headers});
 return r;
}
