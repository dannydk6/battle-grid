import React, { Component } from "react";

import axios from "axios";
import BattleSlot from "./battleSlot"
import MyBattle from "./myBattle"
import * as api from "../utils/api"
import {deckStyle} from "../utils/helpers"
import {withRouter} from 'react-router-dom'


class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createdBattle: false,
      handlingButton: false,
      acceptedChallenge: false,
      battles: [],
      myBattle: {},
      challengers: {},
      currentBattle: false
    }
    this.handlePostBattleClick = this.handlePostBattleClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.sendBattleRequest = this.sendBattleRequest.bind(this);
    this.getBattles = api.getBattles.bind(this);
    this.acceptChallenge = this.acceptChallenge.bind(this);
    console.log('hey')
  }

  componentDidMount(){
    console.log(this.props)
    this._isMounted = true;
    
    this.props.socket.emit('userIn', {userId: this.props._id})
    this.getBattles()

    this.props.socket.on('refresh', (data) =>{
      //console.log('yay!')
      this.getBattles()
    })

    this.props.socket.on('challengeRequest', (data) =>{
      console.log(data)
      console.log(`I was challenged by ${data.challengerName}`)
      const challengers = this.state.challengers
      challengers[data.challengerId] = data.challengerName
      if (this._isMounted){
        this.setState({challengers: challengers})
      }
      console.log(this.state)
    })

    this.props.socket.on('redirectBattle', (data) =>{
      this.props.history.push(`/battle/${data._id}`)
    })
  }

  componentWillUnmount = () => {
    this._isMounted = false
    console.log(this.abortController)
    this.abortController.abort()
  };

  abortController = new window.AbortController();

  acceptChallenge(data) {
    if (this._isMounted) {
        this.setState({ acceptedChallenge: true })
        data.initiatorId = this.props._id
        data.initiatorName = this.props.username
    }
    console.log(data)
    this.props.socket.emit('acceptChallenge', data)
  }
  sendBattleRequest(data){
    data.challengerId = this.props._id
    data.challengerName = this.props.username
    console.log(data)
    this.props.socket.emit('battleRequest', data)
  }

  handlePostBattleClick(){
    if(this._isMounted){
      this.setState({handlingButton: true})
    }
    this.postBattle();
  }

  handleRemove(){
    if(this._isMounted){
      this.setState({handlingButton: true})
      const body = {username: this.props.username, _id: this.props._id}
      axios.post("/battle/delete",body).then(response => {
        //console.log(response.data);
        this.getBattles()
        if(this._isMounted){
        this.setState({createdBattle: false, handlingButton: false, challengers: {}})
        }
        this.props.socket.emit('refreshBattles', 'refresh')
      });
    }
  }

  postBattle() {
    if (this._isMounted){
      //console.log(this.props)
      const body = {username: this.props.username, _id: this.props._id}
      axios.post("/battle/",body).then(response => {
        //console.log(response.data);
        this.getBattles()
        this.props.socket.emit('refreshBattles', 'refresh')
        if(this._isMounted){
          this.setState({handlingButton: false})
        }
      });
    }
  }

  render() {
    const battles = this.state.battles.map((battle)=>{
      return <BattleSlot initiatorName={battle.initiatorName} 
      initiatorId={battle.initiatorId} 
      key={battle._id} 
      battleId={battle._id}
      sendBattleRequest={this.sendBattleRequest}/>
    })
    return (
      <div>
        { <p style={{marginTop: '10px'}}> Welcome to da grid, {this.props.username} </p>}
        { !this.props.inBattle && !this.state.acceptedChallenge && !this.state.handlingButton && !this.state.createdBattle &&
        <button type="button" className='btn btn-secondary' onClick={this.handlePostBattleClick}>
          Create Battle
        </button>
        }

        { !this.props.inBattle && !this.state.handlingButton && this.state.createdBattle && !this.state.acceptedChallenge && 
          <button type="button" className='btn btn-error' onClick={this.handleRemove}>
            Remove Battle
          </button>
        }
        <div style={deckStyle}>
          {/*&& this.props.inBattle && this.state.acceptedChallenge */}
        { this.state.createdBattle &&
          <MyBattle data={this.state.myBattle}
                  challengers={this.state.challengers}
                  acceptChallenge={this.acceptChallenge}/>}
        </div>
        <div style={deckStyle}>{!this.props.inBattle && battles}</div>
      </div>
    );
  }
}

export default withRouter(Home);
