import React, { useState, useMemo } from 'react';
import Login from './Login'
import NavBar from './Navbar'
import NewTaskForm from './NewTaskForm';
import TaskList from './TaskList';
import { Helmet } from 'react-helmet';
import { StatusContext } from './StatusContext';
import { CookiesProvider, useCookies } from "react-cookie";
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloProvider, ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const local = window.location.hostname === 'localhost'

const wsLink = new GraphQLWsLink(
  createClient({
    url: local ? 'ws://localhost:4000/subscriptions' : `wss://${window.location.hostname}/subscriptions`,
    lazy: true,
  }),
);

const httpLink = new HttpLink({
    uri: local ? 'http://localhost:4000/graphql' : `https://${window.location.hostname}/graphql`, credentials: 'same-origin'
});

interface Definintion {
    kind: string;
    operation?: string;
};

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const link = split(
    ({ query }) => {
        const { kind, operation }: Definintion = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    }, wsLink,
    httpLink,
);

const client = new ApolloClient({ cache: new InMemoryCache(), link: link });

const App: React.FC = (): JSX.Element => {

    // user hook
    const [user, setUser] = useState<string | null>(null)
    const [running, setRunning] = useState<boolean>(false)
    const statusValue = useMemo(() => ({ running, setRunning }), [running, setRunning]);

    const [cookies, , removeCookie] = useCookies(['token']);

    const logout = () => {
        removeCookie("token");
        setUser(null)
    }

    return (
        <CookiesProvider>
            <ApolloProvider client={client}>
                <React.Fragment>
                    {user || (cookies && cookies.token) ?
                        <div>
                            <StatusContext.Provider value={statusValue}>
                            <Helmet>
                                <title>{running ? "ETL in progress" : "ETL Runner"}</title>
                                <link rel="shortcut icon" href={running ? "/favicon-busy-2.ico" : "/favicon.ico"}></link>
                            </Helmet>                                
                            <NavBar logout={logout} />
                            <br />
                            <NewTaskForm />
                            <br />
                            <TaskList />
                            </StatusContext.Provider>
                        </div>
                        : <Login setUser={setUser} />}
                </React.Fragment>
            </ApolloProvider>
        </CookiesProvider>
    );
}

export default App;
