import React, { Component } from 'react';
import './App.css';
import { Route, NavLink } from 'react-router-dom';

import Login from './Login/Login';
import Users from './Users/Users';

class App extends Component {
  render() {
    return (
      <>
        <header>
          <nav>
            <NavLink to="/login">Login</NavLink>
            &nbsp;|&nbsp;
            <NavLink to="/users">Users</NavLink>
          </nav>
        </header>
        <main>
          <Route path="/login" component={Login} />
          <Route path="/users" component={Users} />
        </main>
      </>
    );
  }
}

export default App;
