import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { StatusContext } from './context/StatusContext';
import LoginPage from "./components/Login";
import NavBar from './components/Navbar'
import Main from './components/Main'
import { CookiesProvider, useCookies } from "react-cookie";

const App: React.FC = (): JSX.Element => {

    const [user, setUser] = useState<string | null>(null)
    const [running, setRunning] = useState<boolean>(false)
    const statusValue = useMemo(() => ({ running, setRunning }), [running, setRunning]);

    const [cookies, , removeCookie] = useCookies(['etl-token']);

    // console.log('Home Cookies:', cookies)
    // console.log('User:', user)

    const logout = () => {
        removeCookie("token");
        setUser(null)
    }

    return (
        <CookiesProvider>
            <Fragment>
                {user || (cookies && cookies.token) ?
                    <div>
                        <Helmet>
                            <title>{running ? "ETL in progress" : "ETL Runner"}</title>
                            <link rel="shortcut icon" href={running ? "/favicon-busy-2.ico" : "/favicon.ico"}></link>
                        </Helmet>

                        <StatusContext.Provider value={statusValue}>
                            <NavBar logout={logout} />
                            <br />
                            <Main />
                        </StatusContext.Provider>
                    </div>
                    : <LoginPage setUser={setUser} />}
            </Fragment>
        </CookiesProvider>
    );
};

export default App;