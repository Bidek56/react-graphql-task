import React, { useState } from "react";
import Context, { AuthContextInterface } from "./auth";
import { useCookies } from "react-cookie";
import bcryptjs from 'bcryptjs'

const AuthContextWrapper = (props: any) => {

    const [cookies, setCookie] = useCookies(["token"]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loginFunction = (username: string, password: string) => {
        const username_hash: string = '$2a$10$wt3Tx3f/zIADCzK1Euceqe8AYY6vQPREd6cWy1QSDTifbF86Vk3u.'
        const pass_hash: string = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

        setLoading(true);

        bcryptjs.compare(username, username_hash).then((res) => {
            if (res)
                return res
            else {
                setError("Wrong user name");
                console.log('Error: Invalid user name')
                alert('Error: Invalid user name')
                return false
            }
        }).then((res) => {
            if (res)
                bcryptjs.compare(password, pass_hash).then((res) => {
                    if (res) {
                        setCookie("token", "jwtencodedtoken$123", { maxAge: 3600, sameSite: 'strict' });
                    } else {
                        setError("Wrong credentials");
                        console.log('Error: Invalid password')
                        alert('Error: Invalid password')
                    }
                });
        }).catch((error) => {
            console.log(error, 'error decripting username and password')
        })
        setLoading(false);
    }

    const sampleAppContext: AuthContextInterface = {
        token: cookies.token,
        error,
        loading,
        login: loginFunction
    }

    return (
        <Context.Provider value={sampleAppContext}>
            {props.children}
        </Context.Provider>
    );
};

export default AuthContextWrapper;
