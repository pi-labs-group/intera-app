# server/db

Instância única (singleton) do cliente Prisma (`prisma.ts`), reaproveitada entre requisições.
Usa o driver adapter `@prisma/adapter-pg` com `DATABASE_URL`, validada com Zod na carga do módulo.
Importada apenas pelos repositórios. Somente servidor.
