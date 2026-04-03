import { defineConfig } from "orval";

export default defineConfig({
  formexApi: {
    input: "../api/openapi/formex-api.json",
    output: {
      mode: "tags-split",
      target: "./src/lib/api/generated/endpoints.ts",
      schemas: "./src/lib/api/generated/models",
      client: "react-query",
      biome: true,
      override: {
        mutator: {
          path: "./src/lib/api/mutator.ts",
          name: "$api",
        },
        query: {
          useQuery: true,
          useMutation: true,
          useSuspenseQuery: true,
        },
      },
    },
  },
});
