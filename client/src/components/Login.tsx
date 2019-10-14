import React, { useRef } from "react";
import { Avatar, Button, Container, Box, CssBaseline, TextField, Typography, Link } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { useCookies } from 'react-cookie';
import bcryptjs from 'bcryptjs'
import PropTypes from "prop-types";

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

const validateLogin = async (username: string, password: string): Promise<boolean> => {
    const username_hash: string = '$2a$10$wt3Tx3f/zIADCzK1Euceqe8AYY6vQPREd6cWy1QSDTifbF86Vk3u.'
    const pass_hash: string = '$2a$10$cSxWNd.SumgI26GOMODIreknJSDcwQIiN2N2kxj0CxosT1K5IlcWq'

    const ret = await bcryptjs.compare(username, username_hash)
    if (ret) {
        const pass_ret = await bcryptjs.compare(password, pass_hash);
        if (pass_ret) {
            return true
        } else {
            console.log('Error: Invalid password')
            alert('Error: Invalid password')
            return false
        }
    }
    else {
        console.log('Error: Invalid user name')
        alert('Error: Invalid user name')
        return false
    }
}

const LoginPage: React.FC<{ setUser: (username: string | null) => void }> = ({ setUser }): JSX.Element => {

    const classes = useStyles();
    const userRef = useRef<string>('');
    const passRef = useRef<string>('');
    const [, setCookie] = useCookies(['etl-token']);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const ret = await validateLogin(userRef.current, passRef.current);
        if (ret) {
            setCookie("token", "jwtencodedtoken$123", { maxAge: 3600, sameSite: 'strict' });
            setUser(userRef.current);
        }
        else
            setUser(null)
    }

    return (
        <Container component="main" maxWidth="xs" >
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">ETL Sign in</Typography>
                <form className={classes.form} noValidate onSubmit={handleSignIn}>
                    <TextField variant="outlined" margin="normal" required fullWidth id="user"
                        label="User name" name="user" autoComplete="user" autoFocus onChange={e => userRef.current = e.target.value} />
                    <TextField variant="outlined" margin="normal" required fullWidth name="password"
                        label="Password" type="password" id="password" autoComplete="current-password" onChange={e => passRef.current = e.target.value} />
                    <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>Sign in</Button>
                </form>
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container >
    );
};

LoginPage.propTypes = {
    setUser: PropTypes.func.isRequired
}

export default LoginPage;
