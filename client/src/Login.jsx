import React, { useRef } from 'react';

// Login functional component
const Login = ({ onSignIn }) => {

    const userRef = useRef(null);
    const passRef = useRef(null);

    const handleSignIn = (e) => {
        e.preventDefault()
        // console.log(userRef.current, passRef.current)
        onSignIn(userRef.current, passRef.current)
    }

    return (
        <div className="row">
            <div className="card">
                <article className="card-body">
                    <form onSubmit={handleSignIn}>
                        <h3><span className="badge badge-pill badge-primary">ETL Login</span></h3>

                        <div className="login-form">
                            <div className="input-div col-sm-3">
                                <label className="login-field-icon fui-user" htmlFor="login-name">Username: </label>
                                <input type="text" className="login-field" placeholder="username" onChange={e => userRef.current = e.target.value} />
                            </div>

                            <div className="input-div col-sm-3">
                                <label className="login-field-icon fui-lock" htmlFor="login-pass">Password: </label>
                                <input type="password" className="login-field" placeholder="password" onChange={e => passRef.current = e.target.value} />
                            </div>
                            <br />
                            <input type="submit" id="submit" value="Log in" className="btn btn-primary" />
                        </div>
                    </form>
                </article>
            </div>
        </div>
    );
}

export default Login;