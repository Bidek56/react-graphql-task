import React, { Fragment, useContext, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { StatusContext } from '../../context/StatusContext';
import AuthContext, { AuthContextInterface } from "../../context/Auth/auth";
import LoginPage from "./Login";
import NavBar from './Navbar'
import Main from './Main'

const HomePage = () => {
    const context = useContext<AuthContextInterface | null>(AuthContext);
    console.log("Home context", context);

    const [running, setRunning] = useState<boolean>(false)
    const statusValue = useMemo(() => ({ running, setRunning }), [running, setRunning]);

    return (
        <Fragment>
            {context && context.token ?
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
