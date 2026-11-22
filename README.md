# West Jupiter — Shimmer × Seadrill

Unidade documental **West Jupiter**, com acesso pela Shimmer Platform em Cloudflare Pages.

## Estado inicial
Repositório inicializado sem dados documentais. **Não existem aqui equipamentos cadastrados, PDFs, inspeções, categorias concluídas ou apontamentos NR-13 importados**. Não copiar dados técnicos da West Polaris ou da West Auriga para esta unidade.

## Portal
- Portal: https://shimmer-4j1.pages.dev/
- Rota dedicada: https://shimmer-4j1.pages.dev/wjupiter/
- Aplicação Cloudflare: `orangecodedigital-del/wpolaris`, branch `shimmer-cloudflare`
- Usuário: `wjupiter`
- Senha: configurar somente como segredo `WJ_PORTAL_PASSWORD` no Cloudflare. **Não commitar a senha**.
- Sessão HMAC isolada sob `/wjupiter/`; rate limiting no D1 compartilhado.

## Organização documental futura
Para a etapa de recebimento, inspecionar primeiro o acervo original da West Jupiter e a estrutura `0.MODELO` em uso nas demais unidades, sem deduzir quantidades ou pendências e sem transferir PDFs confidenciais para repositórios públicos. Registrar origem, versão, TAG, hash e evidência antes de qualquer conclusão NR-13. O Digital Records e a Análise NR-13 da Jupiter serão preenchidos somente a partir de documentos reais.

O código da interface e autenticação da Jupiter fica no portal Shimmer, segregado das demais unidades.