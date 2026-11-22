# Protocolo de organização — West Jupiter

O Digital Records seguirá a mesma árvore da West Auriga, sem misturar acervos.

### Receber
- Verificar se o lote pertence à West Jupiter, localizar a TAG em conteúdo/identificação e registrar nome original, fonte, data e SHA-256.
- Se não estiver clara a TAG ou classe documental, deixar o item para triagem antes de inseri-lo na pasta de um vaso.
- Se o PDF for uma revisão, preservar ambas as versões quando documentalmente diferentes; não substituir arquivo existente.
- PDFs idênticos (mesmo hash) devem ter seus recebimentos registrados, sem duplicar o arquivo desnecessariamente.
- Se houver vários vasos em um relatório, registrar relação documentada com cada TAG, sem inventar atribuição exclusiva.

### Organizar
- Criar **apenas TAGs reais** identificadas nos arquivos enviados.
- Replicar as 13 categorias de `documentos/POR_EQUIPAMENTO/0.MODELO` para cada TAG nova.
- Inserir o arquivo no diretório correto e atualizar `controle/INVENTARIO_WJUPITER.json` na mesma alteração.
- Preservar os originais recebidos. A falta de determinado relatório na pasta não comprova inexistência do relatório na unidade.

### Conferir
- Revisar a classificação, legibilidade e metadados.
- Situação de importação documental não é aprovação de conformidade NR-13.
- Não criar apontamentos, status de conformidade, prazos ou certificados sem respaldo no original.

### Segurança e publicação
- Repositório `wjupiter` é **público** no momento da preparação. Não subir documentação técnica interna neste estado.
- Quando o repositório for privado, disponibilizar os documentos ao portal Shimmer **somente via API de servidor autenticada**, nunca expondo tokens de GitHub no navegador.
- A conta e a senha do portal ficam separadas da gestão do acervo.
