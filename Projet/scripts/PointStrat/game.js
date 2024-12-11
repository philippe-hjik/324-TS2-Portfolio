const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
 
// Variables du jeu
let player1 = { id: 1, x: 50, y: 250, width: 20, height: 20, color: 'green', score: 0, lastKey: 'right', alive: true };
let player2 = { id: 2, x: 730, y: 250, width: 20, height: 20, color: 'brown', score: 0, lastKey: 'left', alive: true };
let bullets = [];
const bulletSpeed = 5;
const keys = {};
const obstacles = [
    { x: 200, y: 150, width: 50, height: 50 },
    { x: 400, y: 300, width: 50, height: 50 },
    { x: 600, y: 100, width: 50, height: 50 }
];

const stratPoint = [
    { x: 250, y: 250, width: 120, height: 90, active: true },
    { x: 300, y: 50, width: 200, height: 70, active: false },
    { x: 700, y: 50, width: 90, height: 140, active: false },
    { x: 70, y: 50, width: 90, height: 140, active: false },
];
 
// Timer
let timeRemaining = 90;
let gameOver = false;

// Score
let timeOnPoint = 0;
let timeAllow = 20;
let timeBeforeNext = timeAllow;
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

function respawnPlayer(player, x, y) {
    
    player.x = x;
    player.y = y;
}
function checkRespawn(){

    if(!player1.alive){

        // Si le player 2 est le plus loin de 0:0 
        if(Math.sqrt(Math.pow(player2.x - 0, 2) + Math.pow(player2.y - 0, 2)) > Math.sqrt(Math.pow(player2.x - canvas.width, 2) +  Math.pow(player2.y - canvas.height, 2))){

            respawnPlayer(player1, player1.width, player2.height);

        }else{
            respawnPlayer(player1, canvas.width - player1.width, canvas.height - player1.height);
        }

        player1.alive = true;
    }
    
    if(!player2.alive){
        // Si le player 2 est le plus loin de 0:0 
        if(Math.sqrt(Math.pow(player1.x-0, 2) +  Math.pow(player1.y - 0, 2)) > Math.sqrt(Math.pow(player1.x - canvas.width, 2) +  Math.pow(player1.y - canvas.height, 2))){

            respawnPlayer(player2, player2.width, player2.height);

        }else{

            respawnPlayer(player2, canvas.width - player2.width, canvas.height - player2.height);
        }
        player2.alive = true;
    }
        
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

        let pointScorer = onPointPlayer(); // Vérifie si un joueur marque un point

        // Marque un point pour un joueur si nécessaire
        if (pointScorer === 1) {
            player1.score++; // Marque un point pour player1
        } else if (pointScorer === 2) {
            player2.score++; // Marque un point pour player2
        }else{
            timeRemaining--;
        }
        timeBeforeNext--;
        // Vérifier toutes les 20 secondes si le point stratégique doit changer
        if (timeBeforeNext <= 0) {
            changeStratPoint(); // Change le point stratégique
            timeBeforeNext = timeAllow; // Met à jour le temps du dernier changement
        }

    } else if (timeRemaining === 0) {
        gameOver = true;
    }
}

// Fonction qui change le point stratégique (ordonné)
function changeStratPoint() {
    
    let currentPoint = stratPoint.find(x => x.active); // Cherche le point actif
    let index = stratPoint.findIndex(x => x.active === true);
    
    if(index !== -1)
    {
        currentPoint.active = false;
        if(index + 1 == stratPoint.length){
            stratPoint[0].active = true;
        }else {
            stratPoint[index + 1].active = true;
        }
    }else{
        console.error("Aucun point actif trouvé");
    }


}
// Vérification de qui est sur le point Strat
function onPointPlayer() {
    let currentPoint = stratPoint.find(x => x.active); // Cherche le point actif

    // Si les deux joueurs sont sur le point
    if (checkInsideObject(player1, currentPoint) && checkInsideObject(player2, currentPoint)) {
        return null; // Aucun joueur ne marque
    }
    
    // Si seulement player1 est sur le point
    else if (checkInsideObject(player1, currentPoint)) {
        return 1; // Player 1 marque un point
    }
    
    // Si seulement player2 est sur le point
    else if (checkInsideObject(player2, currentPoint)) {
        return 2; // Player 2 marque un point
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
            bullet.playerId == 1 &&
            bullet.x == player2.x &&
            bullet.y > player2.y &&
            bullet.y < player2.y + player2.height
        ) {
            // Tue le player 2
            player2.alive = false;
            updateScoreDisplay();
            return false; // Supprime la balle
        }
        if (
            bullet.playerId == 2 &&
            bullet.x == player1.x + player1.width &&
            bullet.y > player1.y &&
            bullet.y < player1.y + player1.height
        ) {
            // Tue le player 1
            player1.alive = false;
            updateScoreDisplay();
            return false; // Supprime la balle
        }
 
        return true; // Conserve la balle
    });
}
 
// Mise à jour des scores
function updateScoreDisplay() {
    document.getElementById('team1-score').textContent = "Team 1: "+ player1.score;
    document.getElementById('team2-score').textContent = "Team 2: "+ player2.score;
    document.getElementById('TimeOnPoint').textContent = timeBeforeNext;
}
 
// Déplacement des balles
function moveBullets() {
    bullets.forEach(bullet => {
        switch(bullet.direction){
            case 'right':
                bullet.x += bulletSpeed;
                break;
            case 'left':
                bullet.x -= bulletSpeed;
                break;
            case 'top':
                bullet.y -= bulletSpeed;
                break;
            case 'down':
                bullet.y += bulletSpeed;
                break;
        }
    });
    bullets = bullets.filter(bullet => bullet.x > 0 && bullet.x < canvas.width || bullet.y > 0 && bullet.y < canvas.height); // Retire les balles hors de l'écran
}
 
// Déplacement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions(player1, player1.x, player1.y - 5)) {
        player1.y -= 5;
        player1.lastKey = 'top';
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
        player2.lastKey = 'top';
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
function shootBullet(player, direction) {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction,
        playerId: player.id
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
    updateScoreDisplay();

    bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, 5, 5);
    });
    checkRespawn();
    drawTimer();
    requestAnimationFrame(gameLoop);
}
 
// Gestion des événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet(player1, player1.lastKey);
    if (e.key === 'Enter') shootBullet(player2, player2.lastKey);
});
document.addEventListener('keyup', e => keys[e.key] = false);
 
// Lancer le timer
setInterval(updateTimer, 1000);
 
// Démarrage du jeu
gameLoop();
 