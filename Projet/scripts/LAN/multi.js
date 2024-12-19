const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let socket;
let playerId; // Identifiant du joueur local
let players = {}; // Données des joueurs
let bullets = [];
let obstacles = [];
let keys = {};
const playerSpeed = 7;
const bulletSpeed = 15;

// Reconnexion au serveur
function reconnectToServer() {
    const serverAddress = sessionStorage.getItem('serverAddress');

    if (!serverAddress) {
        alert('Aucune connexion trouvée. Retour à la page de connexion.');
        window.location.href = './LAN.html';
        return;
    }

    socket = new WebSocket(serverAddress);

    socket.onopen = () => {
        console.log('Connecté au serveur.');
        const role = sessionStorage.getItem('playerRole');
        playerId = role === 'green' ? 1 : 2;
        console.log(`Vous êtes le joueur ${role}.`);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'updateState') {
            players = message.players.reduce((acc, player) => {
                acc[player.id] = player;
                return acc;
            }, {});
            bullets = message.bullets;
            obstacles = message.obstacles;
        }
    };

    socket.onclose = () => console.log('Déconnecté du serveur.');
    socket.onerror = (error) => console.error('Erreur WebSocket :', error);
}

// Déplacer localement le joueur
function moveLocalPlayer() {
    const player = players[playerId];
    if (!player) return;

    if (keys['w'] && player.y > 0) player.y -= playerSpeed;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += playerSpeed;
    if (keys['a'] && player.x > 0) player.x -= playerSpeed;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += playerSpeed;

    // Envoyer les nouvelles coordonnées au serveur
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: 'move',
            playerId,
            x: player.x,
            y: player.y,
            lastKey: player.lastKey
        }));
    }
}

// Dessiner les joueurs
function drawPlayers() {
    Object.values(players).forEach(player => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    });
}

// Dessiner les obstacles
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Déplacement des balles
function moveBullets() {
    bullets.forEach(bullet => {
        switch (bullet.direction) {
            case 'right': bullet.x += bulletSpeed; break;
            case 'left': bullet.x -= bulletSpeed; break;
            case 'up': bullet.y -= bulletSpeed; break;
            case 'down': bullet.y += bulletSpeed; break;
        }
    });

    bullets = bullets.filter(bullet =>
        bullet.x > 0 && bullet.x < canvas.width &&
        bullet.y > 0 && bullet.y < canvas.height
    );
}

// Dessiner les balles
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.owner === 1 ? 'green' : 'brown';
        ctx.fillRect(bullet.x, bullet.y, 10, 10);
    });
}

// Tirer une balle
function shootBullet() {
    const player = players[playerId];
    if (!player || player.ammo <= 0) return;

    const bullet = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction: player.lastKey,
        owner: playerId,
    };

    bullets.push(bullet);

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'shoot', bullet }));
    }

    player.ammo--;
}

// Boucle principale du jeu
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawPlayers();
    drawBullets();
    moveBullets();
    moveLocalPlayer();

    requestAnimationFrame(gameLoop);
}

// Gestion des touches
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Enter') shootBullet();
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Initialisation
reconnectToServer();
gameLoop();
