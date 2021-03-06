import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import logo from "../logo.svg";
import "../App.css";
import axios from "axios";

class Navbar extends Component {
  constructor() {
    super();
    this.logout = this.logout.bind(this);
  }

  logout(event) {
    event.preventDefault();
    console.log("logging out");
    axios
      .post("/user/logout")
      .then(response => {
        console.log(response.data);
        if (response.status === 200) {
          this.props.updateUser({
            loggedIn: false,
            username: null
          });
          this.props.history.push('/login')
        }
      })
      .catch(error => {
        console.log("Logout error");
      });
  }

  render() {
    const loggedIn = this.props.loggedIn;
    //console.log("navbar render, props: ");
    //console.log(this.props);

    return (
      <div>
        <div style={deckStyle} className='App-header'>
        <div>
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title"><div>Battle Grid PoC</div></h1>
          </div>
        </div>
        <header className="navbar App-header" id="nav-container">
            {loggedIn ? (
              <section>
                <Link to="/" className="btn btn-link text-secondary">
                  <span className="text-secondary">home</span>
                </Link>
                <Link
                  to="#"
                  className="btn btn-link text-secondary"
                  onClick={this.logout}
                >
                  <span className="text-secondary">logout</span>
                </Link>
              </section>
            ) : (
              <section>
                <Link to="/login" className="btn btn-link text-secondary">
                  <span className="text-secondary">login</span>
                </Link>
                <Link to="/signup" className="btn btn-link">
                  <span className="text-secondary">sign up</span>
                </Link>
              </section>
            )}
        </header>
      </div>
    );
  }
}

const deckStyle = {width:'100%', display:'flex',
flexDirection:'row',alignItems: 'center',
textAlign: 'center', justifyContent:'center'}

export default withRouter(Navbar);
