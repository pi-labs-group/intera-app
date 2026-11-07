# Manual de deploy: Supabase + Vercel

Este guia leva o Intera do repositório até o ar na Vercel, com o banco PostgreSQL no
Supabase. Ele cobre dois casos:

- **A. Atualizar o banco que o grupo já usa.** É o caso desta entrega: a migração
  `20261102120000_logic_review` precisa ser aplicada no Supabase antes do código novo
  entrar no ar.
- **B. Montar tudo do zero**, com um projeto Supabase e um projeto Vercel novos.

> **Regra de ouro:** o banco do Supabase é compartilhado pelo time. Nunca rode
> `prisma migrate reset`, `prisma db push` nem `npm run test:integration` contra ele.
> Para aplicar migrations use só `npm run db:deploy`, que nunca apaga dados.

## 1. Pré-requisitos

- Node 24 (`nvm use` lê o `.nvmrc`).
- Acesso ao projeto do Supabase (painel e senha do banco).
- Acesso ao projeto da Vercel ligado ao repositório `pi-labs-group/intera-app`.
- O repositório clonado, com `npm install` já rodado. O `postinstall` gera o Prisma
  Client em `src/generated/prisma`.

## 2. Variáveis de ambiente

| Variável                                                                                 | Onde usar                    | Para quê                                                                                      |
| ---------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                           | `.env.local` **e** Vercel    | Conexão da aplicação. É o _Transaction pooler_ (porta **6543**), com `?pgbouncer=true` no fim |
| `DIRECT_URL`                                                                             | `.env.local` (máquina local) | Conexão das migrations. É o _Session pooler_ (porta **5432**)                                 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ainda não usadas             | Reservadas para a fase de Supabase Auth; podem ficar vazias por enquanto                      |

Onde achar as URLs: no painel do Supabase, **Connect → ORMs → Prisma**. Troque
`[YOUR-PASSWORD]` pela senha do banco. Se a senha tiver `@ : / ? # % &`, codifique
esses caracteres na URL (por exemplo, `@` vira `%40`).

Não use a _Direct connection_ (`db.<ref>.supabase.co`): ela só funciona em redes IPv6.

Para rodar localmente, copie o modelo e preencha:

```bash
cp .env.example .env.local
```

O `.env.local` nunca vai para o git.

## 3. Caso A: atualizar o banco do grupo

Faça estes passos **antes** do código desta entrega chegar à branch que a Vercel
publica. O código novo lê colunas e tabelas que só passam a existir com a migração
(`school_periods`, `assignment_grades`, `is_current`, `lesson_number`...). Sem ela,
as telas do professor, da secretaria e de desempenho dão erro.

### 3.1. Ver o que está pendente

Com o `.env.local` apontando para o Supabase do grupo:

```bash
npx prisma migrate status
```

O esperado é que só a `20261102120000_logic_review` apareça como pendente. Se
aparecer outra coisa, pare e converse com o time antes de seguir.

### 3.2. Fazer um backup

No plano gratuito o Supabase não oferece backup para baixar. Faça um dump pelo
_Session pooler_. Precisa do `pg_dump` 17 ou mais novo instalado.

```bash
pg_dump "<DIRECT_URL>" --no-owner --no-privileges -f backup-antes-logic-review.sql
```

Guarde o arquivo fora do repositório.

### 3.3. Conferir os dados que podem travar a migração

A migração cria chaves estrangeiras e CHECKs. Se algum dado existente violar essas
regras, ela falha **no meio**. Rode estas consultas no **SQL Editor** do Supabase.
Todas precisam voltar **zero linhas**.

```sql
-- 1. Nota de avaliação que o diário não declara (quebraria a FK grades → diary_assessments)
SELECT g.id, g.diary_id, g.assessment_type_id
FROM grades g
LEFT JOIN diary_assessments da
  ON da.diary_id = g.diary_id AND da.assessment_type_id = g.assessment_type_id
WHERE da.diary_id IS NULL;

-- 2. Bimestre fora de 1 a 4
SELECT 'grades' AS tabela, id FROM grades WHERE bimester NOT BETWEEN 1 AND 4
UNION ALL SELECT 'bimester_averages', id FROM bimester_averages WHERE bimester NOT BETWEEN 1 AND 4
UNION ALL SELECT 'syllabus_contents', id FROM syllabus_contents WHERE bimester NOT BETWEEN 1 AND 4;

-- 3. Valores inválidos
SELECT 'grades' AS tabela, id FROM grades WHERE value < 0
UNION ALL SELECT 'diary_assessments', diary_id FROM diary_assessments WHERE max_grade IS NOT NULL AND max_grade <= 0
UNION ALL SELECT 'attendances', id FROM attendances WHERE present AND compensated;
```

Se alguma consulta trouxer linhas, corrija esses registros antes de migrar. Nos dados
de demonstração (seed), nenhuma traz.

Sobre os trabalhos (`assignments`) que já existem: eles entram automaticamente no
4º bimestre. Isso é esperado, porque são só dados de desenvolvimento.

### 3.4. Aplicar a migração

```bash
npm run db:deploy
```

Se der erro no meio, **não** rode `migrate reset`. Anote a mensagem e rode
`npx prisma migrate status`. Corrija o dado que causou o erro e resolva a migração
com `npx prisma migrate resolve --rolled-back 20261102120000_logic_review`. Depois
rode `npm run db:deploy` de novo. Em último caso, restaure o backup do passo 3.2.

### 3.5. Rodar o seed

```bash
npm run db:seed
```

O seed pode rodar várias vezes sem duplicar dados. Nesta versão ele também marca o
ano letivo atual (`is_current`) e cria os períodos dos bimestres (`school_periods`).
O app usa esses períodos para saber em que bimestre estamos.

### 3.6. Conferir localmente

```bash
npm run dev
```

Abra <http://localhost:3000/login> e entre com cada perfil de demonstração:

| Perfil      | E-mail                                 |
| ----------- | -------------------------------------- |
| Responsável | `ana.andrade@familia.com.br`           |
| Aluno       | `lucas.andrade@aluno.interacao.com.br` |
| Professor   | `renato.lima@interacao.com.br`         |
| Secretaria  | `secretaria@interacao.com.br`          |

Verifique pelo menos estas telas:

- **Professor → Diário de classe:** salvar uma nota e uma chamada, recarregar e
  confirmar que os dados continuam lá.
- **Aluno/Responsável → Desempenho:** a comparação com a média da turma aparece.
- **Secretaria:** as turmas aparecem na mesma ordem que no professor.

Depois disso, siga para a seção 5 (Vercel).

## 4. Caso B: montar tudo do zero

1. No [Supabase](https://supabase.com), crie um projeto. Para a escola, a região
   indicada é **South America (São Paulo)**. Anote a senha do banco.
2. Preencha `DATABASE_URL` e `DIRECT_URL` no `.env.local` (seção 2).
3. Aplique todas as migrations e popule o banco:

   ```bash
   npm run db:deploy   # aplica init, enable_rls e logic_review, nessa ordem
   npm run db:seed
   ```

4. Rode `npm run dev` e faça as conferências do passo 3.6.
5. Siga para a seção 5.

Não é preciso criar tabelas nem políticas pelo painel do Supabase. As migrations já
ligam o Row Level Security em todas as tabelas, sem políticas. Assim a chave `anon`
não lê nada, e o Prisma, que conecta como dono das tabelas, continua funcionando.

## 5. Vercel

### 5.1. Projeto (só no caso B)

1. Em [vercel.com](https://vercel.com), use **Add New → Project** e importe
   `pi-labs-group/intera-app`.
2. A Vercel detecta Next.js sozinha. Mantenha o comando de build (`npm run build`)
   e o de instalação (`npm install`). O `postinstall` gera o Prisma Client durante a
   instalação.
3. Em **Settings → General → Node.js Version**, escolha **24.x**, a mesma do `.nvmrc`.
4. Em **Settings → Functions → Function Region**, escolha **São Paulo (gru1)**. Assim
   as funções ficam perto do banco e cada consulta demora menos.

### 5.2. Variáveis

Em **Settings → Environment Variables**, cadastre:

- `DATABASE_URL`: o _Transaction pooler_ (porta 6543, com `?pgbouncer=true`), marcado
  para **Production** e **Preview**.

`DIRECT_URL` não é necessária na Vercel, porque o build não roda migrations. As
migrations são sempre aplicadas por uma pessoa, da máquina dela (seção 3).

Depois de criar ou alterar uma variável, faça um **Redeploy** para ela valer.

### 5.3. Publicar

- O build passa mesmo sem banco configurado: a conexão só é aberta quando uma página
  precisa dela. Por isso, **build verde não prova que o banco está certo**. Sempre teste
  as telas depois do deploy.
- Siga o fluxo de branches do README: commits na `dev`; quando estiver estável, abra
  um PR de `dev` para `main`. Depois do merge, sincronize com
  `git push origin main:dev`.
- Abra a URL do deploy e repita as conferências do passo 3.6.

### 5.4. Se der erro em produção

| Sintoma                                                     | Causa provável                                       | O que fazer                                     |
| ----------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Página dá erro com `ZodError` ou "Invalid URL" nos logs     | `DATABASE_URL` ausente ou mal formada na Vercel      | Revisar a variável (seção 5.2) e fazer Redeploy |
| `column ... does not exist` / `relation ... does not exist` | Migração não aplicada no banco                       | Seção 3.4                                       |
| Telas do professor vazias ou sem bimestre atual             | Seed não rodado depois da migração                   | Seção 3.5                                       |
| `password authentication failed`                            | Senha errada ou com caractere especial sem codificar | Seção 2                                         |

Os logs ficam em **Vercel → Deployments → (deploy) → Logs**.

## 6. Ao mudar o schema daqui para frente

1. Edite `prisma/schema.prisma`.
2. Gere a migration **sem aplicar** e revise o SQL:

   ```bash
   npx prisma migrate dev --create-only --name <nome_curto>
   ```

   Se o Prisma oferecer resetar o banco, **recuse**. Se não houver um Postgres local,
   use `npx prisma migrate diff` (foi assim que a `logic_review` foi gerada).

3. Toda tabela nova precisa de `ALTER TABLE "<tabela>" ENABLE ROW LEVEL SECURITY;` na
   migration.
4. Rode `npm run db:generate` (no Prisma 7, o `migrate dev` não regenera o client).
5. Antes de aplicar no Supabase, combine com o time e siga a seção 3.

## 7. Pendências conhecidas

Estes pontos não bloqueiam o deploy, mas o próximo desenvolvedor deve conhecê-los:

- **Autenticação ainda é simulada.** O login escolhe um perfil demo e grava um cookie
  sem assinatura; o professor é identificado pelo e-mail demo. Antes de usar com
  dados reais, é preciso implementar o Supabase Auth.
- **Avisos e algumas telas do aluno** ainda usam dados simulados. Só `/performance`
  lê do banco.
- **Decisões de negócio pendentes** (detalhes em
  [architecture.md](architecture.md#decisões-pendentes)):
  - D1: a média de aprovação está em 6, em `src/lib/school-config.ts`.
  - D2: ninguém calcula ainda `BimesterAverage` nem `FinalAverage`.
  - D3: as notas de trabalho ainda não entram na média.
- **Testes de integração nunca rodaram.** Eles precisam de um Postgres local e
  descartável, apontado por `TEST_DATABASE_URL` no `.env.local` (veja o README).
  Nunca aponte essa variável para o Supabase: o teste apaga todas as tabelas.
