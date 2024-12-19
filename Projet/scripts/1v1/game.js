import { player1, player2, drawPlayer, movePlayers, shootBullet } from './player.js';
import { generateRandomObstacles, drawObstacles } from './obstacles.js';
import { moveBullets, drawBullets, checkBulletCollisions } from './bullets.js';
import { spawnAmmoDrop, drawAmmoDrops } from './ammo.js';
import { checkCollision, updateTimer } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialisation du jeu
generateRandomObstacles(5, canvas, { player1, player2 }, checkCollision);
setInterval(() => spawnAmmoDrop(canvas, obstacles, checkCollision), 5000);
let timeRemaining = 90;
setInterval(() => timeRemaining = updateTimer(timeRemaining), 1000);

// Boucle principale
function gameLoop() {
    // Votre logique de boucle ici
    requestAnimationFrame(gameLoop);
}
gameLoop();
