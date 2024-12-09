const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
 
// Variables du jeu
let player1 = { x: 50, y: 250, width: 20, height: 20, color: 'green', score: 0 };
let player2 = { x: 730, y: 250, width: 20, height: 20, color: 'brown', score: 0 };
let bullets = [];
const bulletSpeed = 5;
const keys = {};
const obstacles = [
    { x: 200, y: 150, width: 50, height: 50 },
    { x: 400, y: 300, width: 50, height: 50 },
    { x: 600, y: 100, width: 50, height: 50 }
];

const stratPoint = [
    { x: 250, y: 250, width: 120, height: 90, active: false },
    { x: 500, y: 10, width: 70, height: 140, active: true },
];
 
// Timer
let timeRemaining = 90;
let gameOver = false;

// Score
let timeOnPoint = 0;

const maxPoint = 255;
 
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

// Dessin des obstacles
function drawStratPoint() {
    ctx.fillStyle = 'blue';
    stratPoint.forEach(point => {

        if(point.active == true){
            ctx.fillRect(point.x, point.y, point.width, point.height);
            ctx.strokeStyle = 'red';
            ctx.strokeRect(point.x, point.y, point.width, point.height);
        }
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
    if (timeRemaining > 0 && !gameOver && onPointPlayer() != false) {
        timeRemaining--;
    } else if (timeRemaining === 0) {
        gameOver = true;
    }
}

// Vérification de qui est sur le point Strat
function onPointPlayer(){

    let currentPoint = stratPoint.find(x => x.active);

    if(checkInsideObject(player1, currentPoint) && checkInsideObject(player2, currentPoint)){
        console.error("player 1 et 2");
        return true
    }
    else if(checkInsideObject(player1, currentPoint)){
        console.error("player 1 sur le ");
        return false
    }
    else if(checkInsideObject(player2, currentPoint)){
        console.error("player 2 sur le ");
        return false
    }
 
}

// Vérification de collision entre deux objets
function checkInsideObject(obj1, obj2) {
    return (
        obj1.x >= obj2.x && // obj1 est à droite ou sur la gauche de obj2
        obj1.y >= obj2.y && // obj1 est en dessous ou sur le dessus de obj2
        obj1.x + obj1.width <= obj2.x + obj2.width && // obj1 est à gauche ou sur la droite de obj2
        obj1.y + obj1.height <= obj2.y + obj2.height // obj1 est au-dessus ou sur le bas de obj2
    );
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
 
        // Collision avec joueurs
        if (
            bullet.direction === 'right' &&
            bullet.x > player2.x &&
            bullet.y > player2.y &&
            bullet.y < player2.y + player2.height
        ) {
            player1.score++;
            updateScoreDisplay();
            return false; // Supprime la balle
        }
        if (
            bullet.direction === 'left' &&
            bullet.x < player1.x + player1.width &&
            bullet.y > player1.y &&
            bullet.y < player1.y + player1.height
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
    document.getElementById('team1-score').textContent = player1.score;
    document.getElementById('team2-score').textContent = player2.score;
}
 
// Déplacement des balles
function moveBullets() {
    bullets.forEach(bullet => {
        bullet.x += bullet.direction === 'right' ? bulletSpeed : -bulletSpeed;
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width); // Retire les balles hors de l'écran
}
 
// Déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions(player1, player1.x, player1.y - 5)) {
        player1.y -= 5;
    }
    if (keys['s'] && player1.y < canvas.height - player1.height && !checkObstacleCollisions(player1, player1.x, player1.y + 5)) {
        player1.y += 5;
    }
    if (keys['a'] && player1.x > 0 && !checkObstacleCollisions(player1, player1.x - 5, player1.y)) {
        player1.x -= 5;
    }
    if (keys['d'] && player1.x < canvas.width - player1.width && !checkObstacleCollisions(player1, player1.x + 5, player1.y)) {
        player1.x += 5;
    }
 
    if (keys['ArrowUp'] && player2.y > 0 && !checkObstacleCollisions(player2, player2.x, player2.y - 5)) {
        player2.y -= 5;
    }
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height && !checkObstacleCollisions(player2, player2.x, player2.y + 5)) {
        player2.y += 5;
    }
    if (keys['ArrowLeft'] && player2.x > 0 && !checkObstacleCollisions(player2, player2.x - 5, player2.y)) {
        player2.x -= 5;
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !checkObstacleCollisions(player2, player2.x + 5, player2.y)) {
        player2.x += 5;
    }
}
 
// Fonction pour tirer des balles
function shootBullet(player, direction) {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction
    });
}
 
// Boucle principale du jeu
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }
 
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    drawObstacles();
    drawStratPoint();
    drawPlayer(player1);
    drawPlayer(player2);
    movePlayers();
    moveBullets();
    checkBulletCollisions();
    onPointPlayer();
 
    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
 
    drawTimer();
    requestAnimationFrame(gameLoop);
}
 
// Gestion des événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet(player1, 'right');
    if (e.key === 'Enter') shootBullet(player2, 'left');
});
document.addEventListener('keyup', e => keys[e.key] = false);
 
// Lancer le timer
setInterval(updateTimer, 1000);
 
// Démarrage du jeu
gameLoop();
 