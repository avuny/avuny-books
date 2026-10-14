import { defineConfig } from 'orval';

const target = './src/core/api';

export default defineConfig({
  mobile: {
    input: '../api/openapi/openapi.json',
    output: {
      target: `${target}/index.ts`,
      schemas: `${target}/model`,
      client: 'react-query',
      mode: 'single',
      override: {
        mutator: {
          path: './src/core/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        // query: {
        //   useInfinite: true,
        //   useInfiniteQueryParam: "page",
        // },
      },
    },
  },
});
