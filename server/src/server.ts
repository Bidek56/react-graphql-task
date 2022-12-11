import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { createServer } from 'http';
import express from 'express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import bodyParser from 'body-parser';
import cors from 'cors';
import type { ListenOptions, AddressInfo } from 'net';
import { format } from 'url';

import { typeDefs } from "./typeDefs.js";
import { resolvers } from './resolvers.js';

// Create the schema, which will be used separately by ApolloServer and the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscriptions',

});

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// This function will create a new server Apollo Server instance
export const createApolloServer = async (listenOptions: ListenOptions = { port: 4000 }) => {
  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginInlineTrace(),
  
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server),
  );

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: listenOptions.port }, resolve);
  });

  const { address, port } = httpServer.address() as AddressInfo;

  const hostname = address === '' || address === '::' ? 'localhost' : address;

  const url = format({
    protocol: 'http',
    hostname,
    port,
    pathname: '/graphql',
  });

  // return the server instance and the url the server is listening on
  return { server, url }
};

if (process.env.NODE_ENV !== 'test') {
  const { url } = await createApolloServer();
  console.log(`🚀 Query endpoint ready at ${url}`);
}