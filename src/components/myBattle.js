import React, { Component } from "react";

class MyBattle extends Component {
    handleClick = (challengerId) => {
        const challengerName = this.props.challengers[challengerId]
        const battleId = this.props.data._id

        this.props.acceptChallenge({challengerId, challengerName, battleId})
    }
    componentWillUnmount = () => this.abortController.abort();

    abortController = new window.AbortController();

    transformChallengers(){
        const challengers = []
        for (let key in this.props.challengers){
            challengers.push(
            <p key={key} style={{marginBottom: '10px'}}>
                Name: {this.props.challengers[key]}
                <button onClick={this.handleClick.bind(this, key)} className='btn btn-sm btn-success' style={{marginLeft: '10px'}}>Accept Challenge</button>
            </p>
            )
        }
        return challengers
    }
    render() {
        const challengers = this.transformChallengers()
        return ( 
        <div style={{alignContent: 'center', margin: '10px'}}>
        <div className="card">
        <div className="card-header">
            My Battle
        </div>
        <div className="card-body">
            <p className="card-text">Challengers: {challengers.length || 'None'}</p>
            {challengers}
        </div>
        </div>
        </div>
        );
    }
}

export default MyBattle;