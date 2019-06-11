const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const session = require('express-session')
const dbConnection = require('./database')
const MongoStore = require('connect-mongo')(session)
const passport = require('./passport');
const app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const PORT = 8080
    // Route requires
const userRoutes = require('./routes/user')
const battleSlotRoutes = require('./routes/battle')
const battlesRoutes = require('./routes/battles')
const BattleSlot = require('./database/models/battleSlots')
const User = require('./database/models/user')
const Battle = require('./database/models/battle')

const userIdByClient = new Map();
const clientsByUserId = new Map();

const attacks = require('../src/json/attacks')
const utils = require('./utils')

// MIDDLEWARE
app.use(morgan('dev'))
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)
app.use(bodyParser.json())

// Sessions
app.use(
    session({
        secret: 'fraggle-rock', //pick a random string to make the hash that is generated secure
        store: new MongoStore({ mongooseConnection: dbConnection }),
        resave: false, //required
        saveUninitialized: false //required
    })
)

// Passport
app.use(passport.initialize())
app.use(passport.session()) // calls the deserializeUser


// Routes
app.use('/user', userRoutes)
app.use('/battle', battleSlotRoutes)
app.use('/battles', battlesRoutes)

io.on('connection', function(socket) {
    socket.on('userIn', (data) => {
        clientsByUserId.set(socket, data.userId)
        userIdByClient.set(data.userId, socket)
        console.log(userIdByClient.size)
    })
    console.log('a user connected');
    socket.on('refreshBattles', function(data) {
        //console.log(`I received ${data}`);
        socket.broadcast.emit('refresh', 'refresh')
    });

    socket.on('battleRequest', function(data) {
        //console.log(data)
        console.log(`I received this battleRequest by ${data.challengerName} to ${data.initiatorName}`)
        if (userIdByClient.get(data.initiatorId)) {
            const initSocket = userIdByClient.get(data.initiatorId)
            BattleSlot.update({ _id: data.battleId }, {
                $set: {
                    [`challengers.${data.challengerId}`]: {
                        challengerName: data.challengerName
                    }
                }
            }, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    initSocket.emit('challengeRequest', data)
                }
            })
        }
    })

    socket.on('acceptChallenge', async(data) => {
        console.log(`Challenge from ${data.challengerName} was accepted by ${data.initiatorName}`)
        let query = BattleSlot.update({ _id: data.battleId }, {
            $set: {
                openBattle: true,
                challengeAccepted: true
            }
        })

        const results = await query.exec()

        query = User.findById(data.initiatorId)
        const player1 = await query.exec()

        query = User.findById(data.challengerId)
        const player2 = await query.exec()
        console.log(player1)
        console.log(player2)

        console.log(data.initiatorId, data.challengerId)

        // Update users to in-battle mode
        query = User.update({
            _id: {
                $in: [data.initiatorId, data.challengerId]
            }
        }, {
            $set: {
                inBattle: true
            }
        }, { multi: true })

        const updatePlayers = await query.exec()
        const body = {
            initiatorId: data.initiatorId,
            initiatorName: data.initiatorName,
            initiatorCurHP: player1.hpMax,
            initiatorMaxHP: player1.hpMax,
            initiatorCurMP: player1.mpMax,
            initiatorMaxMP: player1.mpMax,
            challengerName: data.challengerName,
            challengerId: data.challengerId,
            challengerCurHP: player2.hpMax,
            challengerMaxHP: player2.hpMax,
            challengerCurMP: player2.mpMax,
            challengerMaxMP: player2.mpMax,
            battleSlotId: data.battleId
        }
        const newBattle = new Battle(body)
        newBattle.save((err, savedBat) => {
            if (err) {
                console.log(err)
            } else {
                const initSocket = userIdByClient.get(data.challengerId)
                if (initSocket) {
                    socket.emit('redirectBattle', savedBat)
                    initSocket.emit('redirectBattle', savedBat)
                }
            }
        })
    })

    socket.on('disconnect', (data) => {
        console.log('socket disconnect')
        const userId = clientsByUserId.get(socket)
        clientsByUserId.delete(socket)
        if (userIdByClient.get(userId) && userIdByClient.get(userId).id === socket.id) {
            userIdByClient.delete(userId)
        }
        console.log(`available sockets: ${clientsByUserId.size}`)
    })

    socket.on('strike', async(data) => {

        let query = Battle.findById(data.battleId)
        const battle = await query.exec();
        const rolls = utils.roll(attacks.strike.stats)

        let lastAction = null
        if (battle.actions.length >= 1) {
            lastAction = battle.actions[battle.actions.length - 1]
        }

        let myHP = (data.myId === battle.initiatorId) ? battle.initiatorCurHP : battle.challengerCurHP
        let myMaxHP = (data.myId === battle.initiatorId) ? battle.initiatorMaxHP : battle.challengerMaxHP
        let myMP = (data.myId === battle.initiatorId) ? battle.initiatorCurMP : battle.challengerCurMP
        let iamMP = (data.myId === battle.initiatorId) ? 'initiatorCurMP' : 'challengerCurMP'
        myMP -= attacks.strike.cost
        let iam = (data.myId === battle.initiatorId) ? 'initiatorCurHP' : 'challengerCurHP'
        console.log(iam)
        if (lastAction && lastAction.stats && lastAction.stats.accuracy && lastAction.stats.accuracy >= rolls.dodge) {
            myHP -= lastAction.stats.damage
            if (myHP < 0) {
                myHP = 0
            }
        }
        console.log(myHP)
        let battleState = null

        if (myHP == 0) {
            battle.battleState = 'end'
        }
        if (battle.battleState === 'player1') {
            battleState = 'player2'
        } else if (battle.battleState === 'player2') {
            battleState = 'player1'
        }

        const action = { attackerName: data.myName, attackerId: data.myId, stats: rolls, type: 'strike' }
        console.log(action)
        console.log(iam)
        console.log(iamMP)
        query = Battle.update({ _id: data.battleId }, { $set: { battleState: battleState, [iam]: myHP, [iamMP]: myMP }, $push: { actions: action } })

        const updateBattle = await query.exec()

        enemy = (data.myId === battle.initiatorId) ? battle.challengerId : battle.initiatorId
        const initSocket = userIdByClient.get(enemy)
        if (initSocket) {
            socket.emit('updateBattle', 'refresh')
            initSocket.emit('updateBattle', 'refresh')
        }


    })
});

// Starting Server 
http.listen(PORT, () => {
    console.log(`App listening on PORT: ${PORT}`)
})