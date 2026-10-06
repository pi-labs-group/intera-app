<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Convenções do projeto Intera

### Idioma

- Código, identificadores (variáveis, funções, tipos, arquivos, segmentos de rota),
  mensagens de commit e nomes de branch: inglês.
- Comentários de documentação (TSDoc/JSDoc), arquivos de documentação
  (README, docs/\*.md) e textos de interface (UI): português (pt-BR).
- Em TSDoc, as tags permanecem em inglês (@param, @returns); só a descrição é
  em português.

### Documentação no código (TSDoc/JSDoc)

- Documente de forma seletiva: explique o porquê (intenção, regra de negócio, caso
  de borda), nunca o o-quê que o código já expressa.
- Documente: funções/serviços/repositórios exportados, tipos complexos, props
  públicas de componentes, cabeçalho de módulo de cada camada.
- Não documente: código autoexplicativo, getters/setters triviais, comentários que
  repetem a linha.
- Não force documentação via linter; é convenção revisada no PR.

### Fluxo de versionamento

- Branches: feature/\* → PR para dev → PR para main. Nunca push direto na main.
- Mensagens: Conventional Commits (feat, fix, chore, docs, refactor, test).
- Agentes de IA nunca fazem commit nem push. Quem commita é o desenvolvedor.

### Arquitetura

- Projeto único Next.js (App Router); não há backend separado. O código server-side
  vive neste projeto.
- Camadas: Route Handlers / Server Actions → services → repositories → Prisma.
- PrismaClient e segredos nunca em código acessível ao cliente; use
  `import 'server-only'` no topo de arquivos server-only.
- Validação de entrada com Zod na borda.

### Next.js 16

- Versão 16, com breaking changes. Antes de escrever código, consulte
  `node_modules/next/dist/docs/`. Não confie em padrões do Next 14/15.

### Verificação antes de concluir

- `npm run build`, `npm run lint` e `npm run typecheck` devem passar sem erros.
