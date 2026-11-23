import {CATEGORIES,categoryFolders,getFileMetadata,media,json,DriveFailure} from "../../shared/wj-drive.js";
export async function onRequest(context){
 if(context.data?.wjupiterSession?.unit!=="wjupiter")return json({error:"Acesso não autorizado."},401);
 if(context.request.method!=="GET")return json({error:"Método não permitido."},405);
 const path=new URL(context.request.url).searchParams.get("path")||"";
 const parts=path.split("/");
 if(path.length>420||parts.length!==3||!/^VP-\d{3,4}$/.test(parts[0])||!CATEGORIES.includes(parts[1])||!/^[A-Za-z0-9_-]{12,200}$/.test(parts[2]))
  return json({error:"Referência de arquivo inválida."},400);
 try{
  const [tag,category,id]=parts;
  const folder=(await categoryFolders(context.env,tag)).get(category);
  if(!folder)return json({error:"Categoria não encontrada."},404);
  const info=await getFileMetadata(context.env,id);
  if(info.trashed||!Array.isArray(info.parents)||!info.parents.includes(folder.id)||info.mimeType==="application/vnd.google-apps.folder")
   return json({error:"Arquivo não pertence à TAG e categoria selecionadas."},404);
  const source=await media(context.env,id,context.request.headers.get("Range"));
  const pdf=info.mimeType==="application/pdf";
  const filename=String(info.name||"documento").replace(/[\r\n]/g,"").slice(0,180);
  const headers=new Headers({
   "Content-Type":pdf?"application/pdf":(info.mimeType||"application/octet-stream"),
   "Content-Disposition":(pdf?"inline":"attachment")+"; filename*=UTF-8''"+encodeURIComponent(filename),
   "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff",
   "X-Robots-Tag":"noindex, nofollow","Content-Security-Policy":"sandbox"
  });
  for(const h of ["Content-Length","Content-Range","Accept-Ranges"]){const v=source.headers.get(h);if(v)headers.set(h,v);}
  return new Response(source.body,{status:source.status,headers});
 }catch(e){return json({error:e.message||"Não foi possível abrir o arquivo."},e instanceof DriveFailure?e.status:502);}
}
