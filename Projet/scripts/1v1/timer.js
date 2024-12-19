import { timeRemaining, gameOver } from './game.js';

export function updateTimer() {
    if (timeRemaining > 0 && !gameOver) {
        timeRemaining--;
    } else if (timeRemaining === 0) {
        gameOver = true;
    }
}

export function drawTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    if (seconds < 10) seconds = '0' + seconds;
    timerDisplay.textContent = `${minutes}:${seconds}`;
}