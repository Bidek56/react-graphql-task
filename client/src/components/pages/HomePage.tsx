import React, { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useCookies } from 'react-cookie';
import { StatusContext } from '../../context/StatusContext';
import LoginPage from "./Login";
import NavBar from './Navbar'
import Main from './Main'

const HomePage: React.FC = (): JSX.Element => {

    const [running, setRunning] = useState<boolean>(false)
    const statusValue = useMemo(() => ({ running, setRunning }), [running, setRunning]);

    const [cookies,] = useCookies(['etl-token']);

    console.log('Home Cookies:', cookies)

    return (
        <Fragment>
            {cookies && cookies.token ?
                <div>
                    <Helmet>
                        <title>{running ? "ETL in progress" : "ETL Runner"}</title>
                        <link rel="shortcut icon" href={running ? "/favicon-busy-2.ico" : "/favicon.ico"}></link>
                    </Helmet>

                    <StatusContext.Provider value={statusValue}>
                        <NavBar />
                        <br />
                        <Main />
                    </StatusContext.Provider>
                </div>
                : <LoginPage />}
        </Fragment>
    );
};

export default HomePage;
