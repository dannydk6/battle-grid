import React, { Component } from "react";

class BattleSlot extends Component {
    constructor(){
        super()
        this.state = {
            challengeSent: false
        }
    }
    handleClick = () => {
        this.setState({challengeMade: true})
        this.props.sendBattleRequest(
            {initiatorId: this.props.initiatorId,
             initiatorName: this.props.initiatorName,
             battleId: this.props.battleId})
    }
    componentWillUnmount = () => this.abortController.abort();

    abortController = new window.AbortController();
    render() {
        return ( 
        <div style={{width:'300px', alignContent: 'center', margin: '10px'}}>
        <div className="card">
        <div className="card-header">
            Battle
        </div>
        <div className="card-body">
            <p className="card-text">Initiator: {this.props.initiatorName}</p>
            <p className="card-text">Challenger: {this.props.challengerName || 'None'}</p>
            { !this.state.challengeSent &&
            <button className="btn btn-primary" onClick={this.handleClick}>Challenge Request</button>
            }
        </div>
        </div>
        </div>
        );
    }
}

export default BattleSlot;