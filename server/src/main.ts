import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';

import { typeDefs } from "./typeDefs";
import { resolvers } from './resolvers';
import jsonwebtoken from 'jsonwebtoken'

// console.log(process.env.NODE_ENV);
// console.log(process.env.REACT_APP_AUTH_TOKEN);

// if (!process.env.REACT_APP_AUTH_TOKEN) {
//     console.error('Error: Missing REACT_APP_AUTH_TOKEN')
//     process.exit(1);
// }

// const server: ApolloServer = new ApolloServer({
//     typeDefs,
//     resolvers,
    // subscriptions: {
    //     onConnect: (connectionParams: Object, webSocket, context) => {
    //         // console.log('Server ctxs:', context.request.headers)

    //         const cookie = context?.request?.headers?.cookie
    //         // console.log('Cookie:', cookie)

    //         const authorization = connectionParams['authToken']
    //         // console.log('Server auth:', authorization)

    //         // if server authorization available
    //         if (authorization) {
    //             if (authorization === process.env.REACT_APP_AUTH_TOKEN)
    //                 return true
    //             else
    //                 throw new Error('Incorrect auth token!');
    //         } else if (cookie) {
    //             const regex = /^(\w+)\=([^;\s]+)/g;

    //             var match = regex.exec(cookie);

    //             let token = ''
    //             if (match && match[1] === 'token')
    //                 token = match[2]

    //             // console.log('Token:', token)

    //             if (token) {
    //                 const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET!);

    //                 if (payload['id'])
    //                     return true
    //             } else {
    //                 throw new Error('Incorrect auth token!');
    //             }
    //         } else
    //             throw new Error('Incorrect auth token!');
    //     },
    // },
    // context: async ({ req, res }) => ({ req, res })
// });

interface MyContext {
  token?: String;
}

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  app.use('/graphql',
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

startApolloServer().catch((err) => {
  console.log(err);
});