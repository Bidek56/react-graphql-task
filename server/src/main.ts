import { ApolloServer } from 'apollo-server';
import { typeDefs } from "./typeDefs";
import { resolvers } from './resolvers'

const authToken: string = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

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