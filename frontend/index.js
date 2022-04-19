const bg_color = '#231f20';

const socket = io.connect('https://site95.webte.fei.stuba.sk:9000')


socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode',handleGameCode)
socket.on('unknownGame', handleUnknownGame);
socket.on('tooManyPlayers',handleTooManyPlayers);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById('initialScreen')
const newGameButton = document.getElementById('newGameButton')
const joinGameButton = document.getElementById('joinGameButton')
const gameCodeInput = document.getElementById('gameCodeInput')
const gameCodeDisplay = document.getElementById('gameCodeDisplay')

newGameButton.addEventListener('click',newGame);
joinGameButton.addEventListener('click', joinGame);

let canvas , ctx, playerNumber;
let gameActive = false;

function newGame(){
    socket.emit('newGame');
    init();
}
function joinGame(){
    const code = gameCodeInput.value;
    socket.emit('joinGame',code);
    init();
}

function init() {
    initialScreen.style.display = 'none';
    gameScreen.style.display ='block';

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 600;

    ctx.fillStyle = bg_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.addEventListener("keydown", keydown);

    gameActive = true;

}
function keydown(e){
    socket.emit("keydown", e.keyCode)
}

function paintGame(state){
    ctx.fillStyle = bg_color;
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // const food = state.food
    const gridsize = state.gridSize;
    const size = canvas.width / gridsize;

    // ctx.fillStyle = food_color
    // ctx.fillRect(food.x * size, food.y *size, size, size )

    paintPlayer(state.players[0], size, "#D9AFD9");
    paintPlayer(state.players[1], size, "#97D9E1");
}

function paintPlayer(playerState, size, color){
    const snake = playerState.snake;

    ctx.fillStyle = color;
    for (let cell of snake){
        if(cell.x === playerState.pos.x && cell.y === playerState.pos.y){
            ctx.fillStyle = 'white';
            ctx.fillRect(cell.x * size, cell.y * size, size-2, size-2);
        }
        else {
            ctx.fillStyle = color;
            ctx.fillRect(cell.x * size, cell.y * size, size-2, size-2)
        }
    }
}

function handleInit(number){
    playerNumber = number;

}

function handleGameOver(data){
    if(!gameActive){
        return;
    }
    data = JSON.parse(data);

    gameActive = false;

    if(data.winner === playerNumber){
        alert("YOU WIN");
    }
    else{
        alert("YOU LOST")
    }
}
function handleGameState(gameState){
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState)
    requestAnimationFrame(()=> paintGame(gameState))
}
function handleGameCode(gameCode){
    gameCodeDisplay.innerText = gameCode;
}

function handleTooManyPlayers(){
    reset()
    alert('Game already in progress')
}

function handleUnknownGame(){
    reset()
    alert('Unknown game code')
}
function reset() {
    playerNumber = null;
    gameCodeInput.value = ""
    initialScreen.style.display = 'block'
    gameScreen.style.display = 'none';
}


