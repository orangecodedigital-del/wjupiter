import {readEquipment,json,DriveFailure} from "../../shared/wj-drive.js";
export async function onRequest(context){
 if(context.data?.wjupiterSession?.unit!=="wjupiter")return json({error:"Acesso não autorizado."},401);
 if(context.request.method!=="GET")return json({error:"Método não permitido."},405);
 const tag=new URL(context.request.url).searchParams.get("tag")||"";
 try{
  const documents=await readEquipment(context.env,tag);
  return json({tag,documents,document_count:documents.length});
 }catch(e){return json({error:e.message||"Falha ao abrir as categorias do equipamento."},e instanceof DriveFailure?e.status:502);}
}
