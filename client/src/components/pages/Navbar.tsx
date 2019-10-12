import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Link } from '@material-ui/core';
import { Home, Grain, ExitToApp } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1, 2),
            backgroundColor: '#e3f2fd'
        },
        link: {
            display: 'flex',
        },
        icon: {
            marginRight: theme.spacing(0.5),
            width: 20,
            height: 20,
        }
    }),
);

const NavBar: React.FC = (): JSX.Element => {

    const classes = useStyles();

    const host = window.location.hostname === 'localhost' ? window.location.hostname + ':8000' : window.location.hostname

    return (
        <Paper elevation={2} className={classes.root}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" href="/" className={classes.link}>
                    <Home className={classes.icon} />
                    ETL Runner
                </Link>
                <Link color="inherit" href={`http://${host}/graphql`} className={classes.link}>
                    <Grain className={classes.icon} />GraphQL
                </Link>
                <Link color="inherit" href='/logout' className={classes.link}>
                    <ExitToApp className={classes.icon} />Logout
                </Link>
            </Breadcrumbs>
        </Paper>
    );
}

export default NavBar;