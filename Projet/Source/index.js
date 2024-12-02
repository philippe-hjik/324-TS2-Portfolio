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
           
// Timer
let timeRemaining = 90;
let gameOver = false;  
 
// Dessin des joueurs
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
 
    // Dessin d'un contour pour donner un effet 3D
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
 
// Fonction pour afficher le temps restant dans le header
function drawTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    if (seconds < 10) seconds = '0' + seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;
}
 
// Fonction pour mettre à jour le timer
function updateTimer() {
    if (timeRemaining > 0 && !gameOver) {
        timeRemaining--;
    } else if (timeRemaining === 0) {
        gameOver = true;  // Arrêter le jeu une fois que le temps est écoulé
    }
}
 
function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}
 
function checkObstacleCollisions(player) {
    return obstacles.some(obstacle => checkCollision(player, obstacle));
}
 
function checkPlayerCollisions() {
    // Vérifier si les deux joueurs se touchent
    if (checkCollision(player1, player2)) {
        // Incrémenter le score du joueur qui touche l'autre
        player1.score++;  
        player2.score++;  
 
        // Mettre à jour l'affichage des scores dans le DOM
        updateScoreDisplay();
    }
}
 
// Vérification des collisions entre balles et joueurs
function checkBulletCollisions() {
    bullets.forEach(bullet => {
        if (bullet.direction === 'right' &&
            bullet.x > player2.x &&
            bullet.y > player2.y &&
            bullet.y < player2.y + player2.height) {
            // Si la balle touche le joueur 2
            player1.score++;  // Joueur 1 gagne un point
            bullet.x = -10; // Supprimer la balle
            updateScoreDisplay();  // Mettre à jour l'affichage du score
        }
       
        if (bullet.direction === 'left' &&
            bullet.x < player1.x + player1.width &&
            bullet.y > player1.y &&
            bullet.y < player1.y + player1.height) {
            // Si la balle touche le joueur 1
            player2.score++;  // Joueur 2 gagne un point
            bullet.x = -10; // Supprimer la balle
            updateScoreDisplay();  // Mettre à jour l'affichage du score
        }
    });
}
 
// Boucle de déplacement des balles
function moveBullets() {
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width);  // Supprimer les balles hors de l'écran
    bullets.forEach(bullet => {
        bullet.x += bullet.direction === 'right' ? bulletSpeed : -bulletSpeed; // Déplacement de la balle
    });
}
 
// Met à jour l'affichage du score
function updateScoreDisplay() {
    document.getElementById('scorePlayer1').textContent = player1.score;
    document.getElementById('scorePlayer2').textContent = player2.score;
}
 
// Fonction de gestion du déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions({ x: player1.x, y: player1.y - 5, width: player1.width, height: player1.height }) && !checkCollision(player1, player2)) {
        player1.y -= 5;
    }
    if (keys['s'] && player1.y < canvas.height - player1.height && !checkObstacleCollisions({ x: player1.x, y: player1.y + 5, width: player1.width, height: player1.height }) && !checkCollision(player1, player2)) {
        player1.y += 5;
    }
    if (keys['a'] && player1.x > 0 && !checkObstacleCollisions({ x: player1.x - 5, y: player1.y, width: player1.width, height: player1.height }) && !checkCollision(player1, player2)) {
        player1.x -= 5;
    }
    if (keys['d'] && player1.x < canvas.width - player1.width && !checkObstacleCollisions({ x: player1.x + 5, y: player1.y, width: player1.width, height: player1.height }) && !checkCollision(player1, player2)) {
        player1.x += 5;
    }
 
    if (keys['ArrowUp'] && player2.y > 0 && !checkObstacleCollisions({ x: player2.x, y: player2.y - 5, width: player2.width, height: player2.height }) && !checkCollision(player2, player1)) {
        player2.y -= 5;
    }
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height && !checkObstacleCollisions({ x: player2.x, y: player2.y + 5, width: player2.width, height: player2.height }) && !checkCollision(player2, player1)) {
        player2.y += 5;
    }
    if (keys['ArrowLeft'] && player2.x > 0 && !checkObstacleCollisions({ x: player2.x - 5, y: player2.y, width: player2.width, height: player2.height }) && !checkCollision(player2, player1)) {
        player2.x -= 5;
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !checkObstacleCollisions({ x: player2.x + 5, y: player2.y, width: player2.width, height: player2.height }) && !checkCollision(player2, player1)) {
        player2.x += 5;
    }
}
 
// Fonction de tir des balles
function shootBullet(player, direction) {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction
    });
}
 
// Boucle de jeu principale
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
        return; // Arrêter le jeu lorsque le temps est écoulé
    }
 
    ctx.fillStyle = '#2e2e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
    drawObstacles();
    drawPlayer(player1);
    drawPlayer(player2);
    movePlayers();
    moveBullets();
    checkPlayerCollisions();  // Vérifier les collisions entre les joueurs
    checkBulletCollisions();  // Vérifier les collisions entre les balles et les joueurs
 
    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
 
    drawTimer(); // Afficher le timer
    requestAnimationFrame(gameLoop);
}
 
// Événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet(player1, 'right');
    if (e.key === 'Enter') shootBullet(player2, 'left');
});
document.addEventListener('keyup', e => keys[e.key] = false);
 
// Démarrer le timer
setInterval(updateTimer, 1000);
 
// Démarrage du jeu
gameLoop();