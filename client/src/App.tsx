import React, { useState, useMemo } from 'react';
import Login from './Login'
import NavBar from './Navbar'
import NewTaskForm from './NewTaskForm';
import TaskList from './TaskList';
import { Helmet } from 'react-helmet';
import { StatusContext } from './StatusContext';
import { CookiesProvider, useCookies } from "react-cookie";
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from '@apollo/react-hooks'

const local = window.location.hostname === 'localhost'

const httpLink = new HttpLink({
    uri: local ? 'http://localhost:8000/graphql' : `https://${window.location.hostname}/graphql`, credentials: 'same-origin'
});

const wsLink = new WebSocketLink({
    uri: local ? 'ws://localhost:8000/graphql' : `wss://${window.location.hostname}/graphql`,
    options: {
        lazy: true,
        reconnect: true,
    },
});

interface Definintion {
    kind: string;
    operation?: string;
};

const link = split(
    ({ query }) => {
        const { kind, operation }: Definintion = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    }, wsLink,
    httpLink,
);

const cache = new InMemoryCache();
const client = new ApolloClient({ link, cache });

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
                            <Helmet>
                                <title>{running ? "ETL in progress" : "ETL Runner"}</title>
                                <link rel="shortcut icon" href={running ? "/favicon-busy-2.ico" : "/favicon.ico"}></link>
                            </Helmet>

                            <StatusContext.Provider value={statusValue}>
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
