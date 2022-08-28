import React, { useRef, useEffect } from 'react';
import { Avatar, Button, Container, Box, CssBaseline, TextField, Typography, Link } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useCookies } from 'react-cookie';
import { gql, useLazyQuery } from "@apollo/client";
import PropTypes from "prop-types";

const LOGIN_MUTATION = gql`
    query userLogin($name: String!, $password: String!) {
        login(name: $name, password: $password)
    }
`

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://www.google.com/">Google</Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

// Login functional component
const Login: React.FC<{ setUser: (username: string | null) => void }> = ({ setUser }): JSX.Element => {

    const userRef = useRef<string>('');
    const passRef = useRef<string>('');
    const [, setCookie] = useCookies(['token']);

    // Call graphql to retrieve the user info
    const [getUser, { loading, error, data }] = useLazyQuery(LOGIN_MUTATION);

    useEffect(() =>{
        if (data) {
            if (data.login) {
                setCookie("token", data.login, { maxAge: 3600, sameSite: 'strict' });
                setUser(userRef.current);
            } else {
                setUser(null)
                console.log('Error: Incorrect password')
                alert('Error: Incorrect password')
            }
        }
    }, [data]);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userRef.current.length) {
            console.log('Missing user')
            alert('Error: Missing user name')
            setUser(null)
            return
        }

        if (!passRef.current.length) {
            console.log('Missing password')
            alert('Error: Missing password')
            setUser(null)
            return
        }

        getUser({ variables: { name: userRef.current, password: passRef.current } })
    }

    if (error) return <p>`Error! ${error.message}`</p>;
    if (loading) return <p>Loading ...</p>;

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">ETL Sign in</Typography>
                <form id="loginForm" noValidate onSubmit={handleSignIn}>
                    <TextField id="userInput" variant="outlined" margin="normal" required fullWidth
                        label="User name" name="user" autoComplete="user" autoFocus onChange={e => userRef.current = e.target.value} />
                    <TextField id="passwordInput" variant="outlined" margin="normal" required fullWidth name="password"
                        label="Password" type="password" autoComplete="current-password" onChange={e => passRef.current = e.target.value} />
                    <Button id="signButton" type="submit" fullWidth variant="contained" color="primary">Sign in</Button>
                </form>
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container>
    );
}

Login.propTypes = {
    setUser: PropTypes.func.isRequired
}

export default Login;