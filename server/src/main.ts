import { ApolloServer } from 'apollo-server';
import { typeDefs } from "./typeDefs";
import { resolvers } from './resolvers'

import path from 'path'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../../.env'), debug: process.env.DEBUG })
}

if (!process.env.REACT_APP_AUTH_TOKEN) {
    console.error('Error: Missing REACT_APP_AUTH_TOKEN')
    process.exit(1);
}

const authToken = process.env.REACT_APP_AUTH_TOKEN || "<auth-token>";

const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams, webSocket) => {
            // console.log('connectionParams:', connectionParams)
            if (connectionParams['authToken'] && authToken === connectionParams['authToken'])
                return

            throw new Error('Missing auth token!');
        },
    },
});

server.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
}