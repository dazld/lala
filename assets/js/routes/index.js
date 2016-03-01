import 'babel-polyfill';
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../containers/app';
import Login from '../components/login'
// import Home from './components/home';
// import StartFollowing from './components/start-following';
// import User from './components/user-page';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Login} />
    </Route>
);
