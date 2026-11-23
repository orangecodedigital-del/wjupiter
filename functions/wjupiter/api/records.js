import {CATEGORIES,listEquipment,json,DriveFailure} from "../../shared/wj-drive.js";
export async function onRequest(context){
 if(context.data?.wjupiterSession?.unit!=="wjupiter")return json({error:"Acesso não autorizado."},401);
 if(context.request.method!=="GET")return json({error:"Método não permitido."},405);
 try{
  const folders=await listEquipment(context.env);
  return json({unit:"West Jupiter",template:CATEGORIES,
   equipment:folders.map(f=>({tag:f.name,documents:[]})),
   equipment_count:folders.length,document_count:null,documents_loaded_on_demand:true});
 }catch(e){return json({error:e.message||"Falha ao consultar a pasta privada."},e instanceof DriveFailure?e.status:502);}
}
