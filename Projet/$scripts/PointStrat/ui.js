
// Mise à jour des scores
export function updateScoreDisplay(player1Score, player2Score) {
    document.getElementById('team1-score').textContent = `Team 1: ${player1Score}`;
    document.getElementById('team2-score').textContent = `Team 2: ${player2Score}`;
}

// Mise à jour du timer
export function updateTimerDisplay(timeRemaining) {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    if (seconds < 10) seconds = '0' + seconds;
    document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
}
