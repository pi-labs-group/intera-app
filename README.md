# Intera

Projeto Integrador II

O aplicativo que aproxima a escola, os alunos e as famílias — a rotina
escolar reunida em um só lugar.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL no Supabase
- Supabase Auth (fase futura)

## Como rodar

Pré-requisito: Node 24 (`nvm use` lê o `.nvmrc`).

```bash
nvm use
npm install               # também gera o Prisma Client (postinstall)
cp .env.example .env.local  # preencha as URLs do banco (veja "Banco de dados")
npm run db:deploy         # aplica as migrations pendentes
npm run dev
```

Scripts do banco:

- `npm run db:migrate`: cria uma migration nova a partir de `prisma/schema.prisma` e a
  aplica. Se ele oferecer resetar o banco, recuse: o banco é compartilhado pelo time.
- `npm run db:generate`: regenera o Prisma Client em `src/generated/prisma`. No Prisma 7
  o `migrate dev` não faz isso sozinho: rode após cada mudança no schema.
- `npm run db:seed`: cria os usuários demo, turmas, disciplinas e diários. Pode rodar
  várias vezes sem duplicar dados.
- `npm run db:studio`: abre o Prisma Studio para inspecionar os dados.
- `npm run db:deploy`: aplica migrations já existentes (ex.: criadas por outra pessoa),
  sem nunca resetar o banco.

## Banco de dados

O banco é o PostgreSQL do Supabase, o mesmo para todo o time:

1. No painel do projeto, abra **Connect → ORMs → Prisma** e copie as strings de conexão.
2. Preencha no `.env.local` (não versionado), trocando `[YOUR-PASSWORD]` pela senha do banco:
   - `DATABASE_URL`: _Transaction pooler_ (porta 6543), usada pela aplicação;
   - `DIRECT_URL`: _Session pooler_ (porta 5432), usada pelas migrations. A conexão
     direta do Supabase só funciona em redes IPv6.
3. Caracteres especiais na senha (`@ : / ? # % &`) precisam ser codificados na URL
   (ex.: `@` vira `%40`).

Todas as tabelas têm Row Level Security ligado e sem políticas: a Data API do
Supabase (chave `anon`) não lê nada, e o Prisma, que conecta como dono das tabelas,
não é afetado. Toda tabela nova precisa de `ENABLE ROW LEVEL SECURITY` na migration.

Acesse [http://localhost:3000](http://localhost:3000).

## Arquitetura

A organização em camadas e a fronteira entre servidor e cliente estão descritas em
[docs/architecture.md](docs/architecture.md).

## Fluxo de branches

O repositório tem só duas branches: `main` e `dev`.

1. Faça os commits direto na `dev`.
2. Quando `dev` estiver estável, abra um PR de `dev` para `main`.
3. Depois do merge, sincronize a `dev` com a `main`: `git push origin main:dev`.

Nunca faça commit nem push direto na `main`.
