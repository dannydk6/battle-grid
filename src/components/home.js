import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";
import BattleSlot from "./battleSlot"

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
      battles: []
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.getBattles = this.getBattles.bind(this);
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
      this.setState({createdBattle: false, handlingButton: false})
      socket.emit('refreshBattles', 'refresh')
    });
  }

  getBattles(){
    axios.get('/battle/').then(response => {
      const battles = response.data.data
      let createdBattle = false
      battles.forEach((battle) =>{
        battle.isPlayer = false
        if (battle.initiatorId === this.props._id){
          createdBattle = true
          battle.isPlayer = true
        }
      })
      this.setState({battles: battles, createdBattle: createdBattle})
    })
  }

  postBattle() {
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
      return <BattleSlot initiatorName={battle.initiatorName} initiatorId={battle.initiatorId} isPlayer={battle.isPlayer} key={battle._id} />
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
        <div style={{width:'100%', display:'flex', marginTop: '10px',
                    flexDirection:'row',alignItems: 'center',
                    textAlign: 'center', justifyContent:'center'}}>{battles}</div>
      </div>
    );
  }
}

export default Home;
