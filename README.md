# West Jupiter — Shimmer × Seadrill

Unidade documental **West Jupiter**, com portal no Cloudflare Pages e acervo físico centralizado no **Google Drive privado**.

## Fonte única de documentos — decisão de 22/11/2026

Todos os PDFs técnicos e originais da West Jupiter serão armazenados **exclusivamente** na pasta privada **WEST JUPITER — DIGITAL RECORDS (NR-13)**, no Google Drive da conta proprietária.

- `0.MODELO/`: 13 categorias oficiais copiadas da West Auriga;
- `00. TRIAGEM DOCUMENTAL/`: documentos cujo vínculo de TAG/categoria ainda não foi verificado;
- `<TAG DO VASO>/`: criado somente após identificação real do equipamento, com as mesmas 13 categorias.

**Não duplicar o mesmo acervo de PDFs no GitHub e no Drive**. O GitHub recebe apenas código, documentos não confidenciais de modelo e instruções operacionais. O inventário público em `controle/INVENTARIO_WJUPITER.json` permanece vazio enquanto não houver um índice privado apropriado; jamais inserir nomes de PDFs internos ou TAGs sensíveis num repositório público.

O [modelo versionado no GitHub](documentos/POR_EQUIPAMENTO/0.MODELO/README.md) existe somente para definir o padrão das categorias e **não** representa armazenamento de documentos técnicos.

## Integração com o portal

- Portal Shimmer: https://shimmer-4j1.pages.dev/
- Área da unidade: https://shimmer-4j1.pages.dev/wjupiter/
- Código Cloudflare: `orangecodedigital-del/wpolaris`, branch `shimmer-cloudflare`
- Usuário: `wjupiter`; senha configurada apenas no segredo `WJ_PORTAL_PASSWORD`.

**Situação da integração:** a API atual do portal ainda consulta a árvore do GitHub. O repositório foi preparado antes da escolha pelo Drive. A sincronização do acervo privado do Drive para o Digital Records precisa ser configurada antes de declarar a interface integrada. Não disponibilizar arquivos de Drive de forma pública nem expor tokens no navegador.

## Recebimento e segurança

Consultar [`docs/FLUXO_RECEBIMENTO.md`](docs/FLUXO_RECEBIMENTO.md). Preservar PDF original, revisões, fonte e evidências. **Não deduzir TAGs ou pendências NR-13 pela simples ausência num lote.**

Este repositório permanece **público**; não subir PDFs técnicos, dados confidenciais, certificados ou segredos aqui.
