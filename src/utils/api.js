import axios from "axios";
import { groupBy } from "./helpers"

export function getBattles() {
    if (this._isMounted) {
        axios.get('/battle/').then(response => {
            const battles = response.data.data
            let myBattle = {}
            let challengers = {}
            let createdBattle = false

            const output = groupBy(battles, battle => (battle.initiatorId === this.props._id ? 'myBattle' : 'battles'))
            console.log(output)
            if (output.myBattle && output.myBattle.length > 0) {
                createdBattle = true
                myBattle = output.myBattle[0]
                for (let key in myBattle.challengers) {
                    challengers[key] = myBattle.challengers[key].challengerName
                }
            }

            if (!output.battles) {
                output.battles = []
            }
            if (this._isMounted) {
                this.setState({ battles: output.battles, createdBattle: createdBattle, myBattle: myBattle, challengers: challengers })
            }
        })
    }
}

export function getBattleStats() {
    if (this._isMounted) {
        let iam = null
        const battleId = this.props.battleId
            //console.log(battleId)
        axios.get(`/battles/${battleId}`).then(response => {
            if (response.data.error) {
                console.log('no existing battle')
            } else {
                const battle = response.data.data;
                console.log(battle)
                if (this.props._id === battle.initiatorId) {
                    iam = 'player1'
                } else if (this.props._id === battle.challengerId) {
                    iam = 'player2'
                } else {
                    iam = 'spectator'
                }

                const myName = (iam === 'player1') ? battle.initiatorName : battle.challengerName
                const myId = (iam === 'player1') ? battle.initiatorId : battle.challengerId
                const myHP = (iam === 'player1') ? battle.initiatorCurHP : battle.challengerCurHP
                const myMaxHP = (iam === 'player1') ? battle.initiatorMaxHP : battle.challengerMaxHP
                const myMP = (iam === 'player1') ? battle.initiatorCurMP : battle.challengerCurMP
                const myMaxMP = (iam === 'player1') ? battle.initiatorMaxMP : battle.challengerMaxMP
                const enemyName = (iam === 'player2') ? battle.initiatorName : battle.challengerName
                const enemyId = (iam === 'player2') ? battle.initiatorId : battle.challengerId
                const enemyHP = (iam === 'player2') ? battle.initiatorCurHP : battle.challengerCurHP
                const enemyMaxHP = (iam === 'player2') ? battle.initiatorMaxHP : battle.challengerMaxHP
                const enemyMP = (iam === 'player2') ? battle.initiatorCurMP : battle.challengerCurMP
                const enemyMaxMP = (iam === 'player2') ? battle.initiatorMaxMP : battle.challengerMaxMP

                this.setState({
                    myName,
                    myId,
                    myHP,
                    myMaxHP,
                    myMP,
                    myMaxMP,
                    enemyName,
                    enemyId,
                    enemyHP,
                    enemyMaxHP,
                    enemyMP,
                    enemyMaxMP,
                    battleState: battle.battleState,
                    actions: battle.actions,
                    me: iam
                })
            }
        });

    }
}