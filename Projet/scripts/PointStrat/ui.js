export function updateScoreboard(scores) {
    document.getElementById('team1-score').textContent = `Team 1: ${scores.team1}`;
    document.getElementById('team2-score').textContent = `Team 2: ${scores.team2}`;
}

export function highlightPoint(point) {
    const map = document.getElementById('map');
    map.innerHTML = ''; // Clear previous point
    const pointElement = document.createElement('div');
    pointElement.style.position = 'absolute';
    pointElement.style.width = '20px';
    pointElement.style.height = '20px';
    pointElement.style.backgroundColor = 'red';
    pointElement.style.borderRadius = '50%';
    pointElement.style.left = `${point.x}px`;
    pointElement.style.top = `${point.y}px`;
    map.appendChild(pointElement);
}
