const fs = require("fs");
const {initGame, gameLoop, getUpdatedVelocity} = require('./game')
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const httpServer = require("https").createServer({
    key: fs.readFileSync("/home/xkocian/webte.fei.stuba.sk.key"),
    cert: fs.readFileSync("/home/xkocian/webte.fei.stuba.sk-chain-cert.pem")
});
const options = { cors: {
        origin: "*"
    }};
const io = require("socket.io")(httpServer, options);

const state = {}

const clientRooms = {}

io.on('connection', client => {

    client.on('keydown',handleKeyDown);
    client.on('newGame',handleNewGame);
    client.on('joinGame',handleJoinGame);

    function handleJoinGame(roomName){
        const room = io.sockets.adapter.rooms[roomName]
        let allUsers;
        if(room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if(allUsers){
            numClients = Object.keys(allUsers).length
        }
        if (numClients === 0){
            client.emit('unknownGame')
            return;

        } else if (numClients > 1){
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        client.number = 2;
        client.emit('init',2);

        startGameInterval(roomName);
    }

    function handleNewGame(){
        let roomName = makeid(3);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame()

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1)

    }

    function handleKeyDown(keyCode){
        const roomName = clientRooms[client.id];
        if (!roomName){
            return;
        }
        keyCode= parseInt(keyCode);
        // catch (e){
        //     console.log(e)
        //     return
        // }
        const vel = getUpdatedVelocity(keyCode);
        if (vel){
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
})

function startGameInterval(roomName){
    const intervalId = setInterval(()=>{
        const winner = gameLoop(state[roomName]);
        if (!winner){
            emitGameState(roomName, state[roomName])
        } else{
            emitGameOver(roomName, winner)
            state[roomName] = null;
            clearInterval(intervalId);

        }
    }, 1000/ FRAME_RATE)
}

function emitGameState(room,gamestate){
    io.sockets.in(room).emit('gameState', JSON.stringify(gamestate))
}

function emitGameOver(room, winner){
    io.sockets.in(room).emit('gameOver', JSON.stringify({winner}))

}

httpServer.listen(9000,"147.175.98.95",()=>{
    console.log("Listening on port 9000")
});