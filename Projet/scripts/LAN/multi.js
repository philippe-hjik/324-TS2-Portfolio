const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let socket; // WebSocket pour la communication
let playerId; // Identifiant du joueur (1 pour Vert, 2 pour Rouge)

// Variables des joueurs
let players = {
    1: { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 15, lastKey: 'right' },
    2: { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 15, lastKey: 'left' },
};

let bullets = [];
let keys = {};
const playerSpeed = 7;
const bulletSpeed = 15;

// Connectez-vous au serveur WebSocket
function connectToServer() {
    socket = new WebSocket('ws://<SERVER_IP>:3000'); // Remplacez <SERVER_IP> par l'adresse IP du serveur

    socket.onopen = () => {
        console.log('Connecté au serveur.');
        socket.send(JSON.stringify({ type: 'join' })); // Informez le serveur qu'un joueur se connecte
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'assignPlayer') {
            playerId = message.playerId; // Le serveur assigne un ID au joueur
            console.log(`Vous êtes le joueur ${playerId}.`);
        }

        if (message.type === 'updateState') {
            players = message.players; // Synchronisez l'état des joueurs
            bullets = message.bullets; // Synchronisez les balles
        }

        if (message.type === 'startGame') {
            console.log('Le jeu commence !');
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

// Déplacer les joueurs localement
function movePlayers() {
    if (!playerId) return;

    const player = players[playerId];
    if (keys['w'] && player.y > 0) player.y -= playerSpeed;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += playerSpeed;
    if (keys['a'] && player.x > 0) player.x -= playerSpeed;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += playerSpeed;

    // Envoyer les nouvelles coordonnées au serveur
    socket.send(JSON.stringify({
        type: 'move',
        playerId,
        x: player.x,
        y: player.y,
        lastKey: player.lastKey,
    }));
}

// Dessiner les balles
function drawBullets() {
    ctx.fillStyle = 'black';
    bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, 10, 10);
    });
}

// Boucle principale du jeu
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.values(players).forEach(drawPlayer);
    drawBullets();

    movePlayers();

    requestAnimationFrame(gameLoop);
}

// Gestion des événements clavier
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Connectez-vous au serveur et démarrez le jeu
connectToServer();
gameLoop();
