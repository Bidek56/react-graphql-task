import React, { useEffect } from 'react';
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/Login";
// import AuthContextWrapper from "./context/Auth";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { CookiesProvider, useCookies } from "react-cookie";

const Logout = () => {
    const [, , removeCookie] = useCookies(["token"]);
    removeCookie("token");
    return <Redirect to="/login" />;
};

const App = () => {
    return <CookiesProvider>
        <Router>
            <Switch>
                <Route exact path="/">
                    <HomePage />
                </Route>
                <Route exact path="/login">
                    <LoginPage />
                </Route>
                <Route exact path="/logout">
                    <Logout />
                </Route>
            </Switch>
        </Router>
    </CookiesProvider>
};

export default App;
