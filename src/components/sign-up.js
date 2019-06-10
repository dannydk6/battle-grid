import React, { Component } from 'react'
import {withRouter} from 'react-router-dom'
import axios from 'axios'

class Signup extends Component {
	constructor() {
		super()
		this.state = {
			username: '',
			password: '',
			confirmPassword: '',
			err: false
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}
	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value
		})
	}
	handleSubmit(event) {
		console.log('sign-up handleSubmit, username: ')
		console.log(this.state.username)
		event.preventDefault()

		//request to server to add a new username/password
		axios.post('/user/', {
			username: this.state.username,
			password: this.state.password
		})
			.then(response => {
				console.log(response)
				if (!response.data.error) {
					console.log('successful signup')
					this.props.history.push("/login");
				} else {
					this.setState({err: true})
					console.log('username already taken')
				}
			}).catch(error => {
				console.log('signup error: ')
				console.log(error)

			})
	}


render() {
	var errMsg = this.state.err ? <div><p>This username is already taken.</p></div> : ''
	return (
		<div className="SignupForm">
			<h4 style={{marginTop: '10px'}}>Sign up</h4>
			<div style={deckStyle}>
			<form className="form-horizontal">
				<div className="form-group">
					<p><label className="form-label" htmlFor="username">Username:</label>
						<input className="form-input"
							type="text"
							id="username"
							name="username"
							placeholder="Username"
							value={this.state.username}
							onChange={this.handleChange}
						/>
					</p>
				</div>
				<div className="form-group">
					<p><label className="form-label" htmlFor="password">Password: </label>
						<input className="form-input"
							placeholder="password"
							type="password"
							name="password"
							value={this.state.password}
							onChange={this.handleChange}
						/>
					</p>
				</div>
				<button
					className="btn btn-primary"
					onClick={this.handleSubmit}
					type="submit"
					>Sign up</button>
			</form>
		</div>
		{errMsg}
		</div>
	)
}
}

const deckStyle = {width:'100%', display:'flex', marginTop: '10px',
flexDirection:'row',alignItems: 'center',
textAlign: 'center', justifyContent:'center'}

export default withRouter(Signup)
