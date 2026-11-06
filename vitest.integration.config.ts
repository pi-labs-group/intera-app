import { defineConfig } from "vitest/config";
import baseConfig from "./vitest.config";

// Testes de integração: usam um banco de teste real (TEST_DATABASE_URL) e o
// apagam entre execuções; por isso rodam em série. Ver test/integration/setup.ts.
// Herda só os aliases: `mergeConfig` somaria o `include` dos testes unitários.
export default defineConfig({
  resolve: baseConfig.resolve,
  test: {
    environment: "node",
    include: ["test/integration/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
