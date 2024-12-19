const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });

let players = []; // Joueurs connectés
let bullets = [];
let obstacles = [];

// Génération aléatoire des obstacles
function generateRandomObstacles(count) {
    const newObstacles = [];
    while (newObstacles.length < count) {
        const obstacleX = Math.random() * 750;
        const obstacleY = Math.random() * 550;
        const newObstacle = { x: obstacleX, y: obstacleY, width: 50, height: 50 };

        // Vérifie qu'aucun obstacle ne chevauche un autre
        const isColliding = newObstacles.some(obstacle =>
            obstacle.x < newObstacle.x + newObstacle.width &&
            obstacle.x + obstacle.width > newObstacle.x &&
            obstacle.y < newObstacle.y + newObstacle.height &&
            obstacle.y + obstacle.height > newObstacle.y
        );

        if (!isColliding) {
            newObstacles.push(newObstacle);
        }
    }
    return newObstacles;
}

// Initialiser les obstacles
obstacles = generateRandomObstacles(5);

// Diffuser l'état du jeu à tous les clients
function broadcastGameState() {
    const state = {
        type: 'updateState',
        players: players.map(p => ({
            id: p.id,
            x: p.x,
            y: p.y,
            ammo: p.ammo,
            score: p.score,
            lastKey: p.lastKey,
            color: p.color,
        })),
        bullets,
        obstacles,
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(state));
        }
    });
}

// Gestion des connexions entrantes
wss.on('connection', (ws) => {
    if (players.length >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Serveur plein' }));
        ws.close();
        return;
    }

    const playerId = players.length + 1;
    const newPlayer = {
        id: playerId,
        ws,
        x: playerId === 1 ? 50 : 730,
        y: 250,
        width: 30,
        height: 30,
        color: playerId === 1 ? 'green' : 'brown',
        score: 0,
        ammo: 15,
        lastKey: 'right',
    };
    players.push(newPlayer);

    ws.send(JSON.stringify({ type: 'assignRole', role: playerId === 1 ? 'green' : 'brown' }));

    // Si deux joueurs sont connectés, commencez le jeu
    if (players.length === 2) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'start' }));
            }
        });
    }

    // Gérer les messages reçus
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const player = players.find(p => p.id === data.playerId);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.lastKey = data.lastKey;
            }
        }

        if (data.type === 'shoot') {
            bullets.push(data.bullet);
        }

        // Diffuser l'état mis à jour
        broadcastGameState();
    });

    // Gérer la déconnexion
    ws.on('close', () => {
        players = players.filter(p => p.ws !== ws);
        broadcastGameState(); // Mettre à jour l'état après déconnexion
    });
});

console.log('Serveur WebSocket en cours d\'exécution sur le port 3000.');
