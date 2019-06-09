import React, { Component } from "react";

class BattleSlot extends Component {
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
            <a href="" className="btn btn-primary">Challenge!</a>
        </div>
        </div>
        </div>
        );
    }
}

export default BattleSlot;