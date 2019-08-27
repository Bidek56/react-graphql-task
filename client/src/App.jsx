import React, { useState } from 'react';
import bcryptjs from 'bcryptjs'
import Login from './Login'
import NavBar from './Navbar'
import Main from './Main'


const App = () => {

    // user hook
    const [user, setUser] = useState(null)

    const signIn = (username, password) => {
        const username_hash = '$2a$10$wt3Tx3f/zIADCzK1Euceqe8AYY6vQPREd6cWy1QSDTifbF86Vk3u.'
        const pass_hash = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'
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
                <NavBar onSignOut={e => setUser(null)} />
                <Main />
            </div>
            : <Login onSignIn={signIn} />
    )
}

export default App;
