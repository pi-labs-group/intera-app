# Intera

Projeto Integrador II

O aplicativo que aproxima a escola, os alunos e as famílias — a rotina
escolar reunida em um só lugar.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase e Prisma (fases futuras)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Arquitetura

A organização em camadas e a fronteira entre servidor e cliente estão descritas em
[docs/architecture.md](docs/architecture.md).

## Fluxo de branches

1. Crie uma branch `feature/*` a partir de `dev`.
2. Abra um PR da `feature/*` para `dev`.
3. Quando `dev` estiver estável, abra um PR de `dev` para `main`.

Nunca faça push direto na `main`.
