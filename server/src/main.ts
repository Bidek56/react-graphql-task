import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./typeDefs";
import { resolvers } from './resolvers'
import jsonwebtoken from 'jsonwebtoken'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../.env'), debug: process.env.DEBUG })
}

if (!process.env.REACT_APP_AUTH_TOKEN) {
    console.error('Error: Missing REACT_APP_AUTH_TOKEN')
    process.exit(1);
}

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

// const { url } = await startStandaloneServer(server);
// console.log(`🚀 Server ready at ${url}`);


interface MyContext {
    token?: String;
}

const server = new ApolloServer<MyContext>({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
    listen: { port: 4000 },
});
console.log(`🚀  Server ready at ${url}`);

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
}