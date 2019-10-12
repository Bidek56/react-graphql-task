import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/Login";

const Logout: React.FC = (): JSX.Element => {
    const [, , removeCookie] = useCookies(["etl-token"]);
    removeCookie("token");
    return <Redirect to="/login" />;
};

const App: React.FC = (): JSX.Element => {
    return <CookiesProvider>
        <Router>
            <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/login" component={LoginPage} />
                <Route exact path="/logout" component={Logout} />
            </Switch>
        </Router>
    </CookiesProvider>
};

export default App;
