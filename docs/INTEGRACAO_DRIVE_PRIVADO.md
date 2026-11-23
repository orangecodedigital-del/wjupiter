# Integração segura — Google Drive privado → Site West Jupiter

## Estado
O código deste repositório foi preparado para consultar **diretamente** as pastas reais do Google Drive a cada visita autenticada. Os documentos permanecem privados e não são copiados para GitHub ou pasta pública da Cloudflare. **O deploy e as credenciais precisam ser configurados na Cloudflare para a integração funcionar em produção.**

## Cloudflare Pages
Configurar a publicação deste repositório `orangecodedigital-del/wjupiter`, branch `main`:
- Framework: None
- Build command: (vazio)
- Build output directory: `public`
- Pasta `functions/` na raiz do repositório (Pages Functions automático)
- Não ativar hospedagem apenas estática sem executar o middleware.

O antigo endereço Shimmer `https://shimmer-4j1.pages.dev/wjupiter/` só será atualizado se o projeto Pages publicar estes arquivos; confirmar no painel qual repositório/branch está ligado a ele.

## Credenciais e bindings — somente servidor
Definir em **Settings → Variables and Secrets**, ambiente **Production** (segredos criptografados onde apropriado):

| Nome | Uso |
|---|---|
| `WJ_PORTAL_PASSWORD` | senha exclusiva da unidade; mínimo técnico de 7 caracteres, usar senha forte |
| `WJ_SESSION_SECRET` | segredo de cookie assinado, aleatório com no mínimo 32 caracteres |
| `WJ_GOOGLE_CLIENT_EMAIL` | e-mail da conta de serviço Google |
| `WJ_GOOGLE_PRIVATE_KEY` | chave PEM privada da conta de serviço Google (secret) |
| `WJ_DRIVE_ROOT_ID` | ID da pasta privada `WEST JUPITER — DIGITAL RECORDS (NR-13)` |
| `DB` | binding D1 para limitar tentativas de login |

Se o projeto já possui `SHIMMER_SESSION_SECRET` pode ser mantido como fallback, mas `WJ_SESSION_SECRET` isola melhor a unidade.

1. Habilitar a **Google Drive API** no projeto Google Cloud da conta de serviço.
2. Compartilhar **somente a pasta raiz da West Jupiter** no Google Drive com o e-mail da conta de serviço, no papel **Leitor**; não publicar "qualquer pessoa com link".
3. Configurar os segredos no Pages (nunca no GitHub ou no navegador).
4. No D1 vinculado como `DB`, aplicar `migrations/0001_auth_attempts.sql` se a tabela ainda não existir.
5. Fazer deploy de produção após configurar os bindings.

## Fluxo técnico
- `/wjupiter/api/records` lista apenas subpastas `VP-###` na raiz da West Jupiter; evita milhares de requisições.
- Selecionar uma TAG consulta exclusivamente as suas pastas categorizadas, carregando somente os documentos daquela TAG.
- Ao clicar em "Abrir PDF", a API verifica autenticação, TAG, categoria e se o arquivo pertence à pasta correta **antes** de transmitir o conteúdo do Drive por HTTPS.
- Não são armazenados links públicos nem tokens no HTML/JS. O acesso ao Drive é feito pela conta de serviço, com escopo `drive.readonly`.
- Nenhum botão altera ou exclui documentos do Drive.

## Critérios de aceitação após deploy
- Janela anônima: `/wjupiter/`, JavaScript, `/wjupiter/api/records` e `/wjupiter/api/file` não expõem documentos e exigem autenticação.
- Login válido: lista as TAGs reais e, ao selecionar uma, mostra as 13 categorias e os PDFs que efetivamente existem.
- PDF real é aberto dentro da sessão; tentar trocar ID por um arquivo fora da categoria é negado (404).
- Senha errada: 5 falhas bloqueiam por 15 minutos via D1.
- VP sem PDFs: 13 categorias vazias sem evidências fictícias.
- O repositório público e o Cloudflare nunca expõem chaves, cópias privadas de PDFs ou listagens corporativas.
- Polaris e Auriga não são consultadas nem alteradas.

**A publicação do código não equivale à verificação do site em produção**. Executar os testes acima após configurar Cloudflare e compartilhar a pasta com a conta de serviço.
