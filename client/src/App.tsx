import React, { useState, useMemo } from 'react';
import bcryptjs from 'bcryptjs'
import Login from './Login'
import NavBar from './Navbar'
import Main from './Main'
import { Helmet } from "react-helmet";
import { StatusContext } from './StatusContext';

const App: React.FC = () => {

    // user hook
    const [user, setUser] = useState<string | null>(null)
    const [running, setRunning] = useState<boolean>(false)

    const statusValue = useMemo(() => ({ running, setRunning }), [running, setRunning]);

    const signIn = (username: string, password: string) => {
        const username_hash: string = '$2a$10$wt3Tx3f/zIADCzK1Euceqe8AYY6vQPREd6cWy1QSDTifbF86Vk3u.'
        const pass_hash: string = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'
        bcryptjs.compare(username, username_hash).then((res) => {
            if (res)
                return res
            else {
                console.log('Error: Invalid user name')
                alert('Error: Invalid user name')
                return false
            }
        }).then((res) => {
            if (res)
                bcryptjs.compare(password, pass_hash).then((res) => {
                    if (res) {
                        setUser(username)
                        return res
                    } else {
                        console.log('Error: Invalid password')
                        alert('Error: Invalid password')
                        return false
                    }
                });
        }).catch((error) => {
            console.log(error, 'error decripting username and password')
        })
    }

    return (
        user ?
            <div>
                <Helmet>
                    <title>{running ? "ETL in progress" : "ETL Runner"}</title>
                    <link rel="shortcut icon" href={running ? "/favicon-busy-2.ico" : "/favicon.ico"}></link>
                </Helmet>
                <StatusContext.Provider value={statusValue}>
                    <NavBar onSignOut={(e: any) => setUser(null)} />
                    <br />
                    <Main />
                </StatusContext.Provider>
            </div>
            : <Login onSignIn={signIn} />
    )
}

export default App;
