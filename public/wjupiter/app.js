/* West Jupiter — navegação no padrão West Auriga; documentos exclusivos da unidade. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const pageIds=["overview","digital-records","control-sheet","analysis","pending","presentation"];
const nav=[...document.querySelectorAll(".nav-main button[data-panel]")];
const pages=pageIds.map(id=>$(id)).filter(Boolean);
const state={catalog:null,tag:null,query:"",error:null,loading:true,loaded:new Set(),pending:new Set(),tagErrors:new Map()};
const el=(name,cls,text)=>{
 const element=document.createElement(name);
 if(cls)element.className=cls;
 if(text!==undefined)element.textContent=String(text);
 return element;
};
const natural=(a,b)=>a.localeCompare(b,"pt-BR",{numeric:true,sensitivity:"base"});
function setPanel(panel){
 const active=pageIds.includes(panel)?panel:"overview";
 for(const p of pages)p.hidden=p.id!==active;
 for(const b of nav){
  const selected=b.dataset.panel===active;
  b.classList.toggle("active",selected);
  if(selected)b.setAttribute("aria-current","page");
  else b.removeAttribute("aria-current");
 }
 $("sidebar").classList.remove("open");
 $("mobile-shade").hidden=true;
 $("menu-toggle").setAttribute("aria-expanded","false");
 window.scrollTo({top:0,behavior:"instant"});
}
function navigate(panel){
 if(location.hash.slice(1)===panel)setPanel(panel);
 else location.hash=panel;
}
function note(host,title,description){
 const root=el("div","wj-rail-empty");
 root.append(el("strong","",title),el("p","",description));
 host.append(root);
}
function folderRenderer(record){
 const host=$("wj-folders");
 host.replaceChildren();
 if(!record){
  host.append(el("p","empty-state",state.catalog?.equipment.length?
   "Selecione uma TAG para consultar os documentos.":
   "Nenhum equipamento cadastrado. As pastas serão criadas após a identificação de TAGs nos documentos recebidos."));
  $("wj-breadcrumb").textContent="West Jupiter / Digital Records";
  $("wj-doc-count").textContent="—";
  return;
 }
 $("wj-breadcrumb").textContent="West Jupiter / Digital Records / "+record.tag;
 $("wj-doc-count").textContent=state.loaded.has(record.tag)?record.documents.length+" arquivo"+(record.documents.length===1?"":"s"):"Consultando arquivos…";
 for(const cat of state.catalog.template){
  const files=record.documents.filter(item=>item.category===cat);
  const wrapper=el("details","folder-unit wj-unit");
  const head=el("summary","wj-folder-summary");
  head.append(el("span","wj-folder-title","▤  "+cat),el("span","wj-folder-number",state.loaded.has(record.tag)?(files.length===1?"1 arquivo":files.length+" arquivos"):"Consultando…"));
  wrapper.append(head);
  const list=el("div","wj-documents");
  if(!files.length)list.append(el("p","wj-documents-empty",state.tagErrors.get(record.tag)||(!state.loaded.has(record.tag)?"Consultando pasta no Google Drive…":"Nenhum arquivo nesta categoria.")));
  for(const file of files){
   const row=el("div","wj-document");
   const meta=el("div","wj-document-label");
   meta.append(el("strong","",file.name),el("small","",file.bytes?Math.ceil(file.bytes/1024).toLocaleString("pt-BR")+" KB":"Documento recebido"));
   const link=el("a","wj-document-link",file.pdf?"ABRIR PDF":"ABRIR ARQUIVO");
   link.href="/wjupiter/api/file?path="+encodeURIComponent(file.path);
   link.target="_blank";link.rel="noopener noreferrer";
   link.setAttribute("aria-label","Abrir "+file.name);
   row.append(meta,link);
   list.append(row);
  }
  wrapper.append(list);host.append(wrapper);
 }
}
function render(){
 const rail=$("wj-vessels"),host=$("wj-folders");
 rail.replaceChildren();
 if(!state.catalog){
  $("overview-review").replaceChildren(el("strong","","Digital Records · West Jupiter"),
   el("p","",state.error||"Consultando acervo da unidade."));
  $("wj-total").textContent=state.error?"Acervo indisponível":"Carregando...";
  $("wj-rail-count").textContent="—";
  $("wj-selected").textContent=state.error?"Consulta indisponível":"Selecione um vaso";
  $("wj-intro").textContent=state.error||"Aguardando consulta ao inventário da unidade.";
  host.replaceChildren();
  host.append(el("p","empty-state",state.error||"Consultando documentos da unidade."));
  note(rail,state.error?"Sem acesso ao acervo":"Consultando acervo",
   state.error?"Verifique a configuração da conexão privada no Cloudflare.":"Carregando os equipamentos.");
  return;
 }
 const all=state.catalog.equipment;
 const term=state.query.trim().toLocaleLowerCase("pt-BR");
 const filtered=all.filter(item=>!term||item.tag.toLocaleLowerCase("pt-BR").includes(term)||
  item.documents.some(file=>file.name.toLocaleLowerCase("pt-BR").includes(term)));
 if(!filtered.some(item=>item.tag===state.tag))state.tag=filtered[0]?.tag||null;
 $("nav-digital").textContent=all.length;
 $("wj-total").textContent=all.length+" equipamento"+(all.length===1?"":"s");
 $("wj-rail-count").textContent=filtered.length;
 const overview=$("overview-review");
 overview.replaceChildren(
  el("strong","","Digital Records · "+all.length+" equipamento"+(all.length===1?"":"s")),
  el("p","",state.loaded.size+" TAG(s) consultada(s) nesta sessão. Os PDFs são lidos sob demanda do Google Drive privado; a organização não atesta conformidade técnica."),
  el("small","","MODELO OFICIAL · 13 CATEGORIAS")
 );
 if(!all.length)note(rail,"Nenhuma TAG cadastrada","As pastas de vasos serão criadas conforme o recebimento de documentos da West Jupiter.");
 else if(!filtered.length)note(rail,"Nenhum resultado","Revise o termo de busca.");
 else for(const equipment of filtered){
  const btn=el("button","vessel-btn"+(equipment.tag===state.tag?" selected":""));
  btn.type="button";
  btn.append(el("strong","",equipment.tag),el("small","",state.loaded.has(equipment.tag)?equipment.documents.length+" arquivo"+(equipment.documents.length===1?"":"s"):"Consultar arquivos"));
  btn.setAttribute("aria-pressed",equipment.tag===state.tag?"true":"false");
  btn.addEventListener("click",()=>{state.tag=equipment.tag;state.tagErrors.delete(equipment.tag);render();});
  rail.append(btn);
 }
 const current=filtered.find(item=>item.tag===state.tag);
 $("wj-selected").textContent=current?current.tag:"Selecione um vaso";
 $("wj-intro").textContent=current?"Prontuário organizado em 13 categorias. Abra as pastas para visualizar os arquivos originais.":
  "Aguardando equipamentos identificados nos documentos enviados.";
 folderRenderer(current||null);
 if(current&&!state.loaded.has(current.tag)&&!state.pending.has(current.tag)&&!state.tagErrors.has(current.tag))void loadTag(current.tag);
}
async function loadTag(tag){
 if(!state.catalog||state.loaded.has(tag)||state.pending.has(tag))return;
 state.pending.add(tag);render();
 try{
  const response=await fetch("/wjupiter/api/equipment?tag="+encodeURIComponent(tag),{credentials:"same-origin",cache:"no-store"});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||"Não foi possível consultar a pasta.");
  if(result.tag!==tag||!Array.isArray(result.documents))throw Error("Resposta documental inconsistente.");
  const equipment=state.catalog.equipment.find(item=>item.tag===tag);
  if(equipment)equipment.documents=result.documents;
  state.loaded.add(tag);
  state.tagErrors.delete(tag);
 }catch(error){state.tagErrors.set(tag,error.message||"Falha ao consultar documentos.");}
 finally{state.pending.delete(tag);render();}
}
async function load(){
 try{
  const response=await fetch("/wjupiter/api/records",{credentials:"same-origin",cache:"no-store"});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||"Falha ao consultar a West Jupiter.");
  if(!Array.isArray(result.template)||!Array.isArray(result.equipment)||result.template.length!==13)
   throw Error("A estrutura documental retornada está incompleta.");
  state.catalog=result;
  state.error=null;
 }catch(error){state.catalog=null;state.error=error.message||"Não foi possível consultar o acervo.";}
 finally{state.loading=false;render();}
}
nav.forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.panel)));
$("open-digital").addEventListener("click",()=>navigate("digital-records"));
$("menu-toggle").addEventListener("click",()=>{
 const open=$("sidebar").classList.toggle("open");
 $("mobile-shade").hidden=!open;
 $("menu-toggle").setAttribute("aria-expanded",open?"true":"false");
});
$("mobile-shade").addEventListener("click",()=>{
 $("sidebar").classList.remove("open");
 $("mobile-shade").hidden=true;
 $("menu-toggle").setAttribute("aria-expanded","false");
});
$("wj-query").addEventListener("input",event=>{state.query=event.target.value;render();});
$("wj-expand-all").addEventListener("click",()=>document.querySelectorAll("#wj-folders details").forEach(node=>node.open=true));
$("wj-collapse-all").addEventListener("click",()=>document.querySelectorAll("#wj-folders details").forEach(node=>node.open=false));
window.addEventListener("hashchange",()=>setPanel(decodeURIComponent(location.hash.slice(1))));
window.addEventListener("keydown",event=>{
 if(event.key==="Escape"){
  $("sidebar").classList.remove("open");
  $("mobile-shade").hidden=true;
  $("menu-toggle").setAttribute("aria-expanded","false");
 }
});
setPanel(decodeURIComponent(location.hash.slice(1)));
load();
})();
