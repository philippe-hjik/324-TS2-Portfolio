// main.js
import { gameLoop, player1, player2, keys, gameOver, timeRemaining } from './game.js';
import { updateTimerDisplay, updateScoreDisplay } from './ui.js';

document.addEventListener('keydown', (e) => {
    keys[e.key] = true; // Met à jour l'état des touches
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Réinitialise l'état de la touche
});

// Timer et démarrage du jeu
setInterval(() => {
    if (gameOver) return;

    // Réduit le temps toutes les secondes
    if (timeRemaining > 0) {
        timeRemaining--;
    } else {
        gameOver = true;
    }
}, 1000);

// Appeler la boucle du jeu
gameLoop();
