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
const user = require('./routes/user')
const battle = require('./routes/battle')

const userIdByClient = new Map();

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
app.use('/user', user)
app.use('/battle', battle)

io.on('connection', function(socket) {
    socket.on('userIn', (data) => {
        userIdByClient.set(data.userId, socket)
        console.log(userIdByClient.size)
    })
    console.log('a user connected');
    socket.on('refreshBattles', function(data) {
        //console.log(`I received ${data}`);
        socket.broadcast.emit('refresh', 'refresh')
    });

});

// Starting Server 
http.listen(PORT, () => {
    console.log(`App listening on PORT: ${PORT}`)
})