# Arquitetura do Intera

Este documento explica como o código do Intera está organizado e por quê. O objetivo
é que qualquer pessoa — da equipe ou da banca — consiga entender onde cada parte do
sistema vive e como os dados circulam entre elas.

## Visão geral

O Intera é um **projeto único em Next.js** (App Router). Não existe um backend
separado: o mesmo projeto entrega as telas e executa a lógica de servidor. Isso é
possível porque o Next.js roda código tanto no navegador quanto no servidor.

Mesmo sem um backend separado, o código é dividido em **camadas**, cada uma com uma
única responsabilidade:

```
Interface (páginas e componentes)
        │
        ▼
Route Handlers / Server Actions   ← porta de entrada no servidor
        │
        ▼
Services                          ← regras de negócio
        │
        ▼
Repositories                      ← acesso a dados
        │
        ▼
Prisma → Banco de dados (Supabase / PostgreSQL)
```

Cada camada só conversa com a camada imediatamente abaixo dela. Assim, uma mudança
no banco de dados afeta apenas os repositórios, e uma mudança de regra de negócio
afeta apenas os serviços.

> O schema fica em `prisma/schema.prisma` (tabelas e colunas em snake_case) e o
> Prisma Client é gerado em `src/generated/prisma`. Professor, secretaria e a tela
> de desempenho do aluno/responsável leem do banco, e os lançamentos do professor
> (notas, trabalhos e chamada) gravam via Server Actions. As demais telas de aluno e
> responsável, os avisos e a autenticação (Supabase Auth) ainda são mock.

## Fronteira entre servidor e cliente

No Next.js, um componente pode rodar no **servidor** (Server Component, o padrão)
ou no **navegador** (Client Component, marcado com `"use client"`). Tudo o que é
importado por um Client Component é enviado para o navegador do usuário.

Por isso, existe uma regra rígida:

- Todo código em `src/server/` começa com `import "server-only";`.
- Se algum Client Component tentar importar um desses arquivos, **o build falha**.

Isso garante que o cliente do banco de dados (PrismaClient), as chaves secretas e as
regras de negócio nunca cheguem ao navegador, mesmo por engano.

## Responsabilidade de cada pasta

| Pasta                      | Responsabilidade                                                               | Onde roda          |
| -------------------------- | ------------------------------------------------------------------------------ | ------------------ |
| `src/app/`                 | Rotas, páginas e layouts (App Router), Route Handlers e Server Actions.        | Servidor e cliente |
| `src/components/ui/`       | Blocos visuais reutilizáveis (botões, cards, campos). Recebem dados por props. | Servidor e cliente |
| `src/components/layout/`   | Estrutura de navegação: AppShell, Header, BottomNav, Drawer.                   | Servidor e cliente |
| `src/server/services/`     | Regras de negócio, escritas como funções. Orquestram os repositórios.          | Somente servidor   |
| `src/server/repositories/` | Consultas e escritas no banco via Prisma. Sem regra de negócio.                | Somente servidor   |
| `src/server/db/`           | Instância única (singleton) do PrismaClient.                                   | Somente servidor   |
| `src/lib/validation/`      | Schemas Zod compartilhados, usados para validar formulários e entradas.        | Servidor e cliente |
| `src/types/`               | Tipos TypeScript compartilhados que não derivam de um schema Zod.              | Servidor e cliente |

## Fluxo de dados

Exemplo de uma ação típica — um responsável envia uma mensagem para a escola:

1. **Interface:** o formulário (Client Component) coleta os dados e chama uma
   Server Action.
2. **Validação:** a Server Action valida a entrada com um schema Zod de
   `src/lib/validation/`. Dados inválidos são rejeitados aqui, na borda do sistema.
3. **Serviço:** com os dados já validados, a Server Action chama um serviço em
   `src/server/services/`, que aplica as regras de negócio (por exemplo, se o
   responsável pode enviar mensagem para aquela turma).
4. **Repositório:** o serviço chama um repositório em `src/server/repositories/`,
   que grava a mensagem no banco usando o PrismaClient de `src/server/db/`.
5. **Resposta:** o resultado volta pelo mesmo caminho até a interface, que atualiza
   a tela.

Para leituras, o caminho é parecido: um Server Component chama o serviço
diretamente, recebe os dados e os entrega aos componentes visuais por props.

## Validação na borda

Os tipos do TypeScript só existem durante o desenvolvimento; em tempo de execução,
qualquer dado pode chegar. Por isso, toda entrada externa (formulários, parâmetros de
rota, variáveis de ambiente) é validada com **Zod** no ponto em que entra no sistema.
Os tipos usados no código derivam desses schemas (`z.infer`), de modo que validação e
tipagem nunca ficam desalinhadas.

## Autorização e Row Level Security

O Prisma conecta ao banco como **dono das tabelas** e, por isso, **ignora o RLS**.
Toda a autorização do app está no código:

- `requireRole` (em `src/server/services/auth-service.ts`) nas páginas e nos serviços;
- as checagens de dono nos serviços. Exemplo: as gravações do professor
  (`grade-write-service.ts`) conferem, na mesma transação, que o diário é do
  professor da sessão e do ano letivo atual e que as matrículas estão ativas na turma.

O RLS ligado sem políticas só bloqueia a Data API do Supabase (chave `anon`).

Enquanto a sessão for o cookie de demonstração, sem assinatura, **não publique o app
em URL aberta com dados reais de alunos**. São dados de menores, e o art. 14 da LGPD
(Lei 13.709/2018) se aplica.

## Decisões pendentes

Regras que a escola ainda não confirmou. O código as trata como configuração, não
como verdade:

| ID  | Decisão                                        | Valor atual                                                                    | Onde está                             |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| D1  | Média de aprovação                             | `PASSING_GRADE = 6` (do protótipo); faixa "ótimo" a partir de `HIGH_GRADE = 7` | `src/lib/school-config.ts`            |
| D2  | Quem produz `BimesterAverage` e `FinalAverage` | Ninguém ainda: a tela mostra a média só se a linha existir                     | `student-service.ts`                  |
| D3  | Como as notas de trabalho entram na média      | Sem consolidação: ficam em `AssignmentGrade`; TRAB não aparece na aba Notas    | `schema.prisma`, `teacher-service.ts` |
| D4  | Datas dos bimestres de 2026                    | Fictícias no seed                                                              | `prisma/seed.ts` (`SCHOOL_PERIODS`)   |
| D5  | Mínimo de notas para exibir a média da turma   | `MIN_CLASS_SAMPLE = 5` (escolha do projeto, não norma legal)                   | `src/lib/school-config.ts`            |
| D6  | Campo de nota esvaziado pelo professor         | Apaga a nota existente                                                         | `grade-write-service.ts`              |

## Comparação com a média da turma

Na tela de desempenho, cada nota do aluno (avaliação, trabalho ou média do
bimestre) vem com a média da turma no mesmo item:

- **O que entra:** as notas lançadas por matrículas **ativas** do diário, no mesmo
  bimestre e item. A nota do próprio aluno entra no cálculo.
- **Privacidade:** a agregação é feita no banco (`groupBy`). O aluno e o responsável
  recebem só a média e a quantidade de notas, nunca notas ou matrículas de colegas.
- **Amostra mínima (D5):** com menos de `MIN_CLASS_SAMPLE` notas, a média não é
  exibida e a tela diz "Média da turma indisponível (poucas notas lançadas)".
- **Arredondamento:** a posição (acima, igual, abaixo) é calculada sobre os valores
  arredondados a 1 casa, os mesmos exibidos (`roundTo1`). A tela nunca diz "abaixo"
  com dois números iguais. O texto diz "média da turma", para não se confundir com o
  rótulo "ABAIXO DA MÉDIA" da faixa de aprovação.
- **Professor:** no editor de lançamentos, ele vê a média dos valores digitados, sem
  mínimo de amostra, porque já vê todas as notas.
