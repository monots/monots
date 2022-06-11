import { graphql, rest } from 'msw';
import { setupServer } from 'msw/node';

// This configures a Service Worker with the given request handlers.

interface CreateMockServer {
  rest: typeof rest;
  graphql: typeof graphql;
}

type SetupMockServer = (props: CreateMockServer) => Parameters<typeof setupServer>;

/**
 * Use this to create a mock server for the current test file.
 */
export function createMockServer(setup: SetupMockServer) {
  const handlers = setup({ rest, graphql });
  const server = setupServer(...handlers);

  return {
    beforeAll: () => server.listen({ onUnhandledRequest: 'error' }),
    afterAll: () => server.close(),
    afterEach: () => server.resetHandlers(),
  };
}
