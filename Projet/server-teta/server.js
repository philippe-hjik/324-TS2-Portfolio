const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const players = {}; // Store player positions

wss.on('connection', (ws) => {
    const id = generateId();
    players[id] = { x: 100, y: 100 }; // Default position for new players

    ws.send(JSON.stringify({ type: 'init', id, players })); // Send initial state to new client

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const player = players[data.id];
            if (player) {
                player.x += data.dx;
                player.y += data.dy;
            }
            broadcast(JSON.stringify({ type: 'update', players }));
        }
    });

    ws.on('close', () => {
        delete players[id];
        broadcast(JSON.stringify({ type: 'update', players }));
    });
});

function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}