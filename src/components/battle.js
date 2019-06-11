import React, { Component } from "react";
import Attacks from "../json/attacks"
import * as api from "../utils/api"

class Battle extends Component {
    constructor(){
        super()
        this.state = {
            myName: null,
            myId: null,
            myHP: null,
            myMaxHP: null,
            myMP: null,
            myMaxMP: null,
            enemyName: null,
            enemyId: null,
            enemyHP: null,
            enemyMaxHP: null,
            enemyMP: null,
            enemyMaxMP: null,
            battleState: null,
            me: null,
            actions: [],
            handling: false
        }

        this.getBattleStats = api.getBattleStats.bind(this)
        this.strike = this.strike.bind(this)
        this.meditate = this.meditate.bind(this)
    }

    strike(){
        if(this._isMounted && !this.state.handling){
        this.setState({handling: true})
        }
        const data = {
            myId: this.state.myId,
            myName: this.props.username,
            battleId: this.props.battleId
        }
        this.props.socket.emit('strike', data)
    }

    meditate(){

    }

    componentDidMount(){
        this._isMounted = true
        this.scrollToBottom();
        this.props.socket.emit('userIn', {userId: this.props._id})
        console.log('battle time')
        console.log(`my id ${this.props._id}`)
        this.getBattleStats()

        this.props.socket.on('updateBattle',(data)=>{
            if(this._isMounted){
                this.setState({handling: false})
            }
            this.getBattleStats()
        })
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
      
    componentDidUpdate() {
    this.scrollToBottom();
    }
    componentWillUnmount = () => {
        this._isMounted = false
        this.abortController.abort()
    };
    abortController = new window.AbortController();

    render() {
        let actions = this.state.actions.map((action, i) =>{
            const accArr= []
            for (var key in action.stats){
                accArr.push(`${key}: ${action.stats[key]}`)
            }
            const stats = accArr.map((a, j)=><div key={j}>{a}</div>)
            return <div key={i} style={{marginBottom: '20px'}}>{stats}</div>
        })
        let attackMenu = null
        if(!this.state.handling && this.state.me && this.state.me === this.state.battleState){
            attackMenu = <div style={{marginTop:'10px'}}><p>It is your turn</p>
            <div className="popover popover-top">
                <button onClick={this.strike} className='btn' style={{marginRight: '20px',width:'100px'}}>Strike</button>
                <div className="popover-container" style={{color:'black'}}>
                    <div className="card">
                        <div className="card-header">
                            Strike
                        </div>
                        <div className="card-body">
                            {attackText}
                        </div>
                    </div>
                </div>
            </div>
            <div className="popover popover-top">
                <button onClick={this.meditate} className='btn' style={{marginRight: '20px',width:'100px'}}>Meditate</button>
                <div className="popover-container" style={{color:'black'}}>
                    <div className="card">
                        <div className="card-body">
                            {meditateText}
                        </div>
                    </div>
                </div>
            </div>
            </div>
        }else{
            attackMenu = <p style={{marginTop:'10px'}}>Please wait for your turn</p>
        }
        return ( 
        <div style={{height:'calc(100% - 248px)'}}>
        <div className='container' style={{backgroundColor:'gold',color:'#222', minWidth:'450px'}}>
            <div className='columns' style={{paddingTop:'10px'}}>
                <div className='column col-6' style={{height: '30px'}}>
                Player 1: {this.state.myName}
                </div>
                <div className='column col-6'>
                Player 2: {this.state.enemyName}
                </div>
            </div>
            <div className='columns' style={{paddingTop:'10px'}}>
                <div className='column col-6' style={{height: '30px'}}>
                HP: {this.state.myHP}/{this.state.myMaxHP} 
                &nbsp;&nbsp;
                MP: {this.state.myMP}/{this.state.myMaxMP} 
                </div> 
                <div className='column col-6'>
                HP: {this.state.enemyHP}/{this.state.enemyMaxHP} 
                &nbsp;&nbsp;
                MP: {this.state.enemyMP}/{this.state.enemyMaxMP} 
                </div>
            </div>
        </div>
        <div style={{display:'flex', flexFlow:'column', height:'100%'}}>
            <div style={{backgroundColor: 'lightblue', flex:'1 1 auto',overflow: 'auto',padding:'20px'}}>
                {actions}
                <div style={{ float:"left", clear: "both" }}
                    ref={(el) => { this.messagesEnd = el; }}>
                </div>
            </div>
            <div style={{minHeight: '120px', color:'white',backgroundColor:'#222',flex:'0 1 auto'}}>
                {attackMenu}
            </div>
        </div>
        </div>
        );
    }
}

let attackText = []
for(var key in Attacks.strike.stats){
    attackText.push(<p key={key}>{key}: {Attacks.strike.stats[key]}</p>)
}

let meditateText = []
for(var key in Attacks.meditate.stats){
    meditateText.push(<p key={key}>{key}: {Attacks.meditate.stats[key]}</p>)
}
meditateText.push(<p key='description'>Description: {Attacks.meditate.description}</p>)

export default Battle;