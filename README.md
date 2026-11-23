# West Jupiter — Digital Records (Shimmer × Seadrill)
Portal documental da unidade **West Jupiter**, com acervo técnico mantido exclusivamente no **Google Drive privado**.

## Código do site
A branch **main** deste repositório contém agora a interface do portal em `public/wjupiter/` e a API privada em `functions/wjupiter/api/`. A interface mantém o layout da West Jupiter/Shimmer, 13 categorias e navegação por TAG.

- Página de acesso: `/wjupiter/`.
- `GET /wjupiter/api/records`: lista pastas VP do Drive, sem varrer todos os PDFs.
- `GET /wjupiter/api/equipment?tag=VP-000`: carrega sob demanda as 13 categorias daquele vaso.
- `GET /wjupiter/api/file?path=...`: valida pertencimento do documento à categoria e o transmite após autenticação.

**Nada aqui torna o site automaticamente publicado.** O projeto Cloudflare Pages precisa usar esta branch e a pasta de saída `public`. O endereço histórico `https://shimmer-4j1.pages.dev/wjupiter/` só passará a usar esta versão se o projeto de produção for configurado para publicar este código (ou se houver uma integração equivalente). Nenhuma alteração foi feita no repositório `wpolaris`.

## Fonte e segurança
- Fonte única: pasta privada **WEST JUPITER — DIGITAL RECORDS (NR-13)** no Google Drive.
- **Não publicar PDFs ou listagens documentais no GitHub**. Este repositório continua público e contém apenas o código, o modelo de 13 categorias e documentação não sensível.
- A API do Google Drive roda somente no servidor, com credenciais de uma conta de serviço Google armazenadas em segredos da Cloudflare.
- As rotas do site e as APIs exigem login de unidade, cookie assinado e limitação de tentativas no banco D1.
- Ausência de um PDF no pacote não comprova que o documento não existe.

## Publicação no site Shimmer

A versão integrada também foi aplicada à branch `shimmer-cloudflare` do repositório **privado** `orangecodedigital-del/wpolaris`, que fornece a rota `/wjupiter/` no Shimmer histórico. Esse ajuste altera somente a área Jupiter. O código de ambas as versões consulta o Drive privado, sem carregar PDFs no GitHub. A efetiva ativação do catálogo exige que a conta de serviço usada pela Cloudflare tenha acesso à pasta do Drive.

## Ativação
Consultar [docs/INTEGRACAO_DRIVE_PRIVADO.md](docs/INTEGRACAO_DRIVE_PRIVADO.md) para parâmetros de Cloudflare Pages, compartilhamento de pasta e testes de segurança. A conexão fica fechada até configurar os segredos e o binding D1.

## Organização no Drive
As TAGs reais possuem pastas independentes com as 13 categorias oficiais. Os ZIPs originais sem PDFs continuam preservados na triagem. Os dados não são copiados de outras unidades.
