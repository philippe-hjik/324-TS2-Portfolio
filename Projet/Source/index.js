const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables du jeu
let player1 = { x: 50, y: 250, width: 20, height: 20, color: 'red', score: 0 };
let player2 = { x: 730, y: 250, width: 20, height: 20, color: 'blue', score: 0 };
let bullets = [];
const bulletSpeed = 5;
const keys = {};

// Dessin des joueurs
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0) player1.y -= 5;
    if (keys['s'] && player1.y < canvas.height - player1.height) player1.y += 5;
    if (keys['ArrowUp'] && player2.y > 0) player2.y -= 5;
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height) player2.y += 5;
}

// Gestion des tirs
function shootBullet(player, direction) {
    bullets.push({ x: player.x + player.width / 2, y: player.y + player.height / 2, direction });
}

// Déplacement des balles
function moveBullets() {
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width);
    bullets.forEach(bullet => {
        bullet.x += bullet.direction === 'right' ? bulletSpeed : -bulletSpeed;
    });
}

// Collision des balles
function checkCollisions() {
    bullets.forEach(bullet => {
        if (
            bullet.direction === 'right' &&
            bullet.x > player2.x &&
            bullet.y > player2.y &&
            bullet.y < player2.y + player2.height
        ) {
            player1.score++;
            bullet.x = -10; // Supprime la balle
        }
        if (
            bullet.direction === 'left' &&
            bullet.x < player1.x + player1.width &&
            bullet.y > player1.y &&
            bullet.y < player1.y + player1.height
        ) {
            player2.score++;
            bullet.x = -10; // Supprime la balle
        }
    });
}

// Boucle du jeu
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(player1);
    drawPlayer(player2);
    movePlayers();
    moveBullets();
    bullets.forEach(bullet => {
        ctx.fillStyle = 'black';
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

// Événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet(player1, 'right');
    if (e.key === 'Enter') shootBullet(player2, 'left');
});
document.addEventListener('keyup', e => keys[e.key] = false);

// Démarrage
gameLoop();
