// Variables du jeu
export let player1 = { x: 50, y: 250, width: 20, height: 20, color: 'green', score: 0 };
export let player2 = { x: 430, y: 250, width: 20, height: 20, color: 'brown', score: 0 };
export let bullets = []; // Tableau des balles
const bulletSpeed = 5;
const keys = {}; // Pour suivre les touches enfoncées
const bulletSize = 5;

// Création et mise à jour des éléments joueurs dans le DOM
function ensurePlayerElement(player, className) {
    let playerElement = document.querySelector(`.${className}`);
    if (!playerElement) {
        playerElement = document.createElement('div');
        playerElement.className = className;
        playerElement.style.position = 'absolute';
        playerElement.style.width = `${player.width}px`;
        playerElement.style.height = `${player.height}px`;
        playerElement.style.backgroundColor = player.color;
        map.appendChild(playerElement);
    }
    return playerElement;
}

// Met à jour la position du joueur dans le DOM
export function drawPlayer(player, className) {
    const playerElement = ensurePlayerElement(player, className);
    playerElement.style.left = `${player.x}px`;
    playerElement.style.top = `${player.y}px`;
}

// Gère le tir d'une balle
function shootBullet(player, direction) {
    const bullet = {
        x: player.x + player.width / 2 - bulletSize / 2,
        y: player.y + player.height / 2 - bulletSize / 2,
        direction: direction
    };
    bullets.push(bullet);
}

// Déplace les balles
function moveBullets() {
    bullets.forEach(bullet => {
        if (bullet.direction === 'right') {
            bullet.x += bulletSpeed;
        } else if (bullet.direction === 'left') {
            bullet.x -= bulletSpeed;
        }
    });

    // Retirer les balles hors de l'écran
    bullets = bullets.filter(bullet => bullet.x >= 0 && bullet.x <= map.offsetWidth);
}

// Gère le mouvement des joueurs
function movePlayers() {
    if (keys['w'] && player1.y > 0) player1.y -= 5; // Déplacement vers le haut
    if (keys['s'] && player1.y < map.offsetHeight - player1.height) player1.y += 5; // Déplacement vers le bas
    if (keys['a'] && player1.x > 0) player1.x -= 5; // Déplacement vers la gauche
    if (keys['d'] && player1.x < map.offsetWidth - player1.width) player1.x += 5; // Déplacement vers la droite

    if (keys['ArrowUp'] && player2.y > 0) player2.y -= 5; // Déplacement vers le haut
    if (keys['ArrowDown'] && player2.y < map.offsetHeight - player2.height) player2.y += 5; // Déplacement vers le bas
    if (keys['ArrowLeft'] && player2.x > 0) player2.x -= 5; // Déplacement vers la gauche
    if (keys['ArrowRight'] && player2.x < map.offsetWidth - player2.width) player2.x += 5; // Déplacement vers la droite
}

// Met à jour les scores
function updateScoreDisplay() {
    document.getElementById('team1-score').textContent = `Team 1: ${player1.score}`;
    document.getElementById('team2-score').textContent = `Team 2: ${player2.score}`;
}

// Boucle principale du jeu
export function gameLoop() {
    movePlayers();
    moveBullets();
    drawPlayer(player1, 'player1');
    drawPlayer(player2, 'player2');
    checkBulletCollisions();
    requestAnimationFrame(gameLoop);
}

// Vérification des collisions des balles avec les joueurs
function checkBulletCollisions() {
    bullets = bullets.filter(bullet => {
        // Collision avec player1
        if (bullet.direction === 'left' && bullet.x < player1.x + player1.width && bullet.y > player1.y && bullet.y < player1.y + player1.height) {
            player2.score++; // Augmente le score de player2
            updateScoreDisplay();
            return false; // Retirer la balle
        }

        // Collision avec player2
        if (bullet.direction === 'right' && bullet.x > player2.x && bullet.y > player2.y && bullet.y < player2.y + player2.height) {
            player1.score++; // Augmente le score de player1
            updateScoreDisplay();
            return false; // Retirer la balle
        }

        return true; // Garde la balle si aucune collision
    });
}

// Gestion des événements clavier
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') shootBullet(player1, 'right'); // Player 1 tire avec la barre d'espace
    if (e.key === 'Enter') shootBullet(player2, 'left'); // Player 2 tire avec Enter
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Fonction d'initialisation
export function startGame() {
    gameLoop(); // Démarre la boucle de jeu
}
