// game.js

import { checkCollision, checkObstacleCollisions } from './utils.js';
import { updateScoreDisplay, updateTimerDisplay } from './ui.js';
import { moveBullets, bullets } from './bullet.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Initialisation des joueurs
export let player1 = { x: 50, y: 250, width: 20, height: 20, color: 'green', score: 0 };
export let player2 = { x: 730, y: 250, width: 20, height: 20, color: 'brown', score: 0 };

export const obstacles = [
    { x: 200, y: 150, width: 50, height: 50 },
    { x: 400, y: 300, width: 50, height: 50 },
    { x: 600, y: 100, width: 50, height: 50 }
];
export let timeRemaining = 90;
export let gameOver = false; // Déclarez gameOver ici

// Déclaration de l'objet keys
export const keys = {};

// Dessin des joueurs
export function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// Dessin des obstacles
export function drawObstacles() {
    ctx.fillStyle = 'gray';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

// Gestion des mouvements des joueurs
export function movePlayers() {
    if (keys['w'] && player1.y > 0 && !checkObstacleCollisions(player1, obstacles, player1.x, player1.y - 5)) {
        player1.y -= 5;
    }
    if (keys['s'] && player1.y < canvas.height - player1.height && !checkObstacleCollisions(player1, obstacles, player1.x, player1.y + 5)) {
        player1.y += 5;
    }
    if (keys['a'] && player1.x > 0 && !checkObstacleCollisions(player1, obstacles, player1.x - 5, player1.y)) {
        player1.x -= 5;
    }
    if (keys['d'] && player1.x < canvas.width - player1.width && !checkObstacleCollisions(player1, obstacles, player1.x + 5, player1.y)) {
        player1.x += 5;
    }

    if (keys['ArrowUp'] && player2.y > 0 && !checkObstacleCollisions(player2, obstacles, player2.x, player2.y - 5)) {
        player2.y -= 5;
    }
    if (keys['ArrowDown'] && player2.y < canvas.height - player2.height && !checkObstacleCollisions(player2, obstacles, player2.x, player2.y + 5)) {
        player2.y += 5;
    }
    if (keys['ArrowLeft'] && player2.x > 0 && !checkObstacleCollisions(player2, obstacles, player2.x - 5, player2.y)) {
        player2.x -= 5;
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width && !checkObstacleCollisions(player2, obstacles, player2.x + 5, player2.y)) {
        player2.x += 5;
    }
}

// Fonction de tir
export function shootBullet(player, direction) {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        direction
    });
}

// Boucle de jeu
export function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 90, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObstacles();
    drawPlayer(player1);
    drawPlayer(player2);

    movePlayers();
    moveBullets();

    updateTimerDisplay(timeRemaining);
    updateScoreDisplay(player1.score, player2.score);

    requestAnimationFrame(gameLoop);
}
