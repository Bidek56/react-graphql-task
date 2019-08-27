import React from 'react';
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks'

import NewTaskForm from './NewTaskForm';
import TaskList from './TaskList';

const authToken = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

const httpLink = new HttpLink({
    uri: 'http://localhost:8000/graphql',
});
const wsLink = new WebSocketLink({
    uri: `ws://localhost:8000/graphql`,
    options: {
        reconnect: true,
        connectionParams: {
            authToken: authToken
        }
    },
});
const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
);
const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

const Main = () => (
    <ApolloProvider client={client}>
        <div>
            <NewTaskForm />
            <br />
            <TaskList />
        </div>
    </ApolloProvider>
);

export default Main;