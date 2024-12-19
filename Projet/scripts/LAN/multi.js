const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables des joueurs (seront synchronisées via WebSocket)
let player1 = { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 15, lastKey: 'right', weaponOffset: { x: 35, y: 12 } };
let player2 = { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 15, lastKey: 'left', weaponOffset: { x: -5, y: 12 } };
let bullets = [];
let obstacles = [];
let ammoDrops = [];
let keys = {};
let playerId; // ID du joueur local (1 ou 2)
const bulletSpeed = 15;
const playerSpeed = 7;
const maxAmmo = 30;

// Reconnecte au serveur WebSocket
let socket;
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
            player1 = message.players[0];
            player2 = message.players[1];
            bullets = message.bullets;
            obstacles = message.obstacles;
        }
    };

    socket.onclose = () => console.log('Déconnecté du serveur.');
    socket.onerror = (error) => console.error('Erreur WebSocket :', error);
}

// Génération des obstacles aléatoires
function generateRandomObstacles(count) {
    obstacles = [];
    while (obstacles.length < count) {
        const obstacleX = Math.random() * (canvas.width - 50);
        const obstacleY = Math.random() * (canvas.height - 50);
        const newObstacle = { x: obstacleX, y: obstacleY, width: 50, height: 50 };

        const isColliding = obstacles.some(obstacle => checkCollision(obstacle, newObstacle)) ||
            checkCollision(newObstacle, player1) || checkCollision(newObstacle, player2);

        if (!isColliding) {
            obstacles.push(newObstacle);
        }
    }
}

// Déplacement local
function movePlayer(player) {
    if (keys['w'] && player.y > 0 && !checkObstacleCollisions(player, player.x, player.y - playerSpeed)) {
        player.y -= playerSpeed;
        player.lastKey = 'up';
    }
    if (keys['s'] && player.y < canvas.height - player.height && !checkObstacleCollisions(player, player.x, player.y + playerSpeed)) {
        player.y += playerSpeed;
        player.lastKey = 'down';
    }
    if (keys['a'] && player.x > 0 && !checkObstacleCollisions(player, player.x - playerSpeed, player.y)) {
        player.x -= playerSpeed;
        player.lastKey = 'left';
    }
    if (keys['d'] && player.x < canvas.width - player.width && !checkObstacleCollisions(player, player.x + playerSpeed, player.y)) {
        player.x += playerSpeed;
        player.lastKey = 'right';
    }

    // Envoyer les nouvelles coordonnées au serveur
    if (socket) {
        socket.send(JSON.stringify({
            type: 'move',
            playerId,
            x: player.x,
            y: player.y,
            lastKey: player.lastKey
        }));
    }
}

// Vérification des collisions
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

function checkObstacleCollisions(player, newX, newY) {
    return obstacles.some(obstacle =>
        checkCollision(
            { x: newX, y: newY, width: player.width, height: player.height },
            obstacle
        )
    );
}

// Dessiner les joueurs
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(player.x, player.y, player.width, player.height);
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
        ctx.fillStyle = bullet.owner === 'player1' ? 'green' : 'brown';
        ctx.fillRect(bullet.x, bullet.y, 10, 10);
    });
}

// Tirer une balle
function shootBullet(player) {
    if (player.ammo > 0) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            direction: player.lastKey,
            owner: player === player1 ? 'player1' : 'player2'
        });
        player.ammo--;
        socket.send(JSON.stringify({ type: 'shoot', bullet: bullets[bullets.length - 1] }));
    }
}

// Boucle principale
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawPlayer(player1);
    drawPlayer(player2);
    drawBullets();
    moveBullets();

    if (playerId === 1) movePlayer(player1);
    else movePlayer(player2);

    requestAnimationFrame(gameLoop);
}

// Gestion des touches
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && playerId === 1) shootBullet(player1);
    if (e.key === 'Enter' && playerId === 2) shootBullet(player2);
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Initialisation
generateRandomObstacles(5);
reconnectToServer();
gameLoop();
