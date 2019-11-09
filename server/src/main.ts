import { ApolloServer } from 'apollo-server';
import { typeDefs } from "./typeDefs";
import { resolvers } from './resolvers'
import jsonwebtoken from 'jsonwebtoken'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../../.env'), debug: process.env.DEBUG })
}

if (!process.env.REACT_APP_AUTH_TOKEN) {
    console.error('Error: Missing REACT_APP_AUTH_TOKEN')
    process.exit(1);
}

const server: ApolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
        onConnect: (connectionParams: Object) => {
            console.log('connectionParams:', connectionParams)

            const authorization = connectionParams['authToken']

            // console.log('Server auth:', authorization)

            try {
                const tokens = authorization?.split(" ");

                console.log('Server Token:', tokens)

                if (tokens.length == 1) {
                    if (tokens[0] === process.env.REACT_APP_AUTH_TOKEN)
                        return true
                    else
                        throw new Error('Incorrect auth token!');
                } else if (tokens.length > 1) {
                    const payload = jsonwebtoken.verify(tokens[1], process.env.JWT_SECRET!);
                    // console.log('Payload:', payload)
                    return true
                } else {
                    throw new Error('Incorrect auth token!');
                }

            } catch (err) {
                console.log(err);
                throw new Error('Incorrect auth token!');
            }
        },
    },
    context: ({ req, res }) => ({ req, res })
});

server.listen({ port: 8000 }, () => {
    console.log('🔥🔥🔥 Apollo Server on http://localhost:8000/graphql');
});

if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.stop());
}