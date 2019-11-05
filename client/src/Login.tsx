import React, { useRef } from 'react';
import { Avatar, Button, Container, Box, CssBaseline, TextField, Typography, Link } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { useCookies } from 'react-cookie';
import { useLazyQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag';
import bcryptjs from 'bcryptjs'
import PropTypes from "prop-types";

const USER_QUERY = gql`
    query user($name: String) {
        user(name: $name) {
            pass
        }
    }
`

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        '@global': {
            body: {
                backgroundColor: theme.palette.common.white,
            },
        },
        paper: {
            marginTop: theme.spacing(8),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main,
        },
        form: {
            width: '100%', // Fix IE 11 issue.
            marginTop: theme.spacing(1),
        },
        submit: {
            margin: theme.spacing(3, 0, 2),
        },
    }));

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://www.enterrasolutions.com/">Enterra Solution</Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

// Login functional component
const Login: React.FC<{ setUser: (username: string | null) => void }> = ({ setUser }): JSX.Element => {

    const classes = useStyles();
    const userRef = useRef<string>('');
    const passRef = useRef<string>('');
    const [, setCookie] = useCookies(['etl-token']);

    // Call graphql to retrieve the user info
    const [getUser, { loading, error, data }] = useLazyQuery(USER_QUERY)

    if (error) return <p>`Error! ${error.message}`</p>;
    if (loading) return <p>Loading ...</p>;

    if (data) {
        console.log(data)
        if (data.user && data.user.pass) {
            bcryptjs.compare(passRef.current, data.user.pass, (err, res) => {
                if (res) {
                    setCookie("token", "jwtencodedtoken$123", { maxAge: 3600, sameSite: 'strict' });
                    setUser(userRef.current);
                } else {
                    setUser(null)
                    console.log('Error: Incorrect password')
                    alert('Error: Incorrect password')
                }
            })
        } else {
            console.log('Error: Incorrect user name')
            alert('Error: Incorrect user name')
        }
    }

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

        getUser({ variables: { name: userRef.current } })
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">ETL Sign in</Typography>
                <form id="loginForm" className={classes.form} noValidate onSubmit={handleSignIn}>
                    <TextField id="userInput" variant="outlined" margin="normal" required fullWidth
                        label="User name" name="user" autoComplete="user" autoFocus onChange={e => userRef.current = e.target.value} />
                    <TextField id="passwordInput" variant="outlined" margin="normal" required fullWidth name="password"
                        label="Password" type="password" autoComplete="current-password" onChange={e => passRef.current = e.target.value} />
                    <Button id="signButton" type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>Sign in</Button>
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