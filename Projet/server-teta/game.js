// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const socket = new WebSocket('ws://localhost:8080');

let players = {};
let playerId = null;

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        playerId = data.id;
        players = data.players;
    } else if (data.type === 'update') {
        players = data.players;
    }

    render();
};

function movePlayer(dx, dy) {
    if (playerId) {
        socket.send(JSON.stringify({ type: 'move', id: playerId, dx, dy }));
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -10);
            break;
        case 'ArrowDown':
            movePlayer(0, 10);
            break;
        case 'ArrowLeft':
            movePlayer(-10, 0);
            break;
        case 'ArrowRight':
            movePlayer(10, 0);
            break;
    }
});

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = id === playerId ? 'blue' : 'red';
        ctx.fillRect(player.x, player.y, 20, 20);
    }
}