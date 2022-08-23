import React from 'react';
import {Paper, Breadcrumbs, Link} from '@mui/material';
import { Home, Grain, ExitToApp } from '@mui/icons-material';
import PropTypes from "prop-types";

const NavBar: React.FC<{ logout: () => void }> = ({ logout }): JSX.Element => {

    const host = window.location.hostname === 'localhost' ? window.location.hostname + ':8000' : window.location.hostname

    return (
        <Paper elevation={2} style={{backgroundColor: '#e3f2fd'}}>
            <Breadcrumbs aria-label="breadcrumb">
                <Link color="inherit" href="/" style={{display: 'flex'}}>
                    <Home style={{marginRight: 0.5, width: 20, height: 20,}} />
                    Job Runner
                </Link>
                <Link color="inherit" href={`http://${host}/graphql`} style={{display: 'flex'}}>
                    <Grain style={{marginRight: 0.5, width: 20, height: 20,}} />GraphQL
                </Link>
                <Link color="inherit" href='/' style={{display: 'flex'}} onClick={logout} >
                    <ExitToApp style={{marginRight: 0.5, width: 20, height: 20,}} />Logout
                </Link>
            </Breadcrumbs>
        </Paper>
    );
}

NavBar.propTypes = {
    logout: PropTypes.func.isRequired
}

export default NavBar;