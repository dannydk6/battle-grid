import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

class LoginForm extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      redirectTo: null,
      errLogin: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillUnmount = () => this.abortController.abort();

  abortController = new window.AbortController();
  
  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("handleSubmit");

    axios
      .post("/user/login", {
        username: this.state.username,
        password: this.state.password
      })
      .then(response => {
        console.log("login response: ");
        console.log(response);
        if (response.status === 200) {
          // update App.js state
          this.props.updateUser({
            loggedIn: true,
            username: response.data.username,
            _id: response.data._id,
            inBattle: response.data.inBattle,
            attacks: response.data.attacks
          });
          // update the state to redirect to home
          this.setState({
            redirectTo: "/",
            errLogin: false
          });
        }
      })
      .catch(error => {
        console.log("login error: ");
        console.log(error);
        this.setState({ errLogin: true });
      });
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect to={{ pathname: this.state.redirectTo }} />;
    } else {
      return (
        <div>
          <h4 style={{marginTop:'10px'}}> Login </h4>
          <div style={deckStyle}>
          <form className="form-horizontal">
            <div className="form-group">
                <p><label className="form-label" htmlFor="username">
                  Username:
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={this.state.username}
                  onChange={this.handleChange}
                /></p>
            </div>
            <div className="form-group">
              <p>
                <label className="form-label" htmlFor="password">
                  Password:
                </label>
                <input
                  className="form-input"
                  placeholder="password"
                  type="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </p>
            </div>
              <p><button
                className="btn btn-primary"
                onClick={this.handleSubmit}
                type="submit"
              >
              Login
              </button>
              </p>
          </form>
          
        </div>
        {this.state.errLogin && <p style={{color:'red'}}>Your username and password mismatch.</p>}
        </div>
      );
    }
  }
}

const deckStyle = {width:'100%', minWidth: '300px', display:'flex', marginTop: '10px',
flexDirection:'row',alignItems: 'center',
textAlign: 'center', justifyContent:'center'}

export default LoginForm;
