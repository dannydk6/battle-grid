import React, { Component } from "react";
import axios from "axios";
import { Route } from "react-router-dom";
// components
import Signup from "./components/sign-up";
import LoginForm from "./components/login-form";
import Navbar from "./components/navbar";
import Home from "./components/home";
import {withRouter} from 'react-router-dom'

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      username: null,
      _id: null
    };

    this.getUser = this.getUser.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  componentWillUnmount = () => this.abortController.abort();

  abortController = new window.AbortController();

  componentDidMount() {
    this.getUser();
  }

  updateUser(userObject) {
    this.setState(userObject);
  }

  getUser() {
    axios.get("/user/").then(response => {
      //console.log("Get user response: ");
      //console.log(response.data);
      if (response.data.user) {
        //console.log("Get User: There is a user saved in the server session: ");
        //console.log(response.data)
        this.setState({
          loggedIn: true,
          username: response.data.user.username,
          _id: response.data.user._id
        });
      } else {
        console.log("Get user: no user");
        this.setState({
          loggedIn: false,
          username: null,
          _id: null
        });
        this.props.history.push("/login");
      }
    });
  }

  render() {
    return (
      <div className="App">
        <Navbar updateUser={this.updateUser} loggedIn={this.state.loggedIn} />{" "}
        {/* greet user if logged in: */}{" "}
        {this.state.loggedIn && <p style={{paddingTop:'10px'}}> Join the party, {this.state.username}! </p>}{" "}
        {/* Routes to different components */}{" "}
        {this. state.loggedIn && <Route
          exact path="/"
          render={() => <Home _id={this.state._id} username={this.state.username} />} />}
        <Route
          path="/login"
          render={() => <LoginForm updateUser={this.updateUser} />}
        />
        <Route path="/signup" render={() => <Signup />} />
      </div>
    );
  }
}

export default withRouter(App);
