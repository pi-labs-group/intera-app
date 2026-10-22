# server/repositories

Acesso a dados: consultas e escritas no banco via Prisma, escritas como funções.
Sem regra de negócio; usado apenas pelos serviços. Somente servidor.

- `teacher-repository.ts`: professor pelo e-mail da conta.
- `diary-repository.ts`: diários do professor com alunos, avaliações e trabalhos.
- `grade-repository.ts`: notas lançadas nos diários.
- `school-repository.ts`: turmas, disciplinas, tipos de avaliação e contagem de usuários.
