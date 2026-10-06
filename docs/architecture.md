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

> Prisma e Supabase entram em fases futuras do projeto. As pastas já existem para
> que a estrutura fique clara desde o início.

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
