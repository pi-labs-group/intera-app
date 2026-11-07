import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes unitários: rodam no Node, sem banco. O `server-only` vira um módulo
// vazio, senão qualquer import de src/server/ falharia fora do Next.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
