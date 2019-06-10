import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";
import BattleSlot from "./battleSlot"
import MyBattle from "./myBattle"
import groupBy from "../utils/helpers"

let socket = null

let API_URL = process.env.REACT_APP_API_DEV
if (process.env.REACT_APP_ENV === 'PRODUCTION'){
  API_URL = process.env.REACT_APP_API_PROD
}

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createdBattle: false,
      handlingButton: false,
      battles: [],
      challengers: {}
    }
    console.log(this.state)
    this.handleClick = this.handleClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.getBattles = this.getBattles.bind(this);
    this.sendBattleRequest = this.sendBattleRequest.bind(this);
    console.log('hey')
  }

  componentWillUnmount = () => this.abortController.abort();

  abortController = new window.AbortController();

  componentDidMount(){
    socket = socketIOClient(API_URL)
    socket.emit('userIn', {userId: this.props._id})
    this.getBattles()

    socket.on('refresh', (data) =>{
      //console.log('yay!')
      this.getBattles()
    })

    socket.on('challengeRequest', (data) =>{
      console.log(data)
      console.log(`I was challenged by ${data.challengerName}`)
      const challengers = this.state.challengers
      challengers[data.challengerId] = data.challengerName
      this.setState({challengers: challengers})
      console.log(this.state)
    })
  }

  sendBattleRequest(data){
    data.challengerId = this.props._id
    data.challengerName = this.props.username
    console.log(data)
    socket.emit('battleRequest', data)
  }

  handleClick(){
    this.setState({handlingButton: true})
    this.postBattle();
  }

  handleRemove(){
    this.setState({handlingButton: true})
    const body = {username: this.props.username, _id: this.props._id}
    axios.post("/battle/delete",body).then(response => {
      //console.log(response.data);
      this.getBattles()
      this.setState({createdBattle: false, handlingButton: false, challengers: {}})
      socket.emit('refreshBattles', 'refresh')
    });
  }

  getBattles(){
    axios.get('/battle/').then(response => {
      const battles = response.data.data
      let createdBattle = false
      
      const output = groupBy(battles, battle => (battle.initiatorId === this.props._id ? 'myBattle': 'battles'))
      console.log(output)
      console.log(this.props._id)
      if (output.myBattle && output.myBattle.length > 0) {
        createdBattle = true
      }

      if(output.myBattle){
        output.myBattle = output.myBattle[0]
      }else{
        output.myBattle = null
      }

      if(!output.battles){
        output.battles = []
      }

      this.setState({battles: output.battles, createdBattle: createdBattle, myBattle: output.myBattle})
    })
  }

  postBattle() {
    console.log(this.props)
    const body = {username: this.props.username, _id: this.props._id}
    axios.post("/battle/",body).then(response => {
      //console.log(response.data);
      this.getBattles()
      socket.emit('refreshBattles', 'refresh')
      this.setState({handlingButton: false})
    });
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
        <p> Welcome to da grid, mate </p>{" "}
        { !this.state.handlingButton && !this.state.createdBattle &&
        <button type="button" className='btn btn-secondary' onClick={this.handleClick}>
          Create Battle
        </button>
        }

        { !this.state.handlingButton && this.state.createdBattle && 
          <button type="button" className='btn btn-error' onClick={this.handleRemove}>
            Remove Battle
          </button>
        }
        <div style={deckStyle}>
        { this.state.createdBattle &&
          <MyBattle initiatorId ={this.props._id}
                  initiatorName ={this.props.username}
                  challengers={this.state.challengers}/>}
        </div>
        <div style={deckStyle}>{battles}</div>
      </div>
    );
  }
}

const deckStyle = {width:'100%', display:'flex', marginTop: '10px',
flexDirection:'row',alignItems: 'center',
textAlign: 'center', justifyContent:'center'}

export default Home;
