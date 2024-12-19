const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let socket;
let playerId;
let players = {
    1: { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 15 },
    2: { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 15 },
};
let bullets = [];
let obstacles = [];
let keys = {};
const playerSpeed = 7;

// Reconnexion au serveur
function reconnectToServer() {
    const serverAddress = sessionStorage.getItem('serverAddress');

    if (!serverAddress) {
        alert('Aucune information de connexion trouvée. Retour à la page de connexion.');
        window.location.href = './LAN.html';
        return;
    }

    socket = new WebSocket(serverAddress);

    socket.onopen = () => {
        console.log('Reconnecté au serveur.');
        const role = sessionStorage.getItem('playerRole');
        playerId = role === 'green' ? 1 : 2;
        console.log(`Vous êtes le joueur ${role}.`);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'updateState') {
            players = message.players;
            bullets = message.bullets;
            obstacles = message.obstacles;
        }
    };

    socket.onclose = () => console.log('Déconnecté du serveur.');
    socket.onerror = (error) => console.error('Erreur WebSocket :', error);
}

// Dessiner un joueur
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Dessiner les balles
function drawBullets() {
    ctx.fillStyle = 'black';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 10, 10);
    });
}

// Dessiner les obstacles
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Déplacement local des joueurs
function movePlayer() {
    const player = players[playerId];
    if (keys['w'] && player.y > 0) player.y -= playerSpeed;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += playerSpeed;
    if (keys['a'] && player.x > 0) player.x -= playerSpeed;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += playerSpeed;

    // Envoyer les mouvements au serveur
    socket.send(JSON.stringify({
        type: 'move',
        playerId,
        x: player.x,
        y: player.y,
    }));
}

// Boucle principale
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    Object.values(players).forEach(drawPlayer);
    drawBullets();

    movePlayer();

    requestAnimationFrame(gameLoop);
}

// Gestion des entrées clavier
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Reconnexion et lancement du jeu
reconnectToServer();
gameLoop();
