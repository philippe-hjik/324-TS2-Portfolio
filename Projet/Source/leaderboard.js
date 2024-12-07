document.addEventListener('DOMContentLoaded', () => {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];

    scores.forEach(score => {
        const row = leaderboardTable.insertRow();
        const cellPlayer = row.insertCell(0);
        const cellScore = row.insertCell(1);
        cellPlayer.textContent = score.player;
        cellScore.textContent = score.score;
    });
});