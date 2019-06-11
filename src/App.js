import React, { Component } from "react";
import axios from "axios";
import { Route } from "react-router-dom";
import socketIOClient from "socket.io-client";
// components
import Signup from "./components/sign-up";
import LoginForm from "./components/login-form";
import Navbar from "./components/navbar";
import Home from "./components/home";
import {withRouter} from 'react-router-dom'
import Battle from "./components/battle"

let socket = null

let API_URL = process.env.REACT_APP_API_DEV
if (process.env.REACT_APP_ENV === 'PRODUCTION'){
  API_URL = process.env.REACT_APP_API_PROD
}

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
    this.abortController = new window.AbortController();
  }

  componentWillUnmount = () => {
    socket.disconnect()
    this.abortController.abort();
  }

  componentDidMount() {
    socket = socketIOClient(API_URL)
    this.getUser();
  }

  updateUser(userObject) {
    this.setState(userObject);
  }

  getUser() {
    console.log('getting user')
    axios.get("/user/").then(response => {
      //console.log("Get user response: ");
      console.log(response.data);
      if (response.data.user) {
        //console.log("Get User: There is a user saved in the server session: ");
        //console.log(response.data)
        this.setState({
          loggedIn: true,
          username: response.data.user.username,
          _id: response.data.user._id,
          inBattle: response.data.user.inBattle,
          attacks: response.data.user.attacks
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
        {/* Routes to different components */}
        {this.state.loggedIn && 
        <Route
          exact path="/"
          render={() => <Home _id={this.state._id} 
          username={this.state.username} 
          inBattle={this.state.inBattle}
          attacks={this.state.attacks}
          socket={socket}
          />} />}
        {this.state.loggedIn &&
        <Route
          path="/battle/:battleId"
          render={({match}) => <Battle 
          battleId={match.params.battleId}
          _id={this.state._id} 
          username={this.state.username} 
          inBattle={this.state.inBattle}
          attacks={this.state.attacks}
          socket={socket}
          loggedIn={this.state.loggedIn}
        />} />}
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
