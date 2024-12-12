const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables du jeu
let player1 = { x: 50, y: 250, width: 30, height: 30, color: 'green', score: 0, ammo: 10, lastKey: 'right' };
let player2 = { x: 730, y: 250, width: 30, height: 30, color: 'brown', score: 0, ammo: 10, lastKey: 'left' };
let bullets = [];
const bulletSpeed = 15;
const maxAmmo = 10;
const keys = {};
const obstacles = [
    { x: 200, y: 150, width: 50, height: 50 },
    { x: 400, y: 300, width: 50, height: 50 },
    { x: 600, y: 100, width: 50, height: 50 }
];

// Timer
let timeRemaining = 5;
let gameOver = false;

// Dessin des joueurs
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// Dessin des obstacles
function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        ctx.strokeStyle = 'black';
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Fonction pour afficher le timer
function drawTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    if (seconds < 10) seconds = '0' + seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

// Mise à jour du timer
function updateTimer() {
    if (timeRemaining > 0 && !gameOver) {
        timeRemaining--;
    } else if (timeRemaining === 0) {
        gameOver = true;
    }
}

// Vérification de collision entre deux objets
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Vérification des collisions avec les obstacles
function checkObstacleCollisions(player, newX, newY) {
    return obstacles.some(obstacle =>
        checkCollision(
            { x: newX, y: newY, width: player.width, height: player.height },
            obstacle
        )
    );
}

// Gestion des collisions des balles avec obstacles et joueurs
function checkBulletCollisions() {
    bullets = bullets.filter(bullet => {
        // Collision avec obstacles
        for (let obstacle of obstacles) {
            if (
                bullet.x + 5 > obstacle.x &&
                bullet.x < obstacle.x + obstacle.width &&
                bullet.y > obstacle.y &&
                bullet.y < obstacle.y + obstacle.height
            ) {
                return false; // Supprime la balle
            }
        }

        // Collision avec le joueur 2
        if (
            bullet.owner === 'player1' &&
            checkCollision({ x: bullet.x, y: bullet.y, width: 5, height: 5 }, player2)
        ) {
            player1.score++;
            updateScoreDisplay();
            return false; // Supprime la balle
        }

        // Collision avec le joueur 1
        if (
            bullet.owner === 'player2' &&
            checkCollision({ x: bullet.x, y: bullet.y, width: 5, height: 5 }, player1)
        ) {
            player2.score++;
            updateScoreDisplay();
            return false; // Supprime la balle
        }

        return true; // Conserve la balle
    });
}

// Mise à jour des scores
function updateScoreDisplay() {
    document.getElementById('scorePlayer1').textContent = player1.score;
    document.getElementById('scorePlayer2').textContent = player2.score;
}

// Mise à jour des munitions
function updateAmmoDisplay() {
    document.getElementById('ammoPlayer1').textContent = player1.ammo;
    document.getElementById('ammoPlayer2').textContent = player2.ammo;
}

// Recharge automatique des munitions
function reloadAmmo() {
    if (player1.ammo < maxAmmo) player1.ammo++;
    if (player2.ammo < maxAmmo) player2.ammo++;
    updateAmmoDisplay();
}

// Déplacement des balles
function moveBullets() {
    bullets.forEach(bullet => {
        switch (bullet.direction) {
            case 'right':
                bullet.x += bulletSpeed;
                break;
            case 'left':
                bullet.x -= bulletSpeed;
                break;
            case 'up':
                bullet.y -= bulletSpeed;
                break;
            case 'down':
                bullet.y += bulletSpeed;
                break;
        }
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width && bullet.y > 0 && bullet.y < canvas.height); // Retire les balles hors de l'écran
}

// Déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions(player1, player1.x, player1.y - 5)) {
        player1.y -= 5;
        player1.lastKey = 'up';
    }
    if (keys['s'] && player1.y < canvas.height - player1.height && !checkObstacleCollisions(player1, player1.x, player1.y + 5)) {
        player1.y += 5;
        player1.lastKey = 'down';
    }
    if (keys['a'] && player1.x > 0 && !checkObstacleCollisions(player1, player1.x - 5, player1.y)) {
        player1.x -= 5;
        player1.lastKey = 'left';
    }
    if (keys['d'] && player1.x < canvas.width - player1.width && !checkObstacleCollisions(player1, player1.x + 5, player1.y)) {
        player1.x += 5;
        player1.lastKey = 'right';
    }

    if (keys['ArrowUp'] && player2.y > 0 && !checkObstacleCollisions(player2, player2.x, player2.y - 5)) {
        player2.y -= 5;
        player2.lastKey = 'up';
    }
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height && !checkObstacleCollisions(player2, player2.x, player2.y + 5)) {
        player2.y += 5;
        player2.lastKey = 'down';
    }
    if (keys['ArrowLeft'] && player2.x > 0 && !checkObstacleCollisions(player2, player2.x - 5, player2.y)) {
        player2.x -= 5;
        player2.lastKey = 'left';
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !checkObstacleCollisions(player2, player2.x + 5, player2.y)) {
        player2.x += 5;
        player2.lastKey = 'right';
    }
}

// Fonction pour tirer des balles
function shootBullet(player) {
    if (player.ammo > 0) {
        bullets.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            direction: player.lastKey,
            owner: player === player1 ? 'player1' : 'player2'
        });
        player.ammo--;
        updateAmmoDisplay();
    }
}

// Fonction pour recharger la page
function reloadPage() {
    location.reload();
}

// Boucle principale du jeu
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.textAlign = 'center';
        if (player1.score > player2.score) {
            ctx.fillStyle = 'green';
            ctx.fillText('Player green Wins!', canvas.width / 2, canvas.height / 2.3);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        } else if (player2.score > player1.score) {
            ctx.fillStyle = 'red';
            ctx.fillText('Player red Wins!', canvas.width / 2, canvas.height / 2.3);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        } else {
            ctx.fillText("It's a Draw!", canvas.width / 2, canvas.height / 2.3);
            ctx.font = '40px Arial';
            ctx.fillText('Press F5 to Restart', canvas.width / 2, canvas.height / 1.5);
        }
        return;
    }


    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawObstacles();
    drawPlayer(player1);
    drawPlayer(player2);
    movePlayers();
    moveBullets();
    checkBulletCollisions();

    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.owner === 'player1' ? 'green' : 'brown';
        ctx.fillRect(bullet.x, bullet.y, 8, 8);
    });

    drawTimer();
    requestAnimationFrame(gameLoop);
}

// Gestion des événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && player1.ammo > 0 && !gameOver) shootBullet(player1);
    if (e.key === 'Enter' && player2.ammo > 0 && !gameOver) shootBullet(player2);
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Recharge automatique des munitions toutes les secondes
setInterval(reloadAmmo, 1000);

// Lancer le timer
setInterval(updateTimer, 1000);

// Démarrage du jeu
gameLoop();
