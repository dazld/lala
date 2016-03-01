import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import {updateUsername, updatePassword, checkValidity} from '../actions';

class Login extends Component {

    constructor(props){
        super(props);
        this.onUpdateUsername = this.onUpdateUsername.bind(this);
        this.onUpdatePassword = this.onUpdatePassword.bind(this);
        // set initial state with es6 class
        this.state = {
            loading: false
        }
    }

    onUpdateUsername(e){

        this.setState({
            loading: true
        });

        this.props.dispatch(updateUsername(e.target.value));
        const checking = this.props.dispatch(checkValidity(e.target.value));

        checking.finally(_=> {
            this.setState({
                loading: false
            });
        });

    }

    onUpdatePassword(e){
        this.props.dispatch(updatePassword(e.target.value));
    }

    render(){
        const {username, password, validity} = this.props.user.credentials;
        const {loading} = this.state;
        const shouldShowMessage = !loading && validity;

        return (
            <div>
                <input
                    onChange={this.onUpdateUsername}
                    value={username}
                    type="text" /><br/>
                <input
                    onChange={this.onUpdatePassword}
                    value={password}
                    type="password" />
                {shouldShowMessage && <pre>hi dan!</pre>}
                {loading && <pre>...loading...</pre>}
            </div>
        )
    }
}


function mapStateToProps(state){
    const { user } = state;
    return {
        user
    }
}

export default connect(mapStateToProps)(Login);
