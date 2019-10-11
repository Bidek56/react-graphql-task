import React, { useContext, useRef } from "react";
import AuthContext, { AuthContextInterface } from "../../context/Auth/auth";
import { Avatar, Button, Container, Box, CssBaseline, TextField, Typography, Link } from '@material-ui/core';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
// import { Redirect } from "react-router-dom";

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

const LoginPage: React.FC = () => {
    const context = useContext<AuthContextInterface | null>(AuthContext);

    const classes = useStyles();

    const userRef = useRef<string>('');
    const passRef = useRef<string>('');

    const ctxTokenCheck = context && context.token
    const ctxErrorCheck = context && context.error

    // useEffect(() => {
    console.log("Login context:", context);
    // if (context && context.token) {
    //     return (<Redirect to="/" />)
    // }
    // }, [context, ctxTokenCheck, ctxErrorCheck]);

    function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        context && context.login(userRef.current, passRef.current);
    }

    return (
        <Container component="main" maxWidth="xs">
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
        </Container>
    );
};

export default LoginPage;
