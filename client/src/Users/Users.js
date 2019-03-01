import React from 'react';
import axios from 'axios';

class Users extends React.Component {
  state = {
    users: [],
  };

  componentDidMount = () => {
    const url = 'http://localhost:5000/api/users';
    const token = localStorage.getItem('jwt');
    const reqOptions = {
      headers: {
        authorization: token,
      },
    };
    axios
      .get(url, reqOptions)
      .then(res => {
        this.setState({ users: res.data });
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className="userList ">
        <h2>List of Users</h2>
        <ul>
          {this.state.users.map(user => {
            return <li key={user.id}>{user.username}</li>;
          })}
        </ul>
      </div>
    );
  }
}

export default Users;
