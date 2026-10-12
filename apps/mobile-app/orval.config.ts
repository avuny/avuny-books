import { defineConfig } from 'orval';

const target = './api';

export default defineConfig({
  mobile: {
    input: '../../packages/api/openapi/openapi.json',
    output: {
      target: `${target}/index.ts`,
      schemas: `${target}/model`,
      client: 'react-query',
      mode: 'single',
      override: {
        mutator: {
          path: './mutator/custom-instance.ts',
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
