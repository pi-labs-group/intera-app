# server

Código que roda exclusivamente no servidor (serviços, repositórios e cliente do banco).
Regra: todo arquivo desta pasta começa com `import "server-only";`, que faz o build falhar se ele for importado por um Client Component.
Componentes cliente nunca importam daqui; o acesso acontece via Server Components, Server Actions ou Route Handlers.
